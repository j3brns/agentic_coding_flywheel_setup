import { NextRequest, NextResponse } from 'next/server';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP
const MAX_EVENTS_PER_REQUEST = 10;
const MAX_CLIENT_ID_LENGTH = 100;
const MAX_EVENT_NAME_LENGTH = 40;

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

// Validate event name: alphanumeric and underscores only, starts with letter
function isValidEventName(name: string): boolean {
  if (!name || name.length > MAX_EVENT_NAME_LENGTH) return false;
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
}

// Validate client_id: reasonable format and length
function isValidClientId(clientId: string): boolean {
  if (!clientId || clientId.length > MAX_CLIENT_ID_LENGTH) return false;
  // Allow alphanumeric, dots, dashes, underscores
  return /^[a-zA-Z0-9._-]+$/.test(clientId);
}

interface EventPayload {
  name: string;
  params?: Record<string, string | number | boolean>;
}

interface TrackRequest {
  client_id: string;
  events: EventPayload[];
  user_id?: string;
  user_properties?: Record<string, { value: string | number }>;
}

/**
 * Server-side GA4 Measurement Protocol endpoint
 * Bypasses ad blockers and provides reliable tracking
 *
 * POST /api/track
 * Body: { client_id, events: [{ name, params }], user_id?, user_properties? }
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  if (isRateLimited(clientIP)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    return NextResponse.json(
      { error: 'Analytics not configured' },
      { status: 503 }
    );
  }

  try {
    const body: TrackRequest = await request.json();

    // Validate required fields
    if (!body.client_id || !body.events?.length) {
      return NextResponse.json(
        { error: 'Missing client_id or events' },
        { status: 400 }
      );
    }

    // Validate client_id format
    if (!isValidClientId(body.client_id)) {
      return NextResponse.json(
        { error: 'Invalid client_id format' },
        { status: 400 }
      );
    }

    // Limit number of events per request
    if (body.events.length > MAX_EVENTS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_EVENTS_PER_REQUEST} events per request` },
        { status: 400 }
      );
    }

    // Validate all event names
    for (const event of body.events) {
      if (!isValidEventName(event.name)) {
        return NextResponse.json(
          { error: `Invalid event name: ${event.name?.slice(0, 20)}` },
          { status: 400 }
        );
      }
    }

    // Build the Measurement Protocol payload
    const payload = {
      client_id: body.client_id,
      events: body.events.map(event => ({
        name: event.name,
        params: {
          ...event.params,
          engagement_time_msec: 100,
          session_id: body.client_id.split('.')[0] || Date.now().toString(),
        },
      })),
      ...(body.user_id && { user_id: body.user_id }),
      ...(body.user_properties && { user_properties: body.user_properties }),
    };

    // Send to GA4 Measurement Protocol
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('GA4 MP error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to send to analytics' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    configured: !!(GA_MEASUREMENT_ID && GA_API_SECRET),
    measurementId: GA_MEASUREMENT_ID ? `${GA_MEASUREMENT_ID.slice(0, 4)}...` : null,
  });
}

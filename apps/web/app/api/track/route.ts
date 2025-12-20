import { NextRequest, NextResponse } from 'next/server';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_API_SECRET;

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
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    return NextResponse.json(
      { error: 'Analytics not configured' },
      { status: 503 }
    );
  }

  try {
    const body: TrackRequest = await request.json();

    if (!body.client_id || !body.events?.length) {
      return NextResponse.json(
        { error: 'Missing client_id or events' },
        { status: 400 }
      );
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

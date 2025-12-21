import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import {
  ArrowLeft,
  Bot,
  GitBranch,
  GraduationCap,
  Home,
  KeyRound,
  LayoutGrid,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CodeBlock, CommandCard } from "@/components/command-card";

type ToolId =
  | "claude-code"
  | "codex-cli"
  | "gemini-cli"
  | "ntm"
  | "beads"
  | "agent-mail"
  | "ubs"
  | "cass"
  | "cm"
  | "caam"
  | "slb";

type ToolDoc = {
  id: ToolId;
  title: string;
  tagline: string;
  description: string;
  icon: ReactNode;
  accent: string;
  quickStart?: { title: string; code: string };
  commonCommands: Array<{ command: string; description: string }>;
  relatedLinks: Array<{ href: string; label: string }>;
};

const TOOLS: Record<ToolId, ToolDoc> = {
  "claude-code": {
    id: "claude-code",
    title: "Claude Code",
    tagline: "Your primary AI coding agent",
    description:
      "Claude Code is the default agent in the ACFS workflow. Use it for deep reasoning, architecture, and high-confidence edits.",
    icon: <Bot className="h-8 w-8 text-white" />,
    accent: "from-orange-400 to-amber-500",
    quickStart: {
      title: "Quick start",
      code: `# Start an interactive session\ncc\n\n# Or give a direct task\ncc \"add a health check endpoint\"`,
    },
    commonCommands: [
      { command: "cc", description: "Start interactive session" },
      { command: "cc --continue", description: "Resume your last session" },
      { command: "cc /compact", description: "Compress context window" },
    ],
    relatedLinks: [
      { href: "/learn/agent-commands", label: "Agent Commands reference" },
      { href: "/wizard/accounts", label: "Wizard: Set Up Accounts" },
    ],
  },

  "codex-cli": {
    id: "codex-cli",
    title: "Codex CLI",
    tagline: "OpenAI coding agent (secondary perspective)",
    description:
      "Codex CLI is a second agent option in ACFS. It’s great for refactors, structured work, and fast iteration.",
    icon: <GraduationCap className="h-8 w-8 text-white" />,
    accent: "from-emerald-400 to-teal-500",
    quickStart: {
      title: "Quick start",
      code: `# Start an interactive session\ncod\n\n# Or give a direct task\ncod \"add unit tests for utils.ts\"`,
    },
    commonCommands: [
      { command: "cod", description: "Start interactive session" },
      { command: "codex --help", description: "Show all options" },
    ],
    relatedLinks: [
      { href: "/learn/agent-commands", label: "Agent Commands reference" },
      { href: "/wizard/accounts", label: "Wizard: Set Up Accounts" },
    ],
  },

  "gemini-cli": {
    id: "gemini-cli",
    title: "Gemini CLI",
    tagline: "Google coding agent (large-context explorer)",
    description:
      "Gemini CLI is a third agent option. It can be especially useful for broad, exploratory reads across big codebases.",
    icon: <Search className="h-8 w-8 text-white" />,
    accent: "from-blue-400 to-indigo-500",
    quickStart: {
      title: "Quick start",
      code: `# Start an interactive session\ngmi\n\n# Or give a direct task\ngmi \"analyze the project structure\"`,
    },
    commonCommands: [
      { command: "gmi", description: "Start interactive session" },
      { command: "gemini --help", description: "Show all options" },
    ],
    relatedLinks: [
      { href: "/learn/agent-commands", label: "Agent Commands reference" },
      { href: "/wizard/accounts", label: "Wizard: Set Up Accounts" },
    ],
  },

  ntm: {
    id: "ntm",
    title: "Named Tmux Manager (NTM)",
    tagline: "The agent cockpit",
    description:
      "NTM turns tmux into a multi-agent command center: spawn agents, broadcast prompts, and keep work running across SSH disconnects.",
    icon: <LayoutGrid className="h-8 w-8 text-white" />,
    accent: "from-sky-400 to-blue-500",
    quickStart: {
      title: "Quick start",
      code: `# Spawn a session with multiple agents\nntm spawn myproject --cc=2 --cod=1 --gmi=1\n\n# Attach to watch them work\nntm attach myproject\n\n# Send a prompt to all agents\nntm send myproject \"Let’s build something\"`,
    },
    commonCommands: [
      { command: "ntm spawn myproject --cc=2 --cod=1 --gmi=1", description: "Spawn agents" },
      { command: "ntm attach myproject", description: "Attach to the session" },
      { command: "ntm send myproject \"prompt\"", description: "Broadcast a prompt" },
      { command: "ntm palette myproject", description: "Open the command palette" },
    ],
    relatedLinks: [
      { href: "/learn/ntm-palette", label: "NTM Commands reference" },
      { href: "/workflow", label: "Advanced workflow guide" },
    ],
  },

  beads: {
    id: "beads",
    title: "Beads (bd + bv)",
    tagline: "Task graphs + robot triage",
    description:
      "Beads is how ACFS tracks work as a dependency graph. Use `bd` to manage issues and `bv` to analyze the DAG and pick the best next task.",
    icon: <GitBranch className="h-8 w-8 text-white" />,
    accent: "from-emerald-400 to-teal-500",
    quickStart: {
      title: "Quick start",
      code: `# Find tasks you can start right now\nbd ready\n\n# See all open tasks\nbd list --status=open\n\n# Use the robot triage output (JSON)\nbv -robot-triage -recipe high-impact`,
    },
    commonCommands: [
      { command: "bd ready", description: "Show unblocked work" },
      { command: "bd show <id>", description: "View details for an issue" },
      { command: "bd update <id> --status=in_progress", description: "Claim an issue" },
      { command: "bd close <id> --reason=\"Completed\"", description: "Close an issue" },
    ],
    relatedLinks: [
      { href: "/learn/commands", label: "Command Reference" },
      { href: "/workflow", label: "Workflow guide" },
    ],
  },

  "agent-mail": {
    id: "agent-mail",
    title: "MCP Agent Mail",
    tagline: "Gmail for your agents",
    description:
      "Agent Mail is the coordination layer: identities, inbox/outbox, threads, search, and advisory file reservations so agents don’t clobber each other.",
    icon: <KeyRound className="h-8 w-8 text-white" />,
    accent: "from-violet-400 to-purple-500",
    quickStart: {
      title: "Quick start (MCP calls)",
      code: `# Register and fetch mail (conceptual — called via MCP tools)\nensure_project(human_key='/path/to/repo')\nregister_agent(project_key, program='codex-cli', model='gpt-5')\nfetch_inbox(project_key, agent_name='YourAgent')`,
    },
    commonCommands: [
      {
        command: "file_reservation_paths(project_key, agent_name, paths, ttl_seconds)",
        description: "Declare edit intent for files",
      },
      {
        command: "send_message(project_key, sender_name, to=[...], subject, body_md)",
        description: "Coordinate with other agents",
      },
    ],
    relatedLinks: [
      { href: "/workflow", label: "Workflow guide" },
      { href: "/learn/glossary#mcp", label: "Glossary: MCP" },
    ],
  },

  ubs: {
    id: "ubs",
    title: "Ultimate Bug Scanner (UBS)",
    tagline: "Fast, polyglot static analysis",
    description:
      "UBS wraps best-in-class linters into a single fast scanner with consistent output. Great as a pre-commit and agent quality gate.",
    icon: <ShieldCheck className="h-8 w-8 text-white" />,
    accent: "from-rose-400 to-red-500",
    commonCommands: [
      { command: "ubs .", description: "Scan current repo" },
      { command: "ubs . --format=json", description: "Machine-readable output" },
    ],
    relatedLinks: [{ href: "/learn/commands", label: "Command Reference" }],
  },

  cass: {
    id: "cass",
    title: "CASS (Session Search)",
    tagline: "Search across all agent sessions",
    description:
      "CASS indexes your agent sessions so you can instantly find prior work, decisions, and context across tools.",
    icon: <Search className="h-8 w-8 text-white" />,
    accent: "from-cyan-400 to-sky-500",
    commonCommands: [{ command: "cass --help", description: "Show commands and options" }],
    relatedLinks: [{ href: "/workflow", label: "Workflow guide" }],
  },

  cm: {
    id: "cm",
    title: "CASS Memory (CM)",
    tagline: "Procedural memory for agents",
    description:
      "CM stores what worked so future agents don’t repeat mistakes. Think of it as playbooks + memories.",
    icon: <Wrench className="h-8 w-8 text-white" />,
    accent: "from-fuchsia-400 to-pink-500",
    commonCommands: [{ command: "cm --help", description: "Show commands and options" }],
    relatedLinks: [{ href: "/workflow", label: "Workflow guide" }],
  },

  caam: {
    id: "caam",
    title: "CAAM (Account Manager)",
    tagline: "Switch agent credentials safely",
    description:
      "CAAM helps agents swap between auth contexts without getting tangled in accounts.",
    icon: <Wrench className="h-8 w-8 text-white" />,
    accent: "from-amber-400 to-orange-500",
    commonCommands: [{ command: "caam --help", description: "Show commands and options" }],
    relatedLinks: [{ href: "/learn/agent-commands", label: "Agent Commands reference" }],
  },

  slb: {
    id: "slb",
    title: "SLB (Simultaneous Launch Button)",
    tagline: "Two-person rule for dangerous commands",
    description:
      "SLB is a safety tool: when a command could be destructive, route it through SLB so a second person/agent must approve.",
    icon: <ShieldCheck className="h-8 w-8 text-white" />,
    accent: "from-yellow-400 to-orange-500",
    commonCommands: [{ command: "slb --help", description: "Show commands and options" }],
    relatedLinks: [{ href: "/learn/commands", label: "Command Reference" }],
  },
};

interface Props {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export default async function ToolDocPage({ params }: Props) {
  const { tool } = await params;
  const doc = TOOLS[tool as ToolId];

  if (!doc) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-cosmic opacity-50" />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-20" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 md:px-12 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Learning Hub</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${doc.accent}`}
            >
              {doc.icon}
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            {doc.title}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {doc.tagline}
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-10 border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <p className="text-muted-foreground">{doc.description}</p>
        </Card>

        {/* Quick start */}
        {doc.quickStart && (
          <Card className="mb-10 border-primary/20 bg-primary/5 p-6">
            <h2 className="mb-3 font-semibold">{doc.quickStart.title}</h2>
            <CodeBlock code={doc.quickStart.code} language="bash" />
          </Card>
        )}

        {/* Common commands */}
        <Card className="mb-10 border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 font-semibold">Common commands</h2>
          <div className="space-y-3">
            {doc.commonCommands.map((c) => (
              <CommandCard
                key={c.command}
                command={c.command}
                description={c.description}
              />
            ))}
          </div>
        </Card>

        {/* Related */}
        <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h2 className="mb-4 font-semibold">Related</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {doc.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

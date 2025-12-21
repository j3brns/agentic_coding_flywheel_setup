"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  GitBranch,
  Zap,
  Settings,
  Users,
  ChevronDown,
  Check,
  ArrowLeft,
  Copy,
  Layers,
  Terminal,
  Globe,
  Database,
  BarChart3,
  RefreshCw,
  Keyboard,
  ListOrdered,
  Eye,
  GitCommit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommandCard } from "@/components/command-card";
import { cn } from "@/lib/utils";
import {
  SimplerGuide,
  GuideSection,
  GuideStep,
  GuideExplain,
  GuideTip,
  GuideCaution,
} from "@/components/simpler-guide";

// Collapsible section component
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Code block with copy button
function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg bg-[oklch(0.15_0.02_260)] border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[oklch(0.13_0.02_260)] border-b border-border/30">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-[oklch(0.85_0.1_195)] font-mono whitespace-pre-wrap">{code}</code>
      </pre>
    </div>
  );
}

// Expandable prompt card for the command palette section
function PromptCard({
  label,
  desc,
  prompt,
  commandKey,
}: {
  label: string;
  desc: string;
  prompt: string;
  commandKey: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "rounded-lg border transition-all",
      isExpanded
        ? "border-primary/30 bg-card/80"
        : "border-border/50 bg-background/50 hover:border-primary/20"
    )}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              {commandKey}
            </code>
            <span className="font-medium text-sm">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="border-t border-border/50 p-3">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg font-mono">
            {prompt}
          </p>
        </div>
      )}
    </div>
  );
}

const TECH_STACK = [
  { name: "Next.js 16", desc: "App Router with React 19", category: "Framework" },
  { name: "TypeScript", desc: "Strict mode enabled", category: "Language" },
  { name: "Supabase", desc: "Postgres + Auth + Storage", category: "Backend" },
  { name: "Drizzle ORM", desc: "Type-safe database access", category: "Database" },
  { name: "Vercel AI SDK", desc: "For AI integrations", category: "AI" },
  { name: "Tailwind CSS", desc: "Utility-first styling", category: "Styling" },
  { name: "Framer Motion", desc: "Smooth animations", category: "Animation" },
  { name: "TanStack", desc: "Query, Router, Table, Form", category: "State" },
];

const CLOUD_SERVICES = [
  { name: "Cloudflare", purpose: "Domain purchase, DNS, CDN", tool: "wrangler" },
  { name: "Vercel", purpose: "Frontend hosting & deployment", tool: "vercel" },
  { name: "Supabase", purpose: "Database, auth, storage", tool: "supabase" },
  { name: "Google Cloud", purpose: "Analytics (GA4)", tool: "gcloud" },
];

const PROMPT_BEST_OF_ALL_WORLDS = `I asked 3 competing LLMs to do the exact same thing and they came up with pretty different plans which you can read below. I want you to REALLY carefully analyze their plans with an open mind and be intellectually honest about what they did that's better than your plan. Then I want you to come up with the best possible revisions to your plan (you should simply update your existing document for your original plan with the revisions) that artfully and skillfully blends the "best of all worlds" to create a true, ultimate, superior hybrid version of the plan that best achieves our stated goals and will work the best in real-world practice to solve the problems we are facing and our overarching goals while ensuring the extreme success of the enterprise as best as possible; you should provide me with a complete series of git-diff style changes to your original plan to turn it into the new, enhanced, much longer and detailed plan that integrates the best of all the plans with every good idea included (you don't need to mention which ideas came from which models in the final revised enhanced plan):`;

const PROMPT_100_IDEAS = `OK so now I want you to come up with your top 10 most brilliant ideas for adding extremely powerful and cool functionality that will make this system far more compelling, useful, intuitive, versatile, powerful, robust, reliable, etc for the users. Use ultrathink. But be pragmatic and don't think of features that will be extremely hard to implement or which aren't necessarily worth the additional complexity burden they would introduce. But I don't want you to just think of 10 ideas: I want you to seriously think hard and come up with one HUNDRED ideas and then only tell me your 10 VERY BEST and most brilliant, clever, and radically innovative and powerful ideas.`;

const PROMPT_CREATE_BEADS = `OK so please take ALL of that and elaborate on it more and then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid, with detailed comments so that the whole thing is totally self-contained and self-documenting (including relevant background, reasoning/justification, considerations, etc.-- anything we'd want our "future self" to know about the goals and intentions and thought process and how it serves the over-arching goals of the project.) Use ultrathink.`;

const PROMPT_REVIEW_BEADS = `Check over each bead super carefully-- are you sure it makes sense? Is it optimal? Could we change anything to make the system work better for users? If so, revise the beads. It's a lot easier and faster to operate in "plan space" before we start implementing these things! Use ultrathink.`;

const PROMPT_AGENT_SWARM = `First read ALL of the AGENTS.md file and README.md file super carefully and understand ALL of both! Then use your code investigation agent mode to fully understand the code, and technical architecture and purpose of the project. Then register with MCP Agent Mail and introduce yourself to the other agents. Be sure to check your agent mail and to promptly respond if needed to any messages; then proceed meticulously with your next assigned beads, working on the tasks systematically and meticulously and tracking your progress via beads and agent mail messages. Don't get stuck in "communication purgatory" where nothing is getting done; be proactive about starting tasks that need to be done, but inform your fellow agents via messages when you do so and mark beads appropriately. When you're not sure what to do next, use the bv tool mentioned in AGENTS.md to prioritize the best beads to work on next; pick the next one that you can usefully work on and get started. Make sure to acknowledge all communication requests from other agents and that you are aware of all active agents and their names. Use ultrathink.`;

// Daily maintenance prompts
const PROMPT_RANDOMLY_INSPECT = `I want you to sort of randomly explore the code files in this project, choosing code files to deeply investigate and understand and trace their functionality and execution flows through the related code files which they import or which they are imported by. Once you understand the purpose of the code in the larger context of the workflows, I want you to do a super careful, methodical, and critical check with "fresh eyes" to find any obvious bugs, problems, errors, issues, silly mistakes, etc. and then systematically and meticulously and intelligently correct them. Be sure to comply with ALL rules in AGENTS.md and ensure that any code you write or revise conforms to the best practice guides referenced in the AGENTS.md file.`;

const PROMPT_CHECK_OTHER_AGENTS = `Ok can you now turn your attention to reviewing the code written by your fellow agents and checking for any issues, bugs, errors, problems, inefficiencies, security problems, reliability issues, etc. and carefully diagnose their underlying root causes using first-principle analysis and then fix or revise them if necessary? Don't restrict yourself to the latest commits, cast a wider net and go super deep! Use ultrathink.`;

const PROMPT_FRESH_REVIEW = `Great, now I want you to carefully read over all of the new code you just wrote and other existing code you just modified with "fresh eyes" looking super carefully for any obvious bugs, errors, problems, issues, confusion, etc. Carefully fix anything you uncover.`;

const PROMPT_SCRUTINIZE_UI = `Great, now I want you to super carefully scrutinize every aspect of the application workflow and implementation and look for things that just seem sub-optimal or even wrong/mistaken to you, things that could very obviously be improved from a user-friendliness and intuitiveness standpoint, places where our UI/UX could be improved and polished to be slicker, more visually appealing, and more premium feeling and just ultra high quality, like Stripe-level apps.`;

const PROMPT_WORK_ON_BEADS = `OK, so start systematically and methodically and meticulously and diligently executing those remaining beads tasks that you created in the optimal logical order! Don't forget to mark beads as you work on them.`;

const PROMPT_GIT_COMMIT = `Now, based on your knowledge of the project, commit all changed files now in a series of logically connected groupings with super detailed commit messages for each and then push. Take your time to do it right. Don't edit the code at all. Don't commit obviously ephemeral files. Use ultrathink.`;

const PROMPT_NEXT_BEAD = `Pick the next bead you can actually do usefully now and start coding on it immediately; communicate what you're working on to your fellow agents and mark beads appropriately as you work. And respond to any agent mail messages you've received.`;

const PROMPT_ANALYZE_BEADS = `Re-read AGENTS.md first. Then, can you try using bv to get some insights on what each agent should most usefully work on? Then share those insights with the other agents via agent mail and strongly suggest in your messages the optimal work for each one and explain how/why you came up with that using bv. Use ultrathink.`;

const PROMPT_LEVERAGE_TANSTACK = `Ok I want you to look through the ENTIRE project and look for areas where, if we leveraged one of the many TanStack libraries (e.g., query, table, forms, etc), we could make part of the code much better, simpler, more performant, more maintainable, elegant, shorter, more reliable, etc.`;

const PROMPT_BUILD_UI_UX = `I also want you to do a spectacular job building absolutely world-class UI/UX components, with an intense focus on making the most visually appealing, user-friendly, intuitive, slick, polished, "Stripe level" of quality UI/UX possible for this that leverages the good libraries that are already part of the project.`;

// Additional Analysis & Development prompts
const PROMPT_FIX_BUG = `I want you to very carefully diagnose and then fix the root underlying cause of the bugs/errors shown here, but fix them FOR REAL, not a superficial "bandaid" fix! Here are the details:`;

const PROMPT_CHECK_ORM_SCHEMAS = `Now reread AGENTS.md, read your README.md, and then I want you to use ultrathink to super carefully and critically read the entire data ORM schema/models and look for any issues or problems, conceptual mistakes, logical errors, or anything that doesn't fit your understanding of the business strategy and accepted best practices for the design and architecture of databases for these sorts of ecommerce/saas projects/companies.`;

const PROMPT_APPLY_UBS = `Read about the ubs tool in AGENTS.md. Now run UBS and investigate and fix literally every single UBS issue once you determine (after reasoned consideration and close inspection) that it's legit.`;

const PROMPT_CREATE_TESTS = `Do we have full unit test coverage without using mocks/fake stuff? What about complete e2e integration test scripts with great, detailed logging? If not, then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid with detailed comments.`;

// Documentation prompts
const PROMPT_COMPLETE_DOCS = `Now I need you to look through the existing documentation in our docusaurus site here and look for the (many, many) instances of functionality in our project that are not described or explained at all yet (or explained inadequately) in the docusaurus site, and then create and expand the documentation in the site to cover these in an exhaustive, intuitive, helpful, useful, pragmatic way. Don't just make a dump of methods, parameters, etc. Add actually well-written narrative explaining what the stuff does, how it is organized, etc. to help another developer understand how it all works so that they can usefully contribute to the system.`;

const PROMPT_IMPROVE_README = `What else can we put in there to make the README longer and more detailed about what we built, why it's useful, how it works, the algorithms/design principles used, etc. This is incremental NEW content, not replacement for what is there already.`;

// Git & Operations prompts
const PROMPT_DO_GH_FLOW = `Do all the GitHub stuff: commit, deploy, create tag, bump version, release, monitor gh actions, compute checksums, etc.`;

const PROMPT_DO_ALL_OF_IT = `OK, please do ALL of that now. Track work via bd beads (no markdown TODO lists): create/claim/update/close beads as you go so nothing gets lost, and keep communicating via Agent Mail when you start/finish work.`;

// Agent Coordination prompts
const PROMPT_CHECK_MAIL = `Be sure to check your agent mail and to promptly respond if needed to any messages, and also acknowledge any contact requests; make sure you know the names of all active agents using the MCP Agent Mail system.`;

const PROMPT_INTRODUCE_TO_AGENTS = `Before doing anything else, read ALL of AGENTS.md, then register with MCP Agent Mail and introduce yourself to the other agents.`;

const PROMPT_START_WITH_MAIL = `Be sure to check your agent mail and to promptly respond if needed to any messages; then proceed meticulously with your next assigned beads, working on the tasks systematically and meticulously and tracking your progress via beads and agent mail messages. Don't get stuck in "communication purgatory" where nothing is getting done; be proactive about starting tasks that need to be done, but inform your fellow agents via messages when you do so and mark beads appropriately. When you're really not sure what to do, pick the next bead that you can usefully work on and get started. Make sure to acknowledge all communication requests from other agents and that you are aware of all active agents and their names. Use ultrathink.`;

// Investigation prompts
const PROMPT_READ_AND_INVESTIGATE = `First read ALL of the AGENTS.md file and README.md file super carefully and understand ALL of both! Then use your code investigation agent mode to fully understand the code, and technical architecture and purpose of the project.`;

const PROMPT_REREAD_AGENTS = `Reread AGENTS.md so it's still fresh in your mind.`;

const PROMPT_USE_BV = `Use bv with the robot flags (see AGENTS.md for info on this) to find the most impactful bead(s) to work on next and then start on it. Remember to mark the beads appropriately and communicate with your fellow agents.`;

// Organized prompt library for the Command Palette section
const PROMPT_LIBRARY = {
  analysis: [
    { key: "fresh_review", label: "Fresh Review", prompt: PROMPT_FRESH_REVIEW, desc: "Self-review new code for bugs" },
    { key: "check_other_agents", label: "Check Other Agents", prompt: PROMPT_CHECK_OTHER_AGENTS, desc: "Peer review agent work" },
    { key: "randomly_inspect", label: "Randomly Inspect", prompt: PROMPT_RANDOMLY_INSPECT, desc: "Deep code exploration" },
    { key: "scrutinize_ui", label: "Scrutinize UI/UX", prompt: PROMPT_SCRUTINIZE_UI, desc: "Polish to Stripe-level quality" },
    { key: "check_orm", label: "Check ORM/Schemas", prompt: PROMPT_CHECK_ORM_SCHEMAS, desc: "Review database design" },
    { key: "apply_ubs", label: "Apply UBS", prompt: PROMPT_APPLY_UBS, desc: "Run bug scanner and fix all issues" },
  ],
  coding: [
    { key: "fix_bug", label: "Fix Bug", prompt: PROMPT_FIX_BUG, desc: "Diagnose and fix root cause" },
    { key: "create_tests", label: "Create Tests", prompt: PROMPT_CREATE_TESTS, desc: "Comprehensive test coverage" },
    { key: "leverage_tanstack", label: "Leverage TanStack", prompt: PROMPT_LEVERAGE_TANSTACK, desc: "Use TanStack libs where beneficial" },
    { key: "build_ui_ux", label: "Build UI/UX", prompt: PROMPT_BUILD_UI_UX, desc: "World-class component development" },
  ],
  planning: [
    { key: "combine_plans", label: "Combine Plans", prompt: PROMPT_BEST_OF_ALL_WORLDS, desc: "Synthesize best of 3 AI plans" },
    { key: "100_ideas", label: "Generate Ideas", prompt: PROMPT_100_IDEAS, desc: "Think of 100, show best 10" },
    { key: "create_beads", label: "Create Beads", prompt: PROMPT_CREATE_BEADS, desc: "Transform plan into tasks" },
    { key: "improve_beads", label: "Improve Beads", prompt: PROMPT_REVIEW_BEADS, desc: "Iterate in 'plan space'" },
    { key: "work_on_beads", label: "Work on Beads", prompt: PROMPT_WORK_ON_BEADS, desc: "Execute tasks in order" },
    { key: "next_bead", label: "Next Bead", prompt: PROMPT_NEXT_BEAD, desc: "Pick and start next task" },
    { key: "use_bv", label: "Use BV", prompt: PROMPT_USE_BV, desc: "Find most impactful bead" },
    { key: "analyze_beads", label: "Analyze & Allocate", prompt: PROMPT_ANALYZE_BEADS, desc: "Distribute work to agents" },
    { key: "do_all", label: "Do All Of It", prompt: PROMPT_DO_ALL_OF_IT, desc: "Execute everything with tracking" },
  ],
  agents: [
    { key: "new_agent", label: "New Agent", prompt: PROMPT_AGENT_SWARM, desc: "Initialize and join swarm" },
    { key: "introduce", label: "Introduce", prompt: PROMPT_INTRODUCE_TO_AGENTS, desc: "Register with Agent Mail" },
    { key: "check_mail", label: "Check Mail", prompt: PROMPT_CHECK_MAIL, desc: "Process agent messages" },
    { key: "start_with_mail", label: "Start With Mail", prompt: PROMPT_START_WITH_MAIL, desc: "Check mail then work" },
  ],
  git: [
    { key: "git_commit", label: "Git Commit", prompt: PROMPT_GIT_COMMIT, desc: "Smart grouped commits + push" },
    { key: "gh_flow", label: "GH Flow", prompt: PROMPT_DO_GH_FLOW, desc: "Full GitHub workflow" },
  ],
  investigation: [
    { key: "read_investigate", label: "Read & Investigate", prompt: PROMPT_READ_AND_INVESTIGATE, desc: "Deep project understanding" },
    { key: "reread_agents", label: "Reread AGENTS.md", prompt: PROMPT_REREAD_AGENTS, desc: "Refresh context" },
  ],
  documentation: [
    { key: "complete_docs", label: "Complete Docs", prompt: PROMPT_COMPLETE_DOCS, desc: "Expand Docusaurus site" },
    { key: "improve_readme", label: "Improve README", prompt: PROMPT_IMPROVE_README, desc: "Add incremental content" },
  ],
};

export default function WorkflowPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link href="/wizard/launch-onboarding" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Part One
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.7_0.2_330)] to-primary shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Part Two: The Agentic Workflow
              </h1>
              <p className="text-muted-foreground">
                Build production software at 10x speed with AI agent swarms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Overview */}
        <Card className="p-6 border-primary/20 bg-primary/5">
          <h2 className="text-xl font-semibold mb-3">What You&apos;ll Learn</h2>
          <p className="text-muted-foreground mb-4">
            This guide teaches you the complete workflow for building production-ready
            software using multiple AI agents working in parallel. You&apos;ll learn:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              "The recommended tech stack",
              "Best-of-all-worlds planning technique",
              "Setting up cloud services",
              "Transforming plans into beads",
              "Running agent swarms",
              "The post-install setup script",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Investment reminder */}
        <Card className="p-4 border-[oklch(0.78_0.16_75/0.3)] bg-[oklch(0.78_0.16_75/0.08)]">
          <p className="text-sm">
            <strong>Reminder:</strong> For the full multi-agent experience, you&apos;ll need:
            VPS ($35-60/mo) + Claude Max ($200/mo × 1-2) + GPT Pro ($200/mo).
            Start smaller if you prefer — you can scale up as you see results!
          </p>
        </Card>

        {/* Section 1: Tech Stack */}
        <CollapsibleSection title="Step 1: The Recommended Tech Stack" icon={Layers} defaultOpen={true}>
          <p className="text-muted-foreground mb-4">
            This stack is optimized for rapid development with AI agents. Everything works
            together seamlessly and all tools have excellent AI coding assistant support.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="rounded-lg border border-border/50 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tech.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {tech.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>

          <SimplerGuide>
            <GuideExplain term="Why this stack?">
              This stack is chosen because:
              <ul className="mt-2 space-y-1">
                <li>• <strong>Type safety throughout</strong> — TypeScript + Drizzle means fewer bugs</li>
                <li>• <strong>Modern React patterns</strong> — React 19 with App Router is the future</li>
                <li>• <strong>AI-friendly</strong> — All these tools are well-documented and AI assistants know them well</li>
                <li>• <strong>Production-ready</strong> — Vercel + Supabase scales from hobby to enterprise</li>
                <li>• <strong>Monorepo-friendly</strong> — Everything in one GitHub repository for easy management</li>
              </ul>
            </GuideExplain>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 2: Cloud Services Setup */}
        <CollapsibleSection title="Step 2: Set Up Cloud Services" icon={Globe}>
          <p className="text-muted-foreground mb-4">
            Before starting a project, set up accounts with these cloud services and install
            their CLI tools globally:
          </p>

          <div className="space-y-4">
            {CLOUD_SERVICES.map((service) => (
              <div key={service.name} className="rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  {service.name === "Cloudflare" && <Globe className="h-5 w-5 text-[oklch(0.65_0.18_30)]" />}
                  {service.name === "Vercel" && <Terminal className="h-5 w-5 text-foreground" />}
                  {service.name === "Supabase" && <Database className="h-5 w-5 text-[oklch(0.72_0.19_145)]" />}
                  {service.name === "Google Cloud" && <BarChart3 className="h-5 w-5 text-[oklch(0.65_0.2_250)]" />}
                  <span className="font-medium">{service.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{service.purpose}</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  bun install -g {service.tool}
                </code>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="font-medium mb-2">Install all CLI tools at once:</h4>
            <CommandCard
              command="bun install -g wrangler supabase vercel"
              description="Install cloud CLI tools globally"
            />
          </div>

          <SimplerGuide>
            <GuideSection title="Setting Up Each Service">
              <div className="space-y-4">
                <GuideStep number={1} title="Cloudflare (for domains & DNS)">
                  <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Create a free Cloudflare account
                  </a>. Use Cloudflare to purchase domains (~$10/year for .com) and manage DNS.
                  Their free tier includes CDN and DDoS protection.
                </GuideStep>

                <GuideStep number={2} title="Vercel (for hosting)">
                  <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Create a free Vercel account
                  </a> using your GitHub login. The free tier is generous — you can host
                  multiple projects. Run <code className="bg-muted px-1 rounded">vercel login</code> to authenticate.
                </GuideStep>

                <GuideStep number={3} title="Supabase (for database & auth)">
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Create a free Supabase account
                  </a>. The free tier includes 2 projects with 500MB database each.
                  For user auth, enable Google OAuth in Authentication → Providers (it&apos;s free!).
                </GuideStep>

                <GuideStep number={4} title="Google Cloud (for analytics)">
                  <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Set up Google Cloud
                  </a> and create a GA4 property for analytics. Install gcloud CLI:
                  <code className="block mt-2 bg-muted px-2 py-1 rounded text-xs">
                    curl https://sdk.cloud.google.com | bash
                  </code>
                </GuideStep>
              </div>
            </GuideSection>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 3: Planning Technique */}
        <CollapsibleSection title="Step 3: Best-of-All-Worlds Planning" icon={Brain}>
          <p className="text-muted-foreground mb-4">
            This is the secret sauce. Instead of using one AI to plan your project, you&apos;ll
            use THREE competing models and synthesize the best ideas from all of them.
          </p>

          <div className="space-y-6">
            {/* Step 3.1 */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                Start with GPT Pro
              </h4>
              <p className="text-sm text-muted-foreground">
                Open <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">ChatGPT</a> with
                GPT Pro ($200/mo) and describe your project in detail. Be thorough about
                what you want to build, the user experience, and technical requirements.
                Ask it to create a comprehensive implementation plan.
              </p>
            </div>

            {/* Step 3.2 */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                Get competing plans from Opus 4.5 and Gemini
              </h4>
              <p className="text-sm text-muted-foreground">
                Give the same prompt to{" "}
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">Claude Opus 4.5</a> and{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Gemini 3 with Deep Think</a> (free at AI Studio).
                Each model will produce different insights and approaches.
              </p>
            </div>

            {/* Step 3.3 */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                Synthesize with the &quot;Best of All Worlds&quot; prompt
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Paste the competing plans back into GPT Pro with this magic prompt:
              </p>
              <CodeBlock code={PROMPT_BEST_OF_ALL_WORLDS} language="prompt" />
            </div>

            {/* Step 3.4 */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                Optional: Generate brilliant feature ideas
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                For maximum creativity, start a fresh session with your enhanced plan
                and use this prompt to generate innovative features:
              </p>
              <CodeBlock code={PROMPT_100_IDEAS} language="prompt" />
              <p className="text-sm text-muted-foreground">
                You can repeat this 3+ times to generate even more ideas and refine further.
              </p>
            </div>
          </div>

          <SimplerGuide>
            <GuideTip>
              <strong>Why use 3 models?</strong> Each AI has different training data,
              architectures, and &quot;thinking styles&quot;. GPT might excel at system design,
              Claude at code quality, and Gemini at creative features. The synthesis
              captures the strengths of all three.
            </GuideTip>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 4: Creating Beads */}
        <CollapsibleSection title="Step 4: Transform Plan into Beads" icon={GitBranch}>
          <p className="text-muted-foreground mb-4">
            Beads are the task tracking system that coordinates your agent swarm. Each bead
            is a self-contained task with dependencies, metadata, and detailed context.
          </p>

          <div className="space-y-6">
            {/* Step 4.1 */}
            <div className="space-y-3">
              <h4 className="font-medium">Create your project</h4>
              <CommandCard
                command="ntm new myproject"
                description="Create a new tmux session for your project"
              />
            </div>

            {/* Step 4.2 */}
            <div className="space-y-3">
              <h4 className="font-medium">Generate beads from your plan</h4>
              <p className="text-sm text-muted-foreground mb-3">
                In Claude Code with Opus 4.5, paste your final plan and use this prompt:
              </p>
              <CodeBlock code={PROMPT_CREATE_BEADS} language="prompt" />
            </div>

            {/* Step 4.3 */}
            <div className="space-y-3">
              <h4 className="font-medium">Review and refine beads</h4>
              <p className="text-sm text-muted-foreground mb-3">
                After the beads are created, have Claude review them:
              </p>
              <CodeBlock code={PROMPT_REVIEW_BEADS} language="prompt" />
            </div>

            {/* Step 4.4 */}
            <div className="space-y-3">
              <h4 className="font-medium">Add test coverage beads</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Don&apos;t forget comprehensive testing:
              </p>
              <CodeBlock
                code={`Do we have full unit test coverage without using mocks/fake stuff? What about complete e2e integration test scripts with great, detailed logging? If not, then create a comprehensive and granular set of beads for all this with tasks, subtasks, and dependency structure overlaid with detailed comments. Use ultrathink.`}
                language="prompt"
              />
            </div>
          </div>

          <SimplerGuide>
            <GuideExplain term="What are beads?">
              Beads are like super-powered to-do items. Each bead contains:
              <ul className="mt-2 space-y-1">
                <li>• A clear task description</li>
                <li>• Dependencies (what must be done first)</li>
                <li>• Context and reasoning (why this task matters)</li>
                <li>• Status tracking (pending, in-progress, complete)</li>
              </ul>
              The <code className="bg-muted px-1 rounded">bd</code> CLI tool manages beads,
              and <code className="bg-muted px-1 rounded">bv</code> provides a visual interface.
            </GuideExplain>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 5: Agent Swarm */}
        <CollapsibleSection title="Step 5: Run the Agent Swarm" icon={Users}>
          <p className="text-muted-foreground mb-4">
            This is where the magic happens. You&apos;ll launch multiple Claude Code agents
            in parallel, each working on different beads while coordinating through
            MCP Agent Mail.
          </p>

          <div className="space-y-6">
            {/* Setup */}
            <div className="space-y-3">
              <h4 className="font-medium">Set up agent sessions</h4>
              <p className="text-sm text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">ntm</code> to create multiple
                terminal panes, each running a Claude Code agent:
              </p>
              <CommandCard
                command="ntm spawn myproject 8"
                description="Create 8 agent panes in your project session"
              />
            </div>

            {/* Agent prompt */}
            <div className="space-y-3">
              <h4 className="font-medium">Initialize each agent with this prompt</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Copy this prompt to each agent to get them started:
              </p>
              <CodeBlock code={PROMPT_AGENT_SWARM} language="prompt" />
            </div>

            {/* Coordination */}
            <div className="space-y-3">
              <h4 className="font-medium">Key coordination tools</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 p-3">
                  <code className="text-sm font-mono text-primary">bd ready</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show beads ready to work on
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <code className="text-sm font-mono text-primary">bd update ID --status=in_progress</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Claim a bead before working
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <code className="text-sm font-mono text-primary">bd close ID</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mark a bead as complete
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <code className="text-sm font-mono text-primary">bv</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visual bead browser TUI
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SimplerGuide>
            <GuideCaution>
              <strong>Avoid &quot;communication purgatory&quot;!</strong> Agents should be proactive
              about claiming and completing tasks. If an agent gets stuck waiting for
              responses, it should move on to other available beads. The goal is continuous
              progress, not perfect coordination.
            </GuideCaution>

            <GuideTip>
              <strong>Start small.</strong> Begin with 2-3 agents to understand the workflow.
              Scale up to 8-10+ agents as you get comfortable. More agents = faster progress,
              but also more coordination overhead.
            </GuideTip>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 6: Daily Maintenance Prompts */}
        <CollapsibleSection title="Step 6: Daily Maintenance (Autopilot Mode)" icon={RefreshCw}>
          <p className="text-muted-foreground mb-4">
            The real power of this workflow is making forward progress on ALL your projects
            every day, even when you&apos;re too busy for deep work. These &quot;autopilot&quot; prompts
            keep agents productively improving code while you handle other things.
          </p>

          {/* Philosophy callout */}
          <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              The Daily Progress Philosophy
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Make some forward progress on <strong className="text-foreground">every active project, every day</strong>,
                even when you&apos;re too busy to spend real mental bandwidth on all of them.
              </p>
              <p className="text-muted-foreground">
                The models are good enough now, and with comprehensive unit tests and e2e integration
                tests, you don&apos;t need to worry about agents &quot;going rogue&quot;. Plus, if one of them
                makes a mistake, the <em>other agents will probably catch and fix it themselves</em>.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">The reality:</strong> Run these prompts on 7+ projects
                daily, keeping 3 machines busy constantly. Come back 3+ hours later to see incredible
                amounts of work done autonomously. The compound effect is incredible — you wake up to
                meaningful improvements across your entire portfolio!
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            {/* Random code inspection */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Random Code Inspection
              </h4>
              <p className="text-sm text-muted-foreground">
                Have agents explore your codebase with &quot;fresh eyes&quot; to find bugs and issues:
              </p>
              <CodeBlock code={PROMPT_RANDOMLY_INSPECT} language="prompt" />
            </div>

            {/* Check other agents work */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Peer Review Agent Work
              </h4>
              <p className="text-sm text-muted-foreground">
                Have agents review code written by their fellow agents:
              </p>
              <CodeBlock code={PROMPT_CHECK_OTHER_AGENTS} language="prompt" />
            </div>

            {/* Scrutinize UI/UX */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                UI/UX Polish Pass
              </h4>
              <p className="text-sm text-muted-foreground">
                When you&apos;re dissatisfied but lack energy to engage directly (use with Opus 4.5 or GPT 5.2):
              </p>
              <CodeBlock code={PROMPT_SCRUTINIZE_UI} language="prompt" />
            </div>

            {/* Fresh review */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Fresh Review
              </h4>
              <p className="text-sm text-muted-foreground">
                After any coding session, have the agent self-review:
              </p>
              <CodeBlock code={PROMPT_FRESH_REVIEW} language="prompt" />
            </div>
          </div>

          <SimplerGuide>
            <GuideExplain term="Why &quot;autopilot&quot; works">
              These prompts are designed to be:
              <ul className="mt-2 space-y-1">
                <li>• <strong>Open-ended but bounded</strong> — agents explore but stay within the codebase</li>
                <li>• <strong>Self-correcting</strong> — multiple agents catch each other&apos;s mistakes</li>
                <li>• <strong>Low-supervision</strong> — you can come back hours later to see progress</li>
                <li>• <strong>Incremental</strong> — small improvements compound over time</li>
              </ul>
            </GuideExplain>

            <GuideSection title="The Model Hierarchy">
              <p className="mb-3">
                Different prompts work better with different models:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Opus 4.5 / GPT 5.2 with extra effort</strong> — Use for scrutinize_ui,
                  check_orm, and other high-stakes analysis prompts. These require deep reasoning.
                </li>
                <li>
                  <strong>Claude Sonnet / GPT 4o</strong> — Great for fresh_review, fix_bug,
                  work_on_beads, and routine coding tasks. Fast and reliable.
                </li>
                <li>
                  <strong>Any model</strong> — check_mail, reread_agents, git_commit work fine
                  with any capable model.
                </li>
              </ul>
            </GuideSection>

            <GuideTip>
              <strong>When you&apos;re feeling dissatisfied</strong> with a project but lack the energy
              to engage directly, the scrutinize_ui prompt is your best friend. Let the AI find
              what&apos;s wrong while you do something else entirely.
            </GuideTip>

            <GuideCaution>
              <strong>Test coverage is your safety net.</strong> This autopilot approach only
              works safely when you have comprehensive unit tests and e2e integration tests.
              The tests act as guardrails preventing agents from breaking things.
            </GuideCaution>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 7: Command Palette */}
        <CollapsibleSection title="Step 7: The Complete Prompt Library" icon={Keyboard}>
          <p className="text-muted-foreground mb-4">
            Each prompt takes under a second to send using NTM&apos;s command palette.
            Configure once, then trigger with a single button press. Click any prompt to
            expand and copy.
          </p>

          {/* Analysis & Review */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Analysis & Review
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.analysis.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Coding & Development */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              Coding & Development
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.coding.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Planning & Beads */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Planning & Beads
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.planning.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Agent Coordination */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Agent Coordination
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.agents.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Git & Operations */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-primary" />
              Git & Operations
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.git.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Investigation */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Investigation
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.investigation.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          {/* Documentation */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Documentation
            </h4>
            <div className="grid gap-2">
              {PROMPT_LIBRARY.documentation.map((p) => (
                <PromptCard key={p.key} label={p.label} desc={p.desc} prompt={p.prompt} commandKey={p.key} />
              ))}
            </div>
          </div>

          <SimplerGuide>
            <GuideExplain term="How to set up the command palette">
              NTM (Named Tmux Manager) includes a command palette feature. Add your prompts
              to <code className="bg-muted px-1 rounded">~/.config/ntm/prompts.yaml</code> and
              bind a keyboard shortcut to open the palette. Each prompt can be triggered
              in any active agent session with a single keypress.
              <br /><br />
              For physical command palettes (like the StreamDeck or cheaper Temu alternatives),
              you can bind each button to type and send a specific prompt to the active terminal.
            </GuideExplain>

            <GuideTip>
              <strong>Hardware tip:</strong> A small programmable keypad (~$60 on Temu) can be
              configured to send any of these prompts with a single button press. Keep one next
              to each of your machines for instant agent commands.
            </GuideTip>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 8: Queued Workflows */}
        <CollapsibleSection title="Step 8: Queued Workflows (Codex Power Move)" icon={ListOrdered}>
          <p className="text-muted-foreground mb-4">
            Codex CLI has a powerful feature: you can queue up multiple messages that execute
            sequentially, one after the other. This lets you set up entire improvement cycles
            that run autonomously for hours.
          </p>

          <Card className="p-4 border-[oklch(0.78_0.16_75/0.3)] bg-[oklch(0.78_0.16_75/0.08)] mb-6">
            <p className="text-sm">
              <strong>Note:</strong> This works with Codex CLI but not Claude Code (which
              interrupts the agent when you send follow-up messages). For Claude Code, use
              individual prompts or the NTM palette.
            </p>
          </Card>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">The &quot;Improvement Cycle&quot; Queue</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Enter these prompts upfront — Codex processes them one at a time as each completes:
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Scrutinize and find improvements:</p>
                    <CodeBlock code={PROMPT_SCRUTINIZE_UI} language="prompt" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Turn suggestions into beads:</p>
                    <CodeBlock code={PROMPT_CREATE_BEADS} language="prompt" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Review the beads:</p>
                    <CodeBlock code={PROMPT_REVIEW_BEADS} language="prompt" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Execute the beads:</p>
                    <CodeBlock code={PROMPT_WORK_ON_BEADS} language="prompt" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">5</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">A couple &quot;proceed&quot; messages...</p>
                    <code className="block bg-muted px-2 py-1 rounded text-sm">proceed</code>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">6</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Final fresh review:</p>
                    <CodeBlock code={PROMPT_FRESH_REVIEW} language="prompt" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold text-[oklch(0.72_0.19_145)]">7</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Finally, commit everything:</p>
                    <CodeBlock code={PROMPT_GIT_COMMIT} language="prompt" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SimplerGuide>
            <GuideTip>
              <strong>Come back 3+ hours later</strong> to see an incredible amount of work
              done autonomously. This works especially well with GPT 5.2 with extra effort.
              Run this cycle multiple times a day across all your projects!
            </GuideTip>

            <GuideCaution>
              <strong>Test coverage is crucial!</strong> This autopilot approach only works
              safely when you have comprehensive unit tests and e2e integration tests. The
              tests act as guardrails preventing agents from breaking things.
            </GuideCaution>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Section 9: Post-Install Script */}
        <CollapsibleSection title="Bonus: Post-Install Setup Script" icon={Settings}>
          <p className="text-muted-foreground mb-4">
            After Part One is complete, run this script to install and configure all
            the cloud service CLI tools for your projects:
          </p>

          <CommandCard
            command="acfs services-setup"
            description="Run the cloud services setup wizard"
          />

          <div className="mt-4 p-4 rounded-lg border border-border/50 bg-muted/30">
            <h4 className="font-medium mb-2">What this sets up:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                Wrangler CLI for Cloudflare
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                Vercel CLI with authentication
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                Supabase CLI with project linking
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                Google Cloud SDK with GA4 setup
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[oklch(0.72_0.19_145)]" />
                Drizzle ORM configuration
              </li>
            </ul>
          </div>

          <SimplerGuide>
            <GuideExplain term="Why a separate setup script?">
              The main ACFS installer focuses on development tools. This second script
              handles cloud service configuration, which requires your specific accounts
              and API keys. Running them separately keeps the initial setup fast and
              lets you configure cloud services when you&apos;re ready.
            </GuideExplain>
          </SimplerGuide>
        </CollapsibleSection>

        {/* Summary */}
        <Card className="p-6 border-2 border-[oklch(0.72_0.19_145/0.3)] bg-[oklch(0.72_0.19_145/0.05)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-[oklch(0.72_0.19_145)]" />
            Summary: The Complete Workflow
          </h2>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">1</span>
              <span><strong>Plan with 3 AI models</strong> — GPT Pro, Opus 4.5, Gemini → synthesize best ideas</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">2</span>
              <span><strong>Generate feature ideas</strong> — Use the &quot;100 ideas, show me 10&quot; technique</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">3</span>
              <span><strong>Create beads</strong> — Transform plan into granular, self-documenting tasks</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">4</span>
              <span><strong>Review beads</strong> — Iterate in &quot;plan space&quot; before implementing</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">5</span>
              <span><strong>Launch agent swarm</strong> — Multiple Claude agents working in parallel</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.19_145/0.2)] text-xs font-bold">6</span>
              <span><strong>Ship</strong> — Deploy to Vercel, iterate, and repeat!</span>
            </li>
          </ol>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-muted-foreground mb-4">
            You now have everything you need to build at 10x speed.
          </p>
          <Link href="/wizard/launch-onboarding">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Part One
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

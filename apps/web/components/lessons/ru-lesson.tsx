'use client';

import { motion } from '@/components/motion';
import {
  RefreshCw,
  Terminal,
  Zap,
  FolderSync,
  Bot,
  Shield,
  Clock,
  Settings,
  CheckCircle,
  Play,
} from 'lucide-react';
import {
  Section,
  Paragraph,
  CodeBlock,
  TipBox,
  Highlight,
  Divider,
  GoalBanner,
  CommandList,
  FeatureCard,
  FeatureGrid,
} from './lesson-components';

export function RuLesson() {
  return (
    <div className="space-y-8">
      <GoalBanner>
        Master multi-repo synchronization and AI-driven commit automation with RU.
      </GoalBanner>

      {/* Section 1: What Is RU */}
      <Section title="What Is RU?" icon={<RefreshCw className="h-5 w-5" />} delay={0.1}>
        <Paragraph>
          <Highlight>RU (Repo Updater)</Highlight> is your command center for managing
          dozens of GitHub repositories. One command syncs everything. AI automation
          commits your dirty repos intelligently.
        </Paragraph>
        <Paragraph>
          Without RU, you&apos;d manually cd into each repo and run git pull. With 20+ repos,
          that&apos;s tedious and error-prone. RU handles it all with parallel workers.
        </Paragraph>

        <div className="mt-8">
          <FeatureGrid>
            <FeatureCard
              icon={<FolderSync className="h-5 w-5" />}
              title="Parallel Sync"
              description="Work-stealing queue syncs repos 4x faster"
              gradient="from-blue-500/20 to-indigo-500/20"
            />
            <FeatureCard
              icon={<Bot className="h-5 w-5" />}
              title="Agent Sweep"
              description="AI-driven commit automation"
              gradient="from-violet-500/20 to-purple-500/20"
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Resume Support"
              description="Pick up where you left off"
              gradient="from-emerald-500/20 to-teal-500/20"
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Git Plumbing"
              description="No string parsing, locale-safe"
              gradient="from-amber-500/20 to-orange-500/20"
            />
          </FeatureGrid>
        </div>
      </Section>

      <Divider />

      {/* Section 2: Essential Commands */}
      <Section title="Essential Commands" icon={<Terminal className="h-5 w-5" />} delay={0.15}>
        <Paragraph>
          Start with these core commands. They cover 90% of daily usage.
        </Paragraph>

        <CommandList
          commands={[
            { command: 'ru sync', description: 'Clone missing + pull all repos' },
            { command: 'ru sync -j4', description: 'Parallel sync with 4 workers' },
            { command: 'ru sync --autostash', description: 'Stash local changes before pull' },
            { command: 'ru status', description: 'Check all repo states' },
            { command: 'ru status --fetch', description: 'Fetch + show ahead/behind' },
            { command: 'ru list --paths', description: 'Show all repo paths' },
            { command: 'ru doctor', description: 'Health check RU installation' },
          ]}
        />

        <TipBox variant="tip">
          Use <code>ru sync --resume</code> if sync was interrupted. RU remembers progress!
        </TipBox>
      </Section>

      <Divider />

      {/* Section 3: Agent Sweep */}
      <Section title="Agent Sweep: AI Automation" icon={<Bot className="h-5 w-5" />} delay={0.2}>
        <Paragraph>
          Agent Sweep is RU&apos;s killer feature. It uses Claude Code to automatically
          commit dirty repos with intelligent commit messages.
        </Paragraph>

        <CodeBlock
          code={`# Phase 1: Understand
# Agent reads AGENTS.md, explores codebase, learns conventions

# Phase 2: Plan
# Agent produces JSON commit plan (files, messages)
# RU validates: no secrets, file size limits, schema check

# Phase 3: Execute
# RU executes validated plan with deterministic git commands`}
          filename="Three-Phase Workflow"
        />

        <CommandList
          commands={[
            { command: 'ru agent-sweep --dry-run', description: 'Preview what would happen' },
            { command: 'ru agent-sweep --parallel 4', description: 'Process 4 repos simultaneously' },
            { command: 'ru agent-sweep --with-release', description: 'Include version bumps and tags' },
            { command: 'ru agent-sweep --resume', description: 'Continue interrupted sweep' },
          ]}
        />

        <TipBox variant="warning">
          Always run <code>--dry-run</code> first to preview the commit plan!
        </TipBox>
      </Section>

      <Divider />

      {/* Section 4: AI Code Review */}
      <Section title="AI Code Review" icon={<CheckCircle className="h-5 w-5" />} delay={0.23}>
        <Paragraph>
          RU can orchestrate AI-assisted code reviews across your repos using{' '}
          <Highlight>ru review</Highlight>. The review system integrates with ntm&apos;s
          robot mode to spawn Claude agents for thorough analysis.
        </Paragraph>

        <CommandList
          commands={[
            { command: 'ru review', description: 'Review uncommitted changes in current repo' },
            { command: 'ru review --plan', description: 'Create detailed review plan first' },
            { command: 'ru review --all', description: 'Review all dirty repos' },
            { command: 'ru review --scope=security', description: 'Focus on security issues' },
          ]}
        />

        <TipBox variant="tip">
          Combine with <code>ubs</code> for comprehensive coverage: run <code>ubs .</code> for
          static analysis, then <code>ru review</code> for semantic understanding.
        </TipBox>
      </Section>

      <Divider />

      {/* Section 5: Configuration */}
      <Section title="Configuration" icon={<Settings className="h-5 w-5" />} delay={0.25}>
        <Paragraph>
          RU follows XDG conventions. Configure once, sync everywhere.
        </Paragraph>

        <CodeBlock
          code={`# Base directory for repositories
PROJECTS_DIR=/data/projects

# Parallel workers (1-8)
PARALLEL=4

# Update strategy: ff-only | rebase | merge
UPDATE_STRATEGY=ff-only

# Auto-stash local changes before pull
AUTOSTASH=false`}
          filename="~/.config/ru/config"
        />

        <CodeBlock
          code={`# Shorthand
Dicklesworthstone/ntm
Dicklesworthstone/beads_viewer

# With branch
owner/repo@develop

# Custom local name
owner/repo as my-fork

# SSH URL
git@github.com:owner/repo.git as myrepo`}
          filename="~/.config/ru/repos.d/public.txt"
        />

        <TipBox variant="tip">
          Run <code>ru init --example</code> to create starter config files.
        </TipBox>
      </Section>

      <Divider />

      {/* Section 6: Integration */}
      <Section title="Tool Integration" icon={<Zap className="h-5 w-5" />} delay={0.3}>
        <Paragraph>
          RU becomes more powerful when combined with other flywheel tools.
        </Paragraph>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-xl border border-border/50 bg-card/30"
          >
            <h4 className="font-semibold text-primary mb-2">RU + NTM</h4>
            <p className="text-muted-foreground text-sm">
              Agent Sweep uses NTM robot mode to spawn Claude sessions. NTM manages
              the tmux panes, RU orchestrates the workflow.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl border border-border/50 bg-card/30"
          >
            <h4 className="font-semibold text-primary mb-2">RU + BV</h4>
            <p className="text-muted-foreground text-sm">
              After syncing repos, use BV to check beads across all projects.
              Combine <code className="text-primary">ru status</code> with{' '}
              <code className="text-primary">bv --robot-triage</code>.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="p-4 rounded-xl border border-border/50 bg-card/30"
          >
            <h4 className="font-semibold text-primary mb-2">RU + Mail</h4>
            <p className="text-muted-foreground text-sm">
              Agents can claim repos via Mail to prevent conflicts during
              parallel agent-sweep runs.
            </p>
          </motion.div>
        </div>
      </Section>

      <Divider />

      {/* Section 7: Exit Codes */}
      <Section title="Exit Codes" icon={<Play className="h-5 w-5" />} delay={0.35}>
        <Paragraph>
          RU uses meaningful exit codes for scripting and automation.
        </Paragraph>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <code className="text-emerald-400 font-mono">0</code>
            <span className="text-white/80 ml-2">Success</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <code className="text-amber-400 font-mono">1</code>
            <span className="text-white/80 ml-2">Partial failure (some repos failed)</span>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <code className="text-red-400 font-mono">2</code>
            <span className="text-white/80 ml-2">Conflicts (manual resolution needed)</span>
          </div>
          <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
            <code className="text-violet-400 font-mono">5</code>
            <span className="text-white/80 ml-2">Interrupted (use --resume)</span>
          </div>
        </div>
      </Section>
    </div>
  );
}

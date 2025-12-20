"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { Check, Copy, Terminal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useDetectedOS, useUserOS } from "@/lib/userPreferences";

export interface CommandCardProps {
  /** The default command to display */
  command: string;
  /** Mac-specific command (if different from default) */
  macCommand?: string;
  /** Windows-specific command (if different from default) */
  windowsCommand?: string;
  /** Description text shown above the command */
  description?: string;
  /** Whether to show the "I ran this" checkbox */
  showCheckbox?: boolean;
  /** Unique ID for persisting checkbox state in localStorage */
  persistKey?: string;
  /** Callback when checkbox is checked */
  onComplete?: () => void;
  /** Additional class names */
  className?: string;
}

type OS = "mac" | "windows" | "linux";

type CheckedState = boolean | "indeterminate";

const COMPLETION_KEY_PREFIX = "acfs-command-";
const completionListenersByKey = new Map<string, Set<() => void>>();

function getCompletionKey(persistKey: string | undefined): string | null {
  return persistKey ? `${COMPLETION_KEY_PREFIX}${persistKey}` : null;
}

function emitCompletionChange(key: string) {
  const listeners = completionListenersByKey.get(key);
  if (!listeners) return;
  listeners.forEach((listener) => listener());
}

function subscribeToCompletion(key: string, callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}; // No-op on server
  }

  const listeners = completionListenersByKey.get(key) ?? new Set();
  listeners.add(callback);
  completionListenersByKey.set(key, listeners);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === key) callback();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    const set = completionListenersByKey.get(key);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        completionListenersByKey.delete(key);
      }
    }
    window.removeEventListener("storage", handleStorage);
  };
}

function getCompletionSnapshot(key: string | null): boolean {
  if (!key || typeof window === "undefined") return false;
  return localStorage.getItem(key) === "true";
}

export function CommandCard({
  command,
  macCommand,
  windowsCommand,
  description,
  showCheckbox = false,
  persistKey,
  onComplete,
  className,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyAnimation, setCopyAnimation] = useState(false);

  const [storedOS] = useUserOS();
  const detectedOS = useDetectedOS();
  const os: OS = storedOS ?? detectedOS ?? "mac";

  // Use useSyncExternalStore for completion state
  const completionKey = getCompletionKey(persistKey);
  const completed = useSyncExternalStore(
    (callback) => {
      if (!completionKey) return () => {};
      return subscribeToCompletion(completionKey, callback);
    },
    () => getCompletionSnapshot(completionKey),
    () => false // Server snapshot
  );

  // Get the appropriate command for the current OS
  const displayCommand = (() => {
    if (os === "mac" && macCommand) return macCommand;
    if (os === "windows" && windowsCommand) return windowsCommand;
    return command;
  })();

  const handleCopy = useCallback(async () => {
    setCopyAnimation(true);
    try {
      await navigator.clipboard.writeText(displayCommand);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyAnimation(false);
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = displayCommand;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyAnimation(false);
      }, 2000);
    }
  }, [displayCommand]);

  const handleCheckboxChange = useCallback(
    (checked: CheckedState) => {
      const isChecked = checked === true;

      if (completionKey && typeof window !== "undefined") {
        localStorage.setItem(completionKey, isChecked ? "true" : "false");
        emitCompletionChange(completionKey);
      }

      if (isChecked && onComplete) {
        onComplete();
      }
    },
    [completionKey, onComplete]
  );

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300",
        completed && "border-[oklch(0.72_0.19_145/0.3)] bg-[oklch(0.72_0.19_145/0.05)]",
        !completed && "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {/* Description */}
      {description && (
        <div className="border-b border-border/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}

      {/* Command area */}
      <div className="relative flex items-stretch">
        {/* Terminal icon */}
        <div className="flex items-center justify-center border-r border-border/30 bg-muted/30 px-4">
          <Terminal className="h-4 w-4 text-primary" />
        </div>

        {/* Command text */}
        <div className="flex flex-1 items-center overflow-x-auto px-4 py-3">
          <code className="whitespace-nowrap font-mono text-sm text-foreground">
            {displayCommand}
          </code>
        </div>

        {/* Copy button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-auto w-14 shrink-0 rounded-none border-l border-border/30 transition-all duration-300",
            copied && "bg-[oklch(0.72_0.19_145/0.1)] text-[oklch(0.72_0.19_145)]",
            copyAnimation && "scale-95"
          )}
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy command"}
        >
          {copied ? (
            <Check className="h-4 w-4 animate-scale-in" />
          ) : (
            <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
          )}
        </Button>

        {/* Shimmer effect on copy */}
        {copyAnimation && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
        )}
      </div>

      {/* Checkbox area */}
      {showCheckbox && (
        <div
          className={cn(
            "flex items-center gap-3 border-t border-border/30 px-4 py-3 transition-colors",
            completed && "bg-[oklch(0.72_0.19_145/0.05)]"
          )}
        >
          <Checkbox
            id={persistKey || "command-completed"}
            checked={completed}
            onCheckedChange={handleCheckboxChange}
            className={cn(
              "transition-all",
              completed && "border-[oklch(0.72_0.19_145)] bg-[oklch(0.72_0.19_145)] text-[oklch(0.15_0.02_145)]"
            )}
          />
          <label
            htmlFor={persistKey || "command-completed"}
            className={cn(
              "flex cursor-pointer items-center gap-2 text-sm transition-colors",
              completed ? "text-[oklch(0.72_0.19_145)]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Command completed</span>
              </>
            ) : (
              <span>I ran this command</span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}

/**
 * A variant of CommandCard specifically for displaying multi-line code blocks
 */
export function CodeBlock({
  code,
  language = "bash",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 bg-[oklch(0.08_0.015_260)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[oklch(0.72_0.19_145)]" />
              <span className="text-[oklch(0.72_0.19_145)]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-relaxed text-foreground">
          {code}
        </code>
      </pre>
    </div>
  );
}

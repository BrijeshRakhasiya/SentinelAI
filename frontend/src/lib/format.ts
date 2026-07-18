import type { Decision, DecidedBy, Severity } from "../api/types";

export const severityConfig: Record<
  Severity,
  { label: string; dot: string; badge: string }
> = {
  low: {
    label: "Low",
    dot: "bg-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  high: {
    label: "High",
    dot: "bg-red-400",
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
  },
};

export const decisionConfig: Record<
  Decision,
  { label: string; badge: string; bar: string }
> = {
  auto_resolve: {
    label: "Auto-Resolved",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    bar: "bg-emerald-400",
  },
  escalate: {
    label: "Escalated",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    bar: "bg-amber-400",
  },
};

export const decidedByLabel: Record<DecidedBy, string> = {
  gemini: "Gemini",
  cache: "Cached response",
  fallback: "Fallback rule",
};

export function timeAgo(timestampMs: number, nowMs = Date.now()): string {
  const seconds = Math.max(0, Math.round((nowMs - timestampMs) / 1000));
  if (seconds < 2) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function formatMinutesSaved(autoResolvedCount: number): string {
  // Rough estimate: ~4 minutes of analyst triage time saved per alert
  // the agent resolved on its own -- for the demo's "time saved" framing.
  const minutes = autoResolvedCount * 4;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}

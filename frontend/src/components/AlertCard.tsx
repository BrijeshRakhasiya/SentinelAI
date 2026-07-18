import { AlertTriangle, ArrowUpRight, Cpu, Database, MessageSquareQuote, ShieldCheck, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { FeedItem } from "../hooks/useAlertStream";
import { decidedByLabel, decisionConfig, severityConfig, timeAgo } from "../lib/format";

const decidedByIcon = {
  gemini: Sparkles,
  cache: Database,
  fallback: Cpu,
} as const;

export function AlertCard({ item }: { item: FeedItem }) {
  const { alert, decision, confidence, reasoning, suggested_action, decided_by } = item;
  const severity = severityConfig[alert.severity];
  const decisionMeta = decisionConfig[decision];
  const DecisionIcon = decision === "auto_resolve" ? ShieldCheck : AlertTriangle;
  const DecidedByIcon = decidedByIcon[decided_by];

  return (
    <article className="animate-slide-in rounded-xl border border-sentinel-border bg-sentinel-panel/70 p-4 transition-colors hover:border-sentinel-border/80 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className={clsx("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", severity.dot)} />
          <div>
            <p className="font-mono text-[11px] tracking-wide text-slate-500">{alert.id}</p>
            <h3 className="text-sm font-semibold leading-snug text-slate-100 sm:text-base">{alert.title}</h3>
          </div>
        </div>

        <span
          className={clsx(
            "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
            decisionMeta.badge
          )}
        >
          <DecisionIcon className="h-3.5 w-3.5" />
          {decisionMeta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={clsx("rounded-full border px-2 py-0.5 text-[11px] font-medium", severity.badge)}>
          {severity.label} severity
        </span>
        <span className="rounded-full border border-sentinel-border bg-black/20 px-2 py-0.5 text-[11px] font-medium text-slate-400">
          {alert.source}
        </span>
        <span className="rounded-full border border-sentinel-border bg-black/20 px-2 py-0.5 text-[11px] font-medium text-slate-400">
          {alert.category.replace(/_/g, " ")}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
          <DecidedByIcon className="h-3 w-3" />
          {decidedByLabel[decided_by]}
          <span className="text-slate-600">·</span>
          {timeAgo(item.receivedAt)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-400">{alert.description}</p>

      <div className="mt-3 flex gap-2 rounded-lg border border-sentinel-border/70 bg-black/20 p-3">
        <MessageSquareQuote className="mt-0.5 h-4 w-4 flex-shrink-0 text-sentinel-cyan" />
        <p className="text-sm leading-relaxed text-slate-300">{reasoning}</p>
      </div>

      {suggested_action && (
        <div className="mt-2.5 flex items-start gap-2 text-sm text-slate-400">
          <ArrowUpRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <p>
            <span className="font-medium text-slate-300">Suggested action: </span>
            {suggested_action}
          </p>
        </div>
      )}

      <div className="mt-3.5 flex items-center gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Confidence</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/30">
          <div
            className={clsx("h-full rounded-full transition-all", decisionMeta.bar)}
            style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
          />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-300">{confidence}%</span>
      </div>
    </article>
  );
}

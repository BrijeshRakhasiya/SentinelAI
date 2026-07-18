import { Clock, ListChecks, ShieldAlert, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { formatMinutesSaved } from "../lib/format";

interface StatCardsProps {
  total: number;
  autoResolved: number;
  escalated: number;
  lifetimeTotal?: number | null;
}

function Card({
  icon: Icon,
  iconClass,
  value,
  label,
  sublabel,
}: {
  icon: typeof ListChecks;
  iconClass: string;
  value: string | number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-sentinel-border bg-sentinel-panel/50 p-4">
      <div className="flex items-center justify-between">
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-lg", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-slate-500">{sublabel}</p>}
    </div>
  );
}

export function StatCards({ total, autoResolved, escalated, lifetimeTotal }: StatCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card
        icon={ListChecks}
        iconClass="bg-cyan-500/10 text-sentinel-cyan"
        value={total}
        label="Triaged this session"
        sublabel={lifetimeTotal != null ? `${lifetimeTotal} logged all-time` : undefined}
      />
      <Card
        icon={ShieldCheck}
        iconClass="bg-emerald-500/10 text-emerald-400"
        value={autoResolved}
        label="Auto-resolved"
        sublabel={total > 0 ? `${Math.round((autoResolved / total) * 100)}% of session` : undefined}
      />
      <Card
        icon={ShieldAlert}
        iconClass="bg-amber-500/10 text-amber-400"
        value={escalated}
        label="Escalated to analyst"
        sublabel={total > 0 ? `${Math.round((escalated / total) * 100)}% of session` : undefined}
      />
      <Card
        icon={Clock}
        iconClass="bg-blue-500/10 text-sentinel-blue"
        value={formatMinutesSaved(autoResolved)}
        label="Analyst time saved"
        sublabel="Estimated, ~4 min/alert"
      />
    </div>
  );
}

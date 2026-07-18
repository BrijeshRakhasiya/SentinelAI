import clsx from "clsx";

export type PillTone = "live" | "safe" | "caution" | "idle" | "danger";

interface StatusPillProps {
  label: string;
  tone: PillTone;
  pulse?: boolean;
  className?: string;
}

const toneClasses: Record<PillTone, string> = {
  live: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  caution: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  idle: "border-slate-600/40 bg-slate-500/10 text-slate-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
};

const dotClasses: Record<PillTone, string> = {
  live: "bg-cyan-400",
  safe: "bg-emerald-400",
  caution: "bg-amber-400",
  idle: "bg-slate-400",
  danger: "bg-red-400",
};

export function StatusPill({ label, tone, pulse = false, className }: StatusPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", dotClasses[tone], pulse && "animate-pulse-dot")}
      />
      {label}
    </span>
  );
}

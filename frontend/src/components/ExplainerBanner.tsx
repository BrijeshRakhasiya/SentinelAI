import { ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";

export function ExplainerBanner() {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-sentinel-border bg-gradient-to-r from-sentinel-panel/80 via-sentinel-panel/50 to-sentinel-panel/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10">
          <ShieldCheck className="h-5 w-5 text-sentinel-cyan" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Calibrated trust, not blanket automation.</p>
          <p className="mt-0.5 text-sm text-slate-400">
            SentinelAI auto-resolves the alerts it's confident about and escalates the rest — with a plain-English
            reason either way. Analysts only spend time on the 20% that actually needs judgment.
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 self-start rounded-full border border-sentinel-border bg-black/20 px-3 py-2 text-xs text-slate-400 sm:self-center">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Confident
        <ArrowRight className="h-3 w-3 text-slate-600" />
        Auto-resolve
        <span className="mx-1 text-slate-700">|</span>
        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
        Unsure
        <ArrowRight className="h-3 w-3 text-slate-600" />
        Escalate
      </div>
    </div>
  );
}

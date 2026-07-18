import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface AnalystDashboardProps {
  autoResolved: number;
  escalated: number;
}

const COLORS = {
  auto_resolve: "#34d399",
  escalate: "#fbbf24",
};

export function AnalystDashboard({ autoResolved, escalated }: AnalystDashboardProps) {
  const total = autoResolved + escalated;
  const automatedPct = total > 0 ? Math.round((autoResolved / total) * 100) : 0;

  const data = [
    { name: "Auto-Resolved", value: autoResolved, key: "auto_resolve" as const },
    { name: "Escalated", value: escalated, key: "escalate" as const },
  ];

  return (
    <section className="flex h-full flex-col rounded-2xl border border-sentinel-border bg-sentinel-panel/40 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <PieChartIcon className="h-4 w-4 text-sentinel-cyan" />
        <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Auto-Resolved vs Escalated</h2>
      </div>
      <p className="mb-2 text-xs text-slate-500">Live split for the current stream session.</p>

      <div className="relative flex-1" style={{ minHeight: 220 }}>
        {total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-500">
            <div className="h-28 w-28 rounded-full border-4 border-dashed border-sentinel-border" />
            <p className="text-xs">Waiting for triage results…</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={92}
                  paddingAngle={total > 1 ? 3 : 0}
                  strokeWidth={0}
                  isAnimationActive
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0b0f1a",
                    border: "1px solid #1b2333",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold text-slate-100">{automatedPct}%</span>
              <span className="text-[11px] uppercase tracking-wide text-slate-500">Automated</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.auto_resolve }} />
          Auto-Resolved ({autoResolved})
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.escalate }} />
          Escalated ({escalated})
        </span>
      </div>
    </section>
  );
}

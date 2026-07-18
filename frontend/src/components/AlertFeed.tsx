import { RefreshCw, Radio } from "lucide-react";
import type { FeedItem, StreamStatus } from "../hooks/useAlertStream";
import { AlertCard } from "./AlertCard";
import { StatusPill, type PillTone } from "./StatusPill";

interface AlertFeedProps {
  alerts: FeedItem[];
  status: StreamStatus;
  onRestart: () => void;
}

const statusMeta: Record<StreamStatus, { label: string; tone: PillTone; pulse?: boolean }> = {
  idle: { label: "Idle", tone: "idle" },
  connecting: { label: "Connecting…", tone: "idle" },
  streaming: { label: "Live", tone: "live", pulse: true },
  complete: { label: "Stream complete", tone: "safe" },
  error: { label: "Connection error", tone: "danger" },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-sentinel-border bg-sentinel-panel/50 p-4">
      <div className="mb-3 h-3 w-24 rounded bg-slate-700/40" />
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-700/40" />
      <div className="h-3 w-1/2 rounded bg-slate-700/30" />
    </div>
  );
}

export function AlertFeed({ alerts, status, onRestart }: AlertFeedProps) {
  const meta = statusMeta[status];
  const showReplay = status === "complete" || status === "error";
  const showSkeletons = alerts.length === 0 && (status === "connecting" || status === "idle");

  return (
    <section className="flex h-full flex-col rounded-2xl border border-sentinel-border bg-sentinel-panel/40 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-sentinel-cyan" />
          <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Live Alert Feed</h2>
          <span className="font-mono text-xs text-slate-500">
            {alerts.length}
            {status !== "idle" ? "/25" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label={meta.label} tone={meta.tone} pulse={meta.pulse} />
          {showReplay && (
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 rounded-full border border-sentinel-cyan/30 bg-sentinel-cyan/10 px-3 py-1 text-xs font-medium text-sentinel-cyan transition-colors hover:bg-sentinel-cyan/20"
            >
              <RefreshCw className="h-3 w-3" />
              Replay Demo
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 640 }}>
        {showSkeletons && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!showSkeletons && alerts.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-slate-500">
            <p className="text-sm">No alerts yet.</p>
          </div>
        )}

        {alerts.map((item) => (
          <AlertCard key={item.alert.id} item={item} />
        ))}
      </div>
    </section>
  );
}

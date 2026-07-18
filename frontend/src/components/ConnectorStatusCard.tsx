import { useEffect, useState } from "react";
import { RefreshCw, Satellite } from "lucide-react";
import { api } from "../api/client";
import type { ConnectorStatusValue, IntegrationStatusResponse } from "../api/types";
import { StatusPill, type PillTone } from "./StatusPill";
import { timeAgo } from "../lib/format";

const STATUS_META: Record<ConnectorStatusValue, { label: string; tone: PillTone }> = {
  connected: { label: "Connected", tone: "safe" },
  degraded: { label: "Degraded", tone: "caution" },
  offline: { label: "Offline", tone: "danger" },
  not_configured: { label: "Not configured", tone: "idle" },
};

const SOURCE_LABEL: Record<string, string> = {
  demo: "Demo dataset",
  real_world_json: "Real-world SOC alert feed",
  mcp: "MCP connector",
};

const REFRESH_INTERVAL_MS = 30_000;

/** Live connector/data-source status for the dashboard, backed by
 * GET /api/integrations/status -- see MCP_CREATION_PLAN.md "Phase 4". */
export function ConnectorStatusCard() {
  const [data, setData] = useState<IntegrationStatusResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.integrationStatus();
      setData(res);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connector = data?.connector;
  const statusMeta = connector ? STATUS_META[connector.status] : null;

  return (
    <div className="mb-6 rounded-2xl border border-sentinel-border bg-sentinel-panel/50 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10">
            <Satellite className="h-4 w-4 text-sentinel-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Active Alert Source</h3>
            <p className="text-xs text-slate-500">Live from the backend's ALERT_SOURCE configuration</p>
          </div>
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="rounded-lg border border-sentinel-border p-1.5 text-slate-400 transition-colors hover:text-sentinel-cyan"
        >
          <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
        </button>
      </div>

      {error && !data ? (
        <p className="text-sm text-slate-500">Couldn't reach the backend to check connector status.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-sentinel-border/70 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Source</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {data?.active_source_label ?? (data ? SOURCE_LABEL[data.alert_source] : "—")}
            </p>
          </div>

          <div className="rounded-xl border border-sentinel-border/70 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">MCP connector status</p>
            <div className="mt-1.5">
              {connector && statusMeta ? (
                <StatusPill label={statusMeta.label} tone={statusMeta.tone} pulse={connector.status === "connected"} />
              ) : (
                <span className="text-sm text-slate-500">Not in MCP mode</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-sentinel-border/70 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Last sync / fetched</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {connector?.last_sync ? `${timeAgo(new Date(connector.last_sync).getTime())}` : "—"}
              {connector && connector.alerts_fetched > 0 && (
                <span className="ml-1.5 font-normal text-slate-500">· {connector.alerts_fetched} alerts</span>
              )}
            </p>
          </div>
        </div>
      )}

      {connector?.error && (
        <p className="mt-3 text-xs text-red-300">Connector error: {connector.error}</p>
      )}

      {data && data.alert_source !== "mcp" && (
        <p className="mt-3 text-xs text-slate-500">
          Switch the backend's <code className="rounded bg-black/30 px-1 py-0.5 font-mono">ALERT_SOURCE</code> env var to{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 font-mono">mcp</code> to stream live alerts through the AWS
          GuardDuty MCP connector instead.
        </p>
      )}
    </div>
  );
}

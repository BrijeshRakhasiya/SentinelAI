import { useEffect, useState } from "react";
import clsx from "clsx";
import { RefreshCw, Satellite } from "lucide-react";
import { api } from "../api/client";
import type { ConnectorStatusValue, IntegrationStatusResponse } from "../api/types";
import { useAlertStreamContext } from "../context/AlertStreamContext";
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
 * GET /api/integrations/status -- see MCP_CREATION_PLAN.md "Phase 4".
 * Also lets an analyst switch the active source at runtime via
 * POST /api/integrations/source, then restarts the live feed so the
 * dashboard immediately reflects the new source. */
export function ConnectorStatusCard() {
  const [data, setData] = useState<IntegrationStatusResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [justSwitched, setJustSwitched] = useState(false);
  const { restart } = useAlertStreamContext();

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

  const switchSource = async (sourceId: string) => {
    if (!data || sourceId === data.alert_source || switching) return;
    setSwitching(sourceId);
    try {
      const res = await api.setIntegrationSource(sourceId);
      setData(res);
      setError(false);
      restart(); // re-open the SSE stream so the dashboard/chat pick up the new source immediately
      setJustSwitched(true);
      window.setTimeout(() => setJustSwitched(false), 4000);
    } catch {
      setError(true);
    } finally {
      setSwitching(null);
    }
  };

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
            <p className="text-xs text-slate-500">Switch sources live -- no backend restart needed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-sentinel-border bg-black/20 p-1">
              {data.available_sources.map((s) => {
                const active = s.id === data.alert_source;
                return (
                  <button
                    key={s.id}
                    onClick={() => switchSource(s.id)}
                    disabled={switching !== null}
                    title={`Switch to ${s.label}`}
                    className={clsx(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50",
                      active
                        ? "bg-sentinel-cyan/15 text-sentinel-cyan"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {switching === s.id ? "Switching…" : s.label}
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={load}
            title="Refresh"
            className="rounded-lg border border-sentinel-border p-1.5 text-slate-400 transition-colors hover:text-sentinel-cyan"
          >
            <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          </button>
        </div>
      </div>

      {justSwitched && (
        <p className="mb-3 text-xs text-sentinel-cyan">
          Switched source and restarted the live feed — check the Dashboard to see it stream in.
        </p>
      )}

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
    </div>
  );
}

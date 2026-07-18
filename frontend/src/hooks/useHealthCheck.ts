import { useEffect, useState } from "react";

export type HealthStatus = "checking" | "online" | "offline";

const API_URL = process.env.REACT_APP_API_URL ?? "";
const POLL_INTERVAL_MS = 20_000;

/** Lightweight periodic ping of GET /health, independent of the SSE session. */
export function useHealthCheck(): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { credentials: "include" });
        if (mounted) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (mounted) setStatus("offline");
      } finally {
        if (mounted) timer = setTimeout(check, POLL_INTERVAL_MS);
      }
    };

    check();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return status;
}

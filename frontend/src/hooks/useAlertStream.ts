import { useCallback, useEffect, useState } from "react";
import { streamUrl } from "../api/client";
import type { TriageResult } from "../api/types";

export type StreamStatus = "idle" | "connecting" | "streaming" | "complete" | "error";

export interface FeedItem extends TriageResult {
  /** Client-side receipt time -- the backend contract has no timestamp field. */
  receivedAt: number;
}

interface UseAlertStreamResult {
  alerts: FeedItem[];
  status: StreamStatus;
  /** Re-opens the SSE connection and clears the feed -- the backend stream is a finite 25-alert sequence. */
  restart: () => void;
}

/**
 * Opens `GET /api/stream` (Supabase-token-authenticated SSE) and accumulates
 * `TriageResult` events, newest first. The backend sends one `triage`
 * event per alert (~2s apart) then a final `done` event.
 */
export function useAlertStream(autoStart = true): UseAlertStreamResult {
  const [alerts, setAlerts] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState<StreamStatus>(autoStart ? "connecting" : "idle");
  const [started, setStarted] = useState(autoStart);
  const [session, setSession] = useState(0);

  const restart = useCallback(() => {
    setAlerts([]);
    setStatus("connecting");
    setStarted(true);
    setSession((s) => s + 1);
  }, []);

  useEffect(() => {
    if (!started) return;

    let source: EventSource | undefined;
    let cancelled = false;

    streamUrl().then((url) => {
      if (cancelled) return;
      source = new EventSource(url);

      source.addEventListener("triage", (evt) => {
        const messageEvent = evt as MessageEvent<string>;
        try {
          const result = JSON.parse(messageEvent.data) as TriageResult;
          setAlerts((prev) => [{ ...result, receivedAt: Date.now() }, ...prev]);
          setStatus("streaming");
        } catch {
          // Malformed event -- ignore rather than break the whole feed.
        }
      });

      source.addEventListener("done", () => {
        setStatus("complete");
        source?.close();
      });

      source.onerror = () => {
        setStatus((prev) => (prev === "complete" ? prev : "error"));
        source?.close();
      };
    });

    return () => {
      cancelled = true;
      source?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, session]);

  return { alerts, status, restart };
}

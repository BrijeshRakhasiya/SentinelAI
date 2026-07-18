import { createContext, ReactNode, useContext } from "react";
import { useAlertStream, FeedItem, StreamStatus } from "../hooks/useAlertStream";

interface AlertStreamContextValue {
  alerts: FeedItem[];
  status: StreamStatus;
  restart: () => void;
}

const AlertStreamContext = createContext<AlertStreamContextValue | undefined>(undefined);

/**
 * Owns the single SSE connection for the app. Mounted once in AppLayout so
 * both the dashboard feed/chart and the chat assistant see the same live
 * session data instead of each opening their own EventSource.
 */
export function AlertStreamProvider({ children }: { children: ReactNode }) {
  const stream = useAlertStream(true);
  return <AlertStreamContext.Provider value={stream}>{children}</AlertStreamContext.Provider>;
}

export function useAlertStreamContext(): AlertStreamContextValue {
  const ctx = useContext(AlertStreamContext);
  if (!ctx) {
    throw new Error("useAlertStreamContext must be used within an AlertStreamProvider");
  }
  return ctx;
}

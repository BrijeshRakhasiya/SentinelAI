import { useCallback, useState } from "react";
import { api, ApiError } from "../api/client";
import type { ChatContext, ChatMessage } from "../api/types";
import type { FeedItem } from "./useAlertStream";

function buildContext(alerts: FeedItem[]): ChatContext {
  const auto_resolved = alerts.filter((a) => a.decision === "auto_resolve").length;
  const escalated = alerts.filter((a) => a.decision === "escalate").length;
  return {
    total: alerts.length,
    auto_resolved,
    escalated,
    // Backend caps this at 25 anyway -- the full demo set fits comfortably.
    alerts: alerts.slice(0, 25).map((item) => ({
      id: item.alert.id,
      title: item.alert.title,
      severity: item.alert.severity,
      decision: item.decision,
      confidence: item.confidence,
      reasoning: item.reasoning,
    })),
  };
}

interface UseChatResult {
  messages: ChatMessage[];
  sending: boolean;
  error: string | null;
  send: (text: string) => Promise<string | null>;
}

/** Drives the chat assistant: sends the question + current session context to POST /api/chat. */
export function useChat(alerts: FeedItem[]): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string): Promise<string | null> => {
      const trimmed = text.trim();
      if (!trimmed || sending) return null;

      setError(null);
      const history = messages;
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setSending(true);

      try {
        const { reply } = await api.chat(trimmed, history, buildContext(alerts));
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        return reply;
      } catch (err) {
        const detail = err instanceof ApiError ? err.message : "Couldn't reach the assistant. Try again.";
        setError(detail);
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry -- ${detail}` }]);
        return null;
      } finally {
        setSending(false);
      }
    },
    [messages, alerts, sending]
  );

  return { messages, sending, error, send };
}

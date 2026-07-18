import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { ChatContext, ChatMessage } from "../api/types";
import { useAuth } from "./useAuth";
import type { FeedItem } from "./useAlertStream";

const STORAGE_PREFIX = "sentinelai:chat:";

function loadHistory(key: string | null): ChatMessage[] {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

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
  clear: () => void;
}

/**
 * Drives the chat assistant: sends the question + current session context to
 * POST /api/chat. History is kept per signed-in user (keyed by their
 * Supabase email) in localStorage, so each analyst sees only their own past
 * conversation and it survives page reloads.
 */
export function useChat(alerts: FeedItem[]): UseChatResult {
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_PREFIX}${user.username}` : null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load this user's saved history whenever they sign in (or switch accounts).
  useEffect(() => {
    setMessages(loadHistory(storageKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist on every change so a refresh (or reopening the panel) keeps history.
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Storage full/unavailable -- chat still works for the rest of the session.
    }
  }, [messages, storageKey]);

  const clear = useCallback(() => {
    setMessages([]);
    if (storageKey) localStorage.removeItem(storageKey);
  }, [storageKey]);

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

  return { messages, sending, error, send, clear };
}

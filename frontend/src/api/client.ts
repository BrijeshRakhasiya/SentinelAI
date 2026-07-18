import { supabase } from "../lib/supabaseClient";
import type { ChatContext, ChatMessage, ChatResponse, IntegrationStatusResponse, StatsResponse } from "./types";

/**
 * Empty string means "same origin, relative paths" -- in dev that is
 * proxied to the backend by src/setupProxy.js, in production it can be
 * pointed at the deployed backend origin via REACT_APP_API_URL.
 */
const API_URL = process.env.REACT_APP_API_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Current Supabase access token, or null if signed out. Login/session are
 * owned entirely by Supabase; the backend only verifies this token. */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText || "Request failed";
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response wasn't JSON -- keep statusText
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  stats: () => request<StatsResponse>("/api/stats"),

  chat: (message: string, history: ChatMessage[], context: ChatContext) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history, context }),
    }),

  integrationStatus: () => request<IntegrationStatusResponse>("/api/integrations/status"),
};

/**
 * Full URL for the SSE triage stream. Native EventSource can't set an
 * Authorization header, so the Supabase access token is passed as a query
 * param instead (verified the same way on the backend).
 */
export const streamUrl = async (): Promise<string> => {
  const token = await getAccessToken();
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_URL}/api/stream${query}`;
};

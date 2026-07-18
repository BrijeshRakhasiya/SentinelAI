import type { StatsResponse, UserInfo } from "./types";

/**
 * Empty string means "same origin, relative paths" -- in dev that is
 * proxied to the backend by src/setupProxy.js, in production it can be
 * pointed at the deployed backend origin via REACT_APP_API_URL.
 */
const API_URL = process.env.REACT_APP_API_URL ?? "";

const CSRF_HEADER = "X-Requested-With";
const CSRF_VALUE = "SentinelAI";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutating = method !== "GET" && method !== "HEAD";

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(isMutating ? { [CSRF_HEADER]: CSRF_VALUE } : {}),
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
  login: (username: string, password: string) =>
    request<UserInfo>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request<{ detail: string }>("/auth/logout", { method: "POST" }),

  me: () => request<UserInfo>("/auth/me"),

  stats: () => request<StatsResponse>("/api/stats"),
};

/** Full URL for the SSE triage stream -- consumed directly by EventSource. */
export const streamUrl = () => `${API_URL}/api/stream`;

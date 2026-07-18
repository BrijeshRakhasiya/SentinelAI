/**
 * Types mirror backend/app/schemas exactly (Alert, TriageResult, StatsResponse,
 * UserInfo). Keep in sync with the FastAPI Pydantic models -- this is the
 * contract boundary between the two services.
 */

export type Severity = "low" | "medium" | "high";

export type Decision = "auto_resolve" | "escalate";

export type DecidedBy = "gemini" | "cache" | "fallback";

export interface Alert {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: Severity;
  category: string;
}

export interface TriageResult {
  alert: Alert;
  decision: Decision;
  confidence: number;
  reasoning: string;
  suggested_action: string;
  decided_by: DecidedBy;
}

export interface StatsResponse {
  total: number;
  auto_resolved: number;
  escalated: number;
}

export interface UserInfo {
  username: string;
}

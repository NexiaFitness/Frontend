/**
 * clientErrorReporter.ts — Envía errores del navegador al backend (OBS-FE).
 * No bloquea la UI; deduplica y limita envíos por sesión.
 */

import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";
import {
  configureApiTelemetry,
  getApiClientVersion,
  getLastRequestId,
  type ApiTelemetryErrorEvent,
} from "@nexia/shared/config/apiTelemetry";
import { resolveClientVersion } from "@/config/resolveClientVersion";
import { isChunkLoadError } from "@/lib/lazyWithRetry";

const MAX_REPORTS_PER_SESSION = 10;
const SESSION_COUNT_KEY = "nexia:client-error-reports";
const DEDUPE_MAX = 50;

export type ClientErrorKind =
  | "uncaught"
  | "unhandled_rejection"
  | "react_boundary"
  | "chunk_load"
  | "api_5xx"
  | "session_expired";

export interface ClientErrorPayload {
  kind: ClientErrorKind;
  message: string;
  stack?: string;
  route: string;
  client_version: string;
  request_id?: string;
  user_agent?: string;
}

const seenFingerprints = new Set<string>();

function currentRoute(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return `${window.location.pathname}${window.location.search}`;
}

function readBearerToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  } catch {
    return null;
  }
}

function sessionReportCount(): number {
  try {
    const raw = window.sessionStorage.getItem(SESSION_COUNT_KEY);
    const n = raw === null ? 0 : Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return MAX_REPORTS_PER_SESSION;
  }
}

function incrementSessionReportCount(): void {
  try {
    const next = sessionReportCount() + 1;
    window.sessionStorage.setItem(SESSION_COUNT_KEY, String(next));
  } catch {
    // ignore
  }
}

function fingerprint(payload: ClientErrorPayload): string {
  return [payload.kind, payload.route, payload.message.slice(0, 120)].join("|");
}

function shouldSend(payload: ClientErrorPayload): boolean {
  if (sessionReportCount() >= MAX_REPORTS_PER_SESSION) {
    return false;
  }
  const fp = fingerprint(payload);
  if (seenFingerprints.has(fp)) {
    return false;
  }
  seenFingerprints.add(fp);
  if (seenFingerprints.size > DEDUPE_MAX) {
    const first = seenFingerprints.values().next().value;
    if (first) {
      seenFingerprints.delete(first);
    }
  }
  return true;
}

function buildPayload(
  partial: Omit<ClientErrorPayload, "client_version" | "route"> &
    Partial<Pick<ClientErrorPayload, "route">>
): ClientErrorPayload {
  return {
    route: partial.route ?? currentRoute(),
    client_version: getApiClientVersion(),
    request_id: getLastRequestId() ?? undefined,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    ...partial,
  };
}

export function reportClientError(
  partial: Omit<ClientErrorPayload, "client_version" | "route"> &
    Partial<Pick<ClientErrorPayload, "route">>
): void {
  if (typeof window === "undefined") {
    return;
  }
  const payload = buildPayload(partial);
  if (!shouldSend(payload)) {
    return;
  }
  incrementSessionReportCount();
  void sendClientError(payload);
}

async function sendClientError(payload: ClientErrorPayload): Promise<void> {
  const url = `${API_CONFIG.BASE_URL}/client-errors`;
  const body = JSON.stringify(payload);
  const token = readBearerToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) {
        return;
      }
    }
    await fetch(url, {
      method: "POST",
      headers,
      body,
      keepalive: true,
    });
  } catch {
    // Never surface to the user
  }
}

function messageFromUnknown(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message || reason.name;
  }
  if (typeof reason === "string") {
    return reason;
  }
  try {
    return JSON.stringify(reason);
  } catch {
    return String(reason);
  }
}

function stackFromUnknown(reason: unknown): string | undefined {
  if (reason instanceof Error && reason.stack) {
    return reason.stack.slice(0, 8_000);
  }
  return undefined;
}

function onApiTelemetryError(event: ApiTelemetryErrorEvent): void {
  if (event.type === "session_expired") {
    reportClientError({
      kind: "session_expired",
      message: "auth session expired after refresh failure",
    });
    return;
  }
  reportClientError({
    kind: "api_5xx",
    message: `HTTP ${event.status} on ${event.endpoint}`,
  });
}

export function registerClientErrorReporting(): () => void {
  configureApiTelemetry({
    clientVersion: resolveClientVersion(),
    onApiError: onApiTelemetryError,
  });

  const onError = (
    message: string | Event,
    source?: string,
    _lineno?: number,
    _colno?: number,
    error?: Error
  ): void => {
    const err = error ?? (message instanceof ErrorEvent ? message.error : undefined);
    const text =
      typeof message === "string"
        ? message
        : err instanceof Error
          ? err.message
          : "Unknown script error";
    reportClientError({
      kind: "uncaught",
      message: text.slice(0, 2_000),
      stack: err?.stack?.slice(0, 8_000),
    });
  };

  const onRejection = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    if (isChunkLoadError(reason)) {
      reportClientError({
        kind: "chunk_load",
        message: messageFromUnknown(reason),
        stack: stackFromUnknown(reason),
      });
      return;
    }
    reportClientError({
      kind: "unhandled_rejection",
      message: messageFromUnknown(reason),
      stack: stackFromUnknown(reason),
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}

export function reportReactBoundaryError(error: Error, componentStack: string): void {
  const kind: ClientErrorKind = isChunkLoadError(error) ? "chunk_load" : "react_boundary";
  reportClientError({
    kind,
    message: error.message.slice(0, 2_000),
    stack: (error.stack ?? componentStack).slice(0, 8_000),
  });
}

/** For tests */
export function resetClientErrorReporterForTests(): void {
  seenFingerprints.clear();
  try {
    window.sessionStorage.removeItem(SESSION_COUNT_KEY);
  } catch {
    // ignore
  }
}

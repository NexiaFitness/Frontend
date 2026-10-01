/**
 * Injected telemetry for API client (client version header + error hooks).
 * Web app configures values; shared stays free of DOM/reporter imports.
 */

export type ApiTelemetryErrorEvent =
    | { type: "http_5xx"; status: number; endpoint: string }
    | { type: "session_expired" };

export const CLIENT_VERSION_HEADER = "X-Client-Version";
export const REQUEST_ID_HEADER = "X-Request-ID";

let clientVersion = "unknown";
let onApiError: ((event: ApiTelemetryErrorEvent) => void) | null = null;
let lastRequestId: string | null = null;
let lastRefreshNetworkFailure = false;

export function configureApiTelemetry(options: {
    clientVersion: string;
    onApiError?: (event: ApiTelemetryErrorEvent) => void;
}): void {
    clientVersion = options.clientVersion.trim() || "unknown";
    onApiError = options.onApiError ?? null;
}

export function getApiClientVersion(): string {
    return clientVersion;
}

export function notifyApiError(event: ApiTelemetryErrorEvent): void {
    onApiError?.(event);
}

export function noteResponseRequestId(headers: Headers): void {
    const rid = headers.get(REQUEST_ID_HEADER);
    if (rid && rid.length > 0) {
        lastRequestId = rid;
    }
}

export function getLastRequestId(): string | null {
    return lastRequestId;
}

export function noteRefreshNetworkFailure(): void {
    lastRefreshNetworkFailure = true;
}

export function clearRefreshNetworkFailure(): void {
    lastRefreshNetworkFailure = false;
}

export function hadRecentRefreshNetworkFailure(): boolean {
    return lastRefreshNetworkFailure;
}

export function resetApiTelemetryForTests(): void {
    clientVersion = "unknown";
    onApiError = null;
    lastRequestId = null;
    lastRefreshNetworkFailure = false;
}

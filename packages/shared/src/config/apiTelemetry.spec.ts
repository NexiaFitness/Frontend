import { describe, expect, it, vi } from "vitest";
import {
  CLIENT_VERSION_HEADER,
  configureApiTelemetry,
  getApiClientVersion,
  notifyApiError,
  resetApiTelemetryForTests,
} from "./apiTelemetry";

describe("apiTelemetry", () => {
  it("exposes configured client version", () => {
    resetApiTelemetryForTests();
    configureApiTelemetry({ clientVersion: "abc123" });
    expect(getApiClientVersion()).toBe("abc123");
    expect(CLIENT_VERSION_HEADER).toBe("X-Client-Version");
  });

  it("forwards api error events to injected handler", () => {
    resetApiTelemetryForTests();
    const handler = vi.fn();
    configureApiTelemetry({ clientVersion: "v1", onApiError: handler });
    notifyApiError({ type: "session_expired" });
    expect(handler).toHaveBeenCalledWith({ type: "session_expired" });
  });
});

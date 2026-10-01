import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLIENT_VERSION_HEADER,
  configureApiTelemetry,
  resetApiTelemetryForTests,
} from "@nexia/shared/config/apiTelemetry";
import {
  reportClientError,
  resetClientErrorReporterForTests,
} from "../clientErrorReporter";

describe("clientErrorReporter", () => {
  beforeEach(() => {
    resetApiTelemetryForTests();
    resetClientErrorReporterForTests();
    configureApiTelemetry({ clientVersion: "test-version-42" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    vi.stubGlobal("navigator", {
      ...navigator,
      sendBeacon: vi.fn().mockReturnValue(false),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON body and X-Client-Version header to client-errors", async () => {
    reportClientError({
      kind: "uncaught",
      message: "boom",
      route: "/qa-route",
    });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/client-errors");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    const headers = init.headers as Record<string, string>;
    expect(headers[CLIENT_VERSION_HEADER]).toBe("test-version-42");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      kind: "uncaught",
      message: "boom",
      route: "/qa-route",
      client_version: "test-version-42",
    });
  });

  it("deduplicates identical reports in the same session", async () => {
    reportClientError({ kind: "uncaught", message: "same" });
    reportClientError({ kind: "uncaught", message: "same" });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

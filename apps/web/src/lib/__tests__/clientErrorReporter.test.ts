import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureApiTelemetry, resetApiTelemetryForTests } from "@nexia/shared/config/apiTelemetry";
import {
  reportClientError,
  resetClientErrorReporterForTests,
} from "../clientErrorReporter";

describe("clientErrorReporter", () => {
  beforeEach(() => {
    resetApiTelemetryForTests();
    resetClientErrorReporterForTests();
    configureApiTelemetry({ clientVersion: "test-version" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts client errors to the backend", async () => {
    reportClientError({
      kind: "uncaught",
      message: "boom",
    });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/client-errors"),
      expect.objectContaining({
        method: "POST",
        keepalive: true,
      })
    );
  });

  it("deduplicates identical reports in the same session", async () => {
    reportClientError({ kind: "uncaught", message: "same" });
    reportClientError({ kind: "uncaught", message: "same" });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

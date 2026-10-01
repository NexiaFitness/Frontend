/**
 * pwaSessionRunRoute.test.ts — Rutas donde se oculta el banner PWA.
 * @author Frontend Team
 * @since v5.x
 */

import { describe, expect, it } from "vitest";
import { isAthleteSessionRunPath } from "../pwaSessionRunRoute";

describe("isAthleteSessionRunPath", () => {
  it("detecta la ruta de ejecución guiada", () => {
    expect(isAthleteSessionRunPath("/dashboard/sessions/42/run")).toBe(true);
    expect(isAthleteSessionRunPath("/dashboard/sessions/42/run/")).toBe(true);
  });

  it("ignora preview, feedback y otras rutas", () => {
    expect(isAthleteSessionRunPath("/dashboard/sessions/42")).toBe(false);
    expect(isAthleteSessionRunPath("/dashboard/sessions/42/feedback")).toBe(false);
    expect(isAthleteSessionRunPath("/dashboard")).toBe(false);
  });
});

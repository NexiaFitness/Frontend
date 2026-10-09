/**
 * athleteProgressNavigation.spec.ts — Destino de Volver en Mi progreso.
 * @author Frontend Team
 * @since v6.1.0
 */

import { describe, expect, it } from "vitest";
import { athleteProgressBackPath } from "./athleteProgressNavigation";

describe("athleteProgressBackPath", () => {
    it("defaults to dashboard", () => {
        expect(athleteProgressBackPath(null)).toBe("/dashboard");
        expect(athleteProgressBackPath({ entry: "record" })).toBe("/dashboard");
    });

    it("accepts an internal from path", () => {
        expect(athleteProgressBackPath({ from: "/dashboard/my-plan" })).toBe(
            "/dashboard/my-plan"
        );
    });

    it("rejects protocol-relative paths", () => {
        expect(athleteProgressBackPath({ from: "//evil.example" })).toBe("/dashboard");
    });
});

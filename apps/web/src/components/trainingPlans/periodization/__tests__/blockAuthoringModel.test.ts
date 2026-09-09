/**
 * blockAuthoringModel.test.ts — Reglas de navegación D-PAP / QP.
 */

import { describe, expect, it } from "vitest";

import {
    canNavigateToBlockAuthorStep,
    nextBlockAuthorStep,
} from "../blockAuthoringModel";

describe("canNavigateToBlockAuthorStep", () => {
    it("permite avanzar al paso inmediato aunque maxReachedStep esté desfasado", () => {
        const next = nextBlockAuthorStep("volumeIntensity");
        expect(next).toBe("days");
        expect(
            canNavigateToBlockAuthorStep(
                "create",
                "days",
                "volumeIntensity",
                "qualities",
            ),
        ).toBe(true);
    });

    it("bloquea saltos de más de un paso hacia delante en create", () => {
        expect(
            canNavigateToBlockAuthorStep(
                "create",
                "patterns",
                "qualities",
                "qualities",
            ),
        ).toBe(false);
    });

    it("permite saltos libres en edit", () => {
        expect(
            canNavigateToBlockAuthorStep(
                "edit",
                "summary",
                "qualities",
                "qualities",
            ),
        ).toBe(true);
    });
});

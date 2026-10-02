/**
 * blockAuthoringStepGuard.test.ts — QA-NAV-1: URL no adelanta pasos no alcanzables.
 */

import { describe, expect, it } from "vitest";

import { resolveBlockAuthorStepForWizardState } from "../blockAuthoringStepGuard";

describe("resolveBlockAuthorStepForWizardState", () => {
    it("edit sin estructura hidratada no permite summary ni patterns", () => {
        expect(
            resolveBlockAuthorStepForWizardState("summary", "edit", {
                structureReady: false,
                activeDayCount: 0,
                patternsComplete: false,
            }),
        ).toBe("qualities");
        expect(
            resolveBlockAuthorStepForWizardState("patterns", "edit", {
                structureReady: false,
                activeDayCount: 0,
                patternsComplete: false,
            }),
        ).toBe("qualities");
    });

    it("summary sin días activos vuelve a days", () => {
        expect(
            resolveBlockAuthorStepForWizardState("summary", "create", {
                structureReady: true,
                activeDayCount: 0,
                patternsComplete: false,
            }),
        ).toBe("days");
    });

    it("summary sin patrones completos vuelve a patterns", () => {
        expect(
            resolveBlockAuthorStepForWizardState("summary", "edit", {
                structureReady: true,
                activeDayCount: 2,
                patternsComplete: false,
            }),
        ).toBe("patterns");
    });

    it("paso válido no cambia", () => {
        expect(
            resolveBlockAuthorStepForWizardState("days", "edit", {
                structureReady: true,
                activeDayCount: 1,
                patternsComplete: false,
            }),
        ).toBe("days");
    });
});

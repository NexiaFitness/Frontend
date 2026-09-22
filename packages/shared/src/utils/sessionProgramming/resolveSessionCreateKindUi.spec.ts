import { describe, expect, it } from "vitest";

import {
    isProgramCreateContextLocked,
    resolveSessionCreateKindUi,
} from "./resolveSessionCreateKindUi";

describe("resolveSessionCreateKindUi", () => {
    const base = {
        planIdFromUrl: null as number | null,
        activePlanCoversDate: true,
        programPlanActivationOk: true,
        inProgramPhaseWithPlannedValues: true,
        existingSessionsOnDayCount: 0,
    };

    it("locked program, sin sesiones — none (flujo feliz)", () => {
        expect(
            resolveSessionCreateKindUi({
                ...base,
                sessionKind: "program",
                planIdFromUrl: 531,
            }),
        ).toEqual({ variant: "none" });
    });

    it("locked program con sesiones previas — none (coexistencia aparte)", () => {
        expect(
            resolveSessionCreateKindUi({
                ...base,
                sessionKind: "program",
                planIdFromUrl: 531,
                existingSessionsOnDayCount: 1,
            }),
        ).toEqual({ variant: "none" });
    });

    it("fuera de fase — segmented", () => {
        expect(
            resolveSessionCreateKindUi({
                ...base,
                sessionKind: "program",
                inProgramPhaseWithPlannedValues: false,
            }),
        ).toEqual({ variant: "segmented" });
    });

    it("standalone sin plan en fecha — none", () => {
        expect(
            resolveSessionCreateKindUi({
                ...base,
                sessionKind: "standalone",
                activePlanCoversDate: false,
            }),
        ).toEqual({ variant: "none" });
    });

    it("standalone con plan — volver a programa", () => {
        expect(
            resolveSessionCreateKindUi({
                ...base,
                sessionKind: "standalone",
                activePlanCoversDate: true,
            }),
        ).toEqual({
            variant: "implicit_standalone",
            showProgramSwitch: true,
        });
    });

    it("isProgramCreateContextLocked — false si planId incoherente", () => {
        expect(
            isProgramCreateContextLocked({
                planIdFromUrl: 99,
                activePlanCoversDate: true,
                programPlanActivationOk: false,
                inProgramPhaseWithPlannedValues: true,
            }),
        ).toBe(false);
    });
});

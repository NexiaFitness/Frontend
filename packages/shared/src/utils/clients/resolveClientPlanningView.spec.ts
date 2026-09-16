import { describe, expect, it } from "vitest";

import {
    classifyFocusedPlanFetchError,
    resolveClientPlanningView,
} from "./resolveClientPlanningView";

describe("resolveClientPlanningView", () => {
    it("hub cuando no hay activo ni focus", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: null,
                activePlanId: null,
                focusedFetchEnabled: false,
                focusedFetchLoading: false,
                focusedPlan: undefined,
                focusedFetchErrorKind: "none",
            }),
        ).toEqual({ kind: "hub", sanitizePlanParam: false });
    });

    it("detalle activo sin focus en URL", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: null,
                activePlanId: 10,
                focusedFetchEnabled: false,
                focusedFetchLoading: false,
                focusedPlan: undefined,
                focusedFetchErrorKind: "none",
            }),
        ).toEqual({
            kind: "plan_detail",
            planSource: "active",
            sanitizePlanParam: false,
        });
    });

    it("404 en focus obsoleto sin activo → hub + sanear", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: 530,
                activePlanId: null,
                focusedFetchEnabled: true,
                focusedFetchLoading: false,
                focusedPlan: undefined,
                focusedFetchErrorKind: "not_found",
            }),
        ).toEqual({ kind: "hub", sanitizePlanParam: true });
    });

    it("404 en focus obsoleto con activo → activo + sanear", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: 530,
                activePlanId: 600,
                focusedFetchEnabled: true,
                focusedFetchLoading: false,
                focusedPlan: undefined,
                focusedFetchErrorKind: "not_found",
            }),
        ).toEqual({
            kind: "plan_detail",
            planSource: "active",
            sanitizePlanParam: true,
        });
    });

    it("plan de otro cliente → fallback sanear", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: 99,
                activePlanId: null,
                focusedFetchEnabled: true,
                focusedFetchLoading: false,
                focusedPlan: { id: 99, client_id: 2 },
                focusedFetchErrorKind: "none",
            }),
        ).toEqual({ kind: "hub", sanitizePlanParam: true });
    });

    it("focus válido histórico", () => {
        expect(
            resolveClientPlanningView({
                clientId: 1,
                focusPlanId: 11,
                activePlanId: 10,
                focusedFetchEnabled: true,
                focusedFetchLoading: false,
                focusedPlan: { id: 11, client_id: 1 },
                focusedFetchErrorKind: "none",
            }),
        ).toEqual({
            kind: "plan_detail",
            planSource: "focused",
            sanitizePlanParam: false,
        });
    });
});

describe("classifyFocusedPlanFetchError", () => {
    it("not_found en 404", () => {
        expect(
            classifyFocusedPlanFetchError(true, { status: 404 }, undefined),
        ).toBe("not_found");
    });
});

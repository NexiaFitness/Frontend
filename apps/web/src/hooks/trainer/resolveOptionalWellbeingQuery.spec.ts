import { describe, expect, it } from "vitest";
import { resolveOptionalWellbeingQuery } from "./resolveOptionalWellbeingQuery";
import type { WellbeingCheckIn } from "@nexia/shared/types/trainingSessions";

const checkIn: WellbeingCheckIn = {
    id: 1,
    client_id: 2,
    session_id: 3,
    pre_fatigue_level: 2,
    risk_level: "low",
    recommendations: null,
    analysis_date: "2026-10-06",
    created_at: "",
    updated_at: "",
};

describe("resolveOptionalWellbeingQuery I10", () => {
    it("404 se presenta como ausencia, no como error", () => {
        const state = resolveOptionalWellbeingQuery({
            data: undefined,
            error: { status: 404, data: { detail: "not found" } },
            isError: true,
            isLoading: false,
            isFetching: false,
        });
        expect(state).toEqual({ checkIn: null, isLoading: false, isError: false });
    });

    it("500 o red no se camuflan como Sin check-in", () => {
        const state = resolveOptionalWellbeingQuery({
            data: undefined,
            error: { status: 500, data: { detail: "boom" } },
            isError: true,
            isLoading: false,
            isFetching: false,
        });
        expect(state.isError).toBe(true);
        expect(state.checkIn).toBeNull();
    });

    it("devuelve el check-in cuando existe", () => {
        const state = resolveOptionalWellbeingQuery({
            data: checkIn,
            error: undefined,
            isError: false,
            isLoading: false,
            isFetching: false,
        });
        expect(state.checkIn).toEqual(checkIn);
        expect(state.isError).toBe(false);
    });
});

import { describe, expect, it } from "vitest";
import { computeRunSuggestion, mapRpeDelta, resolvePrescribedRpe } from "./computeRunSuggestion";
import { shouldShowRunSuggestion } from "../../types/athleteRunSuggestion";
import type { AthleteRunSuggestionContext } from "../../types/athleteRunSuggestion";

function baseCtx(
    overrides: Partial<AthleteRunSuggestionContext> = {}
): AthleteRunSuggestionContext {
    return {
        lookup_key: { exercise_id: 42, step_key: "SBE:1:S1", set_index: 1 },
        input_mode: "weight_reps",
        prescribed_reps: 10,
        prescribed_reps_max: 10,
        prescribed_rpe: 8,
        prescribed_rir: null,
        reference: {
            weight_kg: 20,
            reps: 12,
            rpe: 7,
            rounds_completed: null,
            total_seconds: null,
            performed_at: "2026-06-23T10:00:00Z",
            source: "same_session_previous_set",
            basis_label: "Hoy · Serie 1",
        },
        exposure_count: 4,
        load_step_kg: 2.5,
        ...overrides,
    };
}

describe("computeRunSuggestion", () => {
    it("E1 — progresión RPE 7 vs objetivo 8 → +2.5 kg", () => {
        const result = computeRunSuggestion(baseCtx());
        expect(result).not.toBeNull();
        expect(result!.suggested_value).toBe(22.5);
        expect(result!.action).toBe("increase");
        expect(result!.show_card).toBe(true);
        expect(result!.confidence).toBe("medium");
    });

    it("E2 — mantener en objetivo (RPE 8 vs 8)", () => {
        const result = computeRunSuggestion(
            baseCtx({
                reference: {
                    ...baseCtx().reference!,
                    rpe: 8,
                },
            })
        );
        expect(result!.suggested_value).toBe(20);
        expect(result!.action).toBe("maintain");
        expect(result!.show_card).toBe(false);
    });

    it("E3 — retroceso RPE 9 vs objetivo 7", () => {
        const result = computeRunSuggestion(
            baseCtx({
                prescribed_rpe: 7,
                reference: {
                    weight_kg: 22.5,
                    reps: 8,
                    rpe: 9,
                    rounds_completed: null,
                    total_seconds: null,
                    performed_at: "2026-06-20",
                    source: "session_blocks",
                },
            })
        );
        expect(result!.suggested_value).toBe(20);
        expect(result!.action).toBe("decrease");
        expect(result!.show_card).toBe(true);
    });

    it("E4 — pocas exposiciones: mantener, tarjeta oculta", () => {
        const result = computeRunSuggestion(baseCtx({ exposure_count: 2 }));
        expect(result!.suggested_value).toBe(20);
        expect(result!.confidence).toBe("low");
        expect(result!.show_card).toBe(false);
    });

    it("E5 — double progression sin RPE, reps alcanzadas", () => {
        const result = computeRunSuggestion(
            baseCtx({
                reference: {
                    weight_kg: 20,
                    reps: 10,
                    rpe: null,
                    rounds_completed: null,
                    total_seconds: null,
                    performed_at: "2026-06-20",
                    source: "session_blocks",
                },
            })
        );
        expect(result!.action).toBe("increase");
        expect(result!.suggested_value).toBe(22.5);
    });

    it("E6 — double progression, reps bajas", () => {
        const result = computeRunSuggestion(
            baseCtx({
                reference: {
                    weight_kg: 20,
                    reps: 8,
                    rpe: null,
                    rounds_completed: null,
                    total_seconds: null,
                    performed_at: "2026-06-20",
                    source: "session_blocks",
                },
            })
        );
        expect(result!.action).toBe("maintain");
        expect(result!.show_card).toBe(false);
    });

    it("E7 — serie 2 contexto (misma lógica, ref serie 1 hoy)", () => {
        const result = computeRunSuggestion(
            baseCtx({
                lookup_key: { exercise_id: 42, step_key: "SBE:1:S2", set_index: 2 },
            })
        );
        expect(result!.suggested_value).toBe(22.5);
    });

    it("E9 — dropset DROP: no increase agresivo", () => {
        const result = computeRunSuggestion(
            baseCtx({
                group_kind: "dropset",
                slot_label: "DROP 1",
                reference: {
                    weight_kg: 30,
                    reps: 12,
                    rpe: 7,
                    rounds_completed: null,
                    total_seconds: null,
                    performed_at: "2026-06-20",
                    source: "session_blocks",
                },
            })
        );
        expect(result!.action).toBe("maintain");
        expect(result!.suggested_value).toBe(30);
    });

    it("sin referencia → null", () => {
        expect(computeRunSuggestion(baseCtx({ reference: null }))).toBeNull();
    });

    it("shouldShowRunSuggestion", () => {
        const visible = computeRunSuggestion(baseCtx());
        expect(shouldShowRunSuggestion(visible)).toBe(true);
        expect(shouldShowRunSuggestion(baseCtx({ exposure_count: 2 }))).toBe(false);
    });

    it("resolvePrescribedRpe — RIR a RPE", () => {
        expect(resolvePrescribedRpe(baseCtx({ prescribed_rpe: null, prescribed_rir: 2 }))).toBe(8);
    });

    it("mapRpeDelta", () => {
        expect(mapRpeDelta(-1)).toBe("increase");
        expect(mapRpeDelta(0)).toBe("maintain");
        expect(mapRpeDelta(1)).toBe("decrease");
    });
});

describe("computeRunSuggestion — timed", () => {
    it("E10 — AMRAP: no kg, maintain rounds", () => {
        const result = computeRunSuggestion(
            baseCtx({
                input_mode: "rounds_only",
                reference: {
                    weight_kg: null,
                    reps: null,
                    rpe: 7,
                    rounds_completed: 6,
                    total_seconds: null,
                    performed_at: "2026-06-18",
                    source: "timed_block",
                },
            })
        );
        expect(result!.metric).toBe("rounds");
        expect(result!.suggested_value).toBe(6);
        expect(result!.show_card).toBe(false);
    });
});

import { describe, expect, it } from "vitest";
import { resolveRunLoggerDefaults } from "./runReferenceUtils";

describe("resolveRunLoggerDefaults (P-SIMPLE autofill)", () => {
    const base = {
        prescribedReps: 8,
        prescribedRpe: 7 as number | null,
        defaultWeight: 40,
    };

    it("prefiere peso prescrito del entrenador sobre referencia", () => {
        const result = resolveRunLoggerDefaults({
            ...base,
            setIndex: 1,
            plannedWeight: 60,
            reference: {
                source: "last_session",
                weight_kg: 52.5,
                reps: 9,
                rpe: 7,
                rounds_completed: null,
                total_seconds: null,
                performed_at: null,
                session_date_label: null,
            },
        });
        expect(result.weight).toBe(60);
    });

    it("serie 1 sin prescrito usa referencia (última vez)", () => {
        const result = resolveRunLoggerDefaults({
            ...base,
            setIndex: 1,
            plannedWeight: null,
            reference: {
                source: "last_session",
                weight_kg: 52.5,
                reps: 9,
                rpe: 7,
                rounds_completed: null,
                total_seconds: null,
                performed_at: null,
                session_date_label: null,
            },
        });
        expect(result.weight).toBe(52.5);
    });

    it("serie 1 sin prescrito ni referencia usa defaultWeight", () => {
        const result = resolveRunLoggerDefaults({
            ...base,
            setIndex: 1,
            plannedWeight: null,
            reference: null,
        });
        expect(result.weight).toBe(40);
    });

    it("ignora referencia con peso 0 y usa defaultWeight del paso", () => {
        const result = resolveRunLoggerDefaults({
            ...base,
            setIndex: 1,
            plannedWeight: null,
            reference: {
                source: "previous_session_same_set",
                weight_kg: 0,
                reps: 5,
                rpe: 2,
                rounds_completed: null,
                total_seconds: null,
                performed_at: null,
                session_date_label: null,
            },
        });
        expect(result.weight).toBe(40);
    });

    it("serie 2+ sin prescrito usa referencia contextual (p. ej. serie anterior hoy)", () => {
        const result = resolveRunLoggerDefaults({
            ...base,
            setIndex: 3,
            plannedWeight: null,
            reference: {
                source: "same_session_previous_set",
                weight_kg: 52.5,
                reps: 8,
                rpe: 7,
                rounds_completed: null,
                total_seconds: null,
                performed_at: null,
                session_date_label: "Hoy · Serie 2",
            },
        });
        expect(result.weight).toBe(52.5);
        expect(result.rpe).toBe(7);
    });
});

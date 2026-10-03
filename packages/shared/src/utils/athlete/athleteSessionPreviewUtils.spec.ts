/**
 * athleteSessionPreviewUtils.spec.ts — FE-1 preview por ejercicio.
 */

import { describe, expect, it } from "vitest";
import { buildAthletePreviewGroupRows } from "./athleteSessionPreviewUtils";
import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
} from "../../sessionProgramming/sessionBlockView";

function set(
    overrides: Partial<SessionExerciseSetView> = {}
): SessionExerciseSetView {
    return {
        label: "S1",
        index: 1,
        plannedReps: "5",
        plannedWeight: 80,
        plannedDuration: null,
        plannedRest: 120,
        effortCharacter: "rir",
        effortValue: 2,
        actualReps: null,
        actualWeight: null,
        actualEffortValue: null,
        rowLoggedSets: 0,
        sourceLineId: 1,
        ...overrides,
    };
}

function slot(
    overrides: Partial<SessionExerciseSlotView> = {}
): SessionExerciseSlotView {
    return {
        slotLabel: "S1",
        exerciseId: 11,
        exerciseName: "Sentadilla trasera",
        notes: null,
        plannedAssistanceKg: null,
        plannedDistance: null,
        sets: [set()],
        ...overrides,
    };
}

function group(
    overrides: Partial<SessionExerciseGroupView> = {}
): SessionExerciseGroupView {
    return {
        groupId: "g1",
        kind: "single_set",
        badgeLabel: "SINGLE SET",
        rounds: 3,
        timeCapMinutes: null,
        intervalSeconds: null,
        restBetweenSeconds: null,
        slots: [
            slot({
                sets: [set(), set({ label: "S2", index: 2 }), set({ label: "S3", index: 3 })],
            }),
        ],
        ...overrides,
    };
}

describe("buildAthletePreviewGroupRows FE-1", () => {
    it("single_set uniforme → 3×5 · 80 kg + secundario RIR/descanso", () => {
        const rows = buildAthletePreviewGroupRows(group());
        expect(rows).toHaveLength(1);
        expect(rows[0]?.title).toBe("Sentadilla trasera");
        expect(rows[0]?.detail).toContain("3×5");
        expect(rows[0]?.detail).toContain("80 kg");
        expect(rows[0]?.secondaryDetail).toContain("RIR 2");
        expect(rows[0]?.secondaryDetail).toContain("descanso");
    });

    it("superset → una fila por slot con A1/A2", () => {
        const rows = buildAthletePreviewGroupRows(
            group({
                kind: "superset",
                badgeLabel: "SUPERSET A",
                rounds: 5,
                restBetweenSeconds: 90,
                slots: [
                    slot({
                        slotLabel: "A1",
                        exerciseId: 11,
                        exerciseName: "Sentadilla trasera",
                        sets: [set({ label: "R1", plannedReps: "3" })],
                    }),
                    slot({
                        slotLabel: "A2",
                        exerciseId: 21,
                        exerciseName: "Dominada supina",
                        sets: [
                            set({
                                label: "R1",
                                plannedReps: "6",
                                plannedWeight: null,
                                plannedRest: null,
                            }),
                        ],
                        notes: "Cuidado con el codo",
                    }),
                ],
            })
        );
        expect(rows).toHaveLength(2);
        expect(rows[0]?.title).toMatch(/A1/);
        expect(rows[0]?.detail).toContain("5 rondas");
        expect(rows[0]?.detail).toContain("3 reps");
        expect(rows[1]?.title).toMatch(/A2/);
        expect(rows[1]?.notes).toBe("Cuidado con el codo");
        expect(rows[1]?.secondaryDetail).toContain("descanso");
    });

    it("muestra asistencia y distancia si existen; sin tempo inventado", () => {
        const rows = buildAthletePreviewGroupRows(
            group({
                slots: [
                    slot({
                        plannedAssistanceKg: 12,
                        plannedDistance: 200,
                        sets: [set({ plannedReps: null, plannedWeight: null, plannedDuration: 40 })],
                    }),
                ],
            })
        );
        expect(rows[0]?.detail).toContain("40 s");
        expect(rows[0]?.secondaryDetail).toContain("200 m");
        expect(rows[0]?.secondaryDetail).toContain("Asist.");
        expect(rows[0]?.detail.toLowerCase()).not.toContain("tempo");
        expect(rows[0]?.secondaryDetail?.toLowerCase()).not.toContain("tempo");
    });

    it("amrap → hint AMRAP en detalle", () => {
        const rows = buildAthletePreviewGroupRows(
            group({
                kind: "amrap",
                rounds: null,
                timeCapMinutes: 12,
                slots: [slot({ sets: [set({ plannedReps: "10", plannedWeight: null })] })],
            })
        );
        expect(rows[0]?.detail).toContain("AMRAP");
        expect(rows[0]?.detail).toMatch(/12 min|10 reps/);
    });
});

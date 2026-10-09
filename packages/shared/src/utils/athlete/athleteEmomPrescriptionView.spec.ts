import { describe, expect, it } from "vitest";
import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";
import {
    buildAthleteEmomPrescriptionView,
    formatAthletePrescriptionExerciseLine,
    formatEmomIntervalNumbersLabel,
} from "./athleteEmomPrescriptionView";

function emomGroup(partial: Partial<SessionExerciseGroupView>): SessionExerciseGroupView {
    return {
        groupId: "block-1-emom",
        kind: "emom",
        badgeLabel: "EMOM A · 12'",
        rounds: 4,
        timeCapMinutes: 12,
        intervalSeconds: 60,
        restBetweenSeconds: null,
        slots: [],
        ...partial,
    };
}

describe("formatEmomIntervalNumbersLabel", () => {
    it("rango contiguo", () => {
        expect(formatEmomIntervalNumbersLabel([1, 2, 3, 4, 5, 6])).toBe("Intervalos 1 al 6");
    });

    it("lista rotativa", () => {
        expect(formatEmomIntervalNumbersLabel([1, 4, 7, 10])).toBe("Intervalos 1, 4, 7, 10");
    });
});

describe("buildAthleteEmomPrescriptionView", () => {
    it("ventanas rotativas — 12×1 min, 3 ventanas, 4 rondas", () => {
        const group = emomGroup({
            rounds: 4,
            intervalSeconds: 60,
            slots: [
                {
                    slotLabel: "V1",
                    exerciseId: 1,
                    exerciseName: "Kettlebell Swings",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [{ label: "V1-1", index: 1, plannedReps: "15", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 1 }],
                },
                {
                    slotLabel: "V2",
                    exerciseId: 2,
                    exerciseName: "Flexiones",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [{ label: "V2-1", index: 1, plannedReps: "12", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 2 }],
                },
                {
                    slotLabel: "V3",
                    exerciseId: 3,
                    exerciseName: "Burpees",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [{ label: "V3-1", index: 1, plannedReps: "10", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 3 }],
                },
            ],
        });

        const view = buildAthleteEmomPrescriptionView(group);
        expect(view.totalIntervals).toBe(12);
        expect(view.totalDurationLabel).toBe("12:00 min");
        expect(view.intervalCadenceLabel).toBe("Cada 1:00 min");
        expect(view.isUniformStack).toBe(false);
        expect(view.intervalGroups.map((g) => g.intervalLabel)).toEqual([
            "Intervalos 1, 4, 7, 10",
            "Intervalos 2, 5, 8, 11",
            "Intervalos 3, 6, 9, 12",
        ]);
        expect(formatAthletePrescriptionExerciseLine("Kettlebell Swings", group.slots[0].sets[0])).toBe(
            "15 Kettlebell Swings"
        );
    });

    it("mismo stack — 6×2 min, una ventana, dos ejercicios", () => {
        const group = emomGroup({
            rounds: 6,
            intervalSeconds: 120,
            timeCapMinutes: 12,
            slots: [
                {
                    slotLabel: "V1",
                    exerciseId: 1,
                    exerciseName: "Kettlebell Swings",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [{ label: "V1-1", index: 1, plannedReps: "15", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 1 }],
                },
                {
                    slotLabel: "V1",
                    exerciseId: 3,
                    exerciseName: "Burpees",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [{ label: "V1-2", index: 2, plannedReps: "10", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 2 }],
                },
            ],
        });

        const view = buildAthleteEmomPrescriptionView(group);
        expect(view.totalIntervals).toBe(6);
        expect(view.isUniformStack).toBe(true);
        expect(view.intervalGroups).toHaveLength(1);
        expect(view.intervalGroups[0].intervalLabel).toBe("Intervalos 1 al 6");
        expect(view.intervalGroups[0].exercises.map((e) => e.name)).toEqual([
            "Kettlebell Swings",
            "Burpees",
        ]);
    });
});

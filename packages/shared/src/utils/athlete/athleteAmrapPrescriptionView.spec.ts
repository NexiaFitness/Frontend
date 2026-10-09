import { describe, expect, it } from "vitest";
import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";
import { buildAthleteAmrapPrescriptionView } from "./athleteAmrapPrescriptionView";

function amrapGroup(partial: Partial<SessionExerciseGroupView>): SessionExerciseGroupView {
    return {
        groupId: "block-1-amrap",
        kind: "amrap",
        badgeLabel: "AMRAP A",
        rounds: null,
        timeCapMinutes: 15,
        intervalSeconds: null,
        restBetweenSeconds: null,
        slots: [],
        ...partial,
    };
}

describe("buildAthleteAmrapPrescriptionView", () => {
    it("time cap + secuencia de la ronda", () => {
        const group = amrapGroup({
            timeCapMinutes: 15,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 10,
                    exerciseName: "Peso muerto con mancuernas",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "1",
                            index: 1,
                            plannedReps: "12",
                            plannedWeight: null,
                            plannedDuration: null,
                            plannedRest: null,
                            effortCharacter: null,
                            effortValue: null,
                            actualReps: null,
                            actualWeight: null,
                            actualEffortValue: null,
                            rowLoggedSets: 0,
                            sourceLineId: 1,
                        },
                    ],
                },
                {
                    slotLabel: "2",
                    exerciseId: 11,
                    exerciseName: "Saltos al cajón",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "2",
                            index: 1,
                            plannedReps: "9",
                            plannedWeight: null,
                            plannedDuration: null,
                            plannedRest: null,
                            effortCharacter: null,
                            effortValue: null,
                            actualReps: null,
                            actualWeight: null,
                            actualEffortValue: null,
                            rowLoggedSets: 0,
                            sourceLineId: 2,
                        },
                    ],
                },
                {
                    slotLabel: "3",
                    exerciseId: 12,
                    exerciseName: "Lanzamientos de balón a la pared",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "3",
                            index: 1,
                            plannedReps: "6",
                            plannedWeight: null,
                            plannedDuration: null,
                            plannedRest: null,
                            effortCharacter: null,
                            effortValue: null,
                            actualReps: null,
                            actualWeight: null,
                            actualEffortValue: null,
                            rowLoggedSets: 0,
                            sourceLineId: 3,
                        },
                    ],
                },
            ],
        });

        const view = buildAthleteAmrapPrescriptionView(group);
        expect(view.headerTitle).toBe("AMRAP TIME CAP");
        expect(view.totalDurationLabel).toBe("15:00 min (Cuenta atrás)");
        expect(view.objectiveLine).toContain("rondas");
        expect(view.exercises.map((e) => e.displayLine)).toEqual([
            "12 Peso muerto con mancuernas",
            "9 Saltos al cajón",
            "6 Lanzamientos de balón a la pared",
        ]);
    });

    it("muestra rondas objetivo si vienen del bloque", () => {
        const view = buildAthleteAmrapPrescriptionView(
            amrapGroup({ rounds: 5, slots: [] })
        );
        expect(view.targetRoundsLabel).toBe("Rondas objetivo (referencia): 5");
    });
});

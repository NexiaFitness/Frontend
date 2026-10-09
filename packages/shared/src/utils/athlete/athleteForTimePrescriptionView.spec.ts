import { describe, expect, it } from "vitest";
import type { SessionExerciseGroupView, SessionExerciseSetView } from "../../sessionProgramming/sessionBlockView";
import {
    buildAthleteForTimePrescriptionView,
    FOR_TIME_OBJECTIVE_LINE,
    forTimePrescriptionVariesByRound,
} from "./athleteForTimePrescriptionView";

function baseSet(reps: string): SessionExerciseSetView {
    return {
        label: "1",
        index: 1,
        plannedReps: reps,
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
    };
}

function forTimeGroup(partial: Partial<SessionExerciseGroupView>): SessionExerciseGroupView {
    return {
        groupId: "block-1-for_time",
        kind: "for_time",
        badgeLabel: "FOR TIME A",
        rounds: 3,
        timeCapMinutes: 18,
        intervalSeconds: null,
        restBetweenSeconds: null,
        slots: [],
        ...partial,
    };
}

describe("forTimePrescriptionVariesByRound", () => {
    it("detecta reps distintas por ronda", () => {
        const group = forTimeGroup({
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Lanzamientos de balón",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("21"), baseSet("15"), baseSet("9")],
                },
            ],
        });
        expect(forTimePrescriptionVariesByRound(group)).toBe(true);
    });

    it("circuito uniforme", () => {
        const group = forTimeGroup({
            rounds: 4,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Curl de bíceps",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("15"), baseSet("15"), baseSet("15"), baseSet("15")],
                },
            ],
        });
        expect(forTimePrescriptionVariesByRound(group)).toBe(false);
    });
});

describe("buildAthleteForTimePrescriptionView", () => {
    it("rondas distintas — Ronda 1…N + POR TIEMPO", () => {
        const group = forTimeGroup({
            timeCapMinutes: 18,
            rounds: 3,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Lanzamientos de balón",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("21"), baseSet("15"), baseSet("9")],
                },
                {
                    slotLabel: "2",
                    exerciseId: 2,
                    exerciseName: "Abdominales",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("15"), baseSet("12"), baseSet("9")],
                },
            ],
        });

        const view = buildAthleteForTimePrescriptionView(group);
        expect(view.headerTitle).toBe("FOR TIME POR TIEMPO");
        expect(view.timeCapLabel).toBe("18:00 min");
        expect(view.objectiveLine).toBe(FOR_TIME_OBJECTIVE_LINE);
        expect(view.variesByRound).toBe(true);
        expect(view.uniformRepeatsLabel).toBeNull();
        expect(view.roundGroups).toHaveLength(3);
        expect(view.roundGroups[0].roundLabel).toBe("Ronda 1");
        expect(view.roundGroups[0].exercises[0].displayLine).toBe("21 Lanzamientos de balón");
        expect(view.roundGroups[2].exercises[1].displayLine).toBe("9 Abdominales");
    });

    it("mismas rondas — N Rondas de + plantilla", () => {
        const group = forTimeGroup({
            timeCapMinutes: 15,
            rounds: 4,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Curl de bíceps",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("15"), baseSet("15"), baseSet("15"), baseSet("15")],
                },
                {
                    slotLabel: "2",
                    exerciseId: 2,
                    exerciseName: "Curl martillo",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("12"), baseSet("12"), baseSet("12"), baseSet("12")],
                },
            ],
        });

        const view = buildAthleteForTimePrescriptionView(group);
        expect(view.headerTitle).toBe("FOR TIME");
        expect(view.objectiveLine).toBe(FOR_TIME_OBJECTIVE_LINE);
        expect(view.variesByRound).toBe(false);
        expect(view.uniformRepeatsLabel).toBe("4 rondas de:");
        expect(view.flatExercises.map((e) => e.displayLine)).toEqual([
            "15 Curl de bíceps",
            "12 Curl martillo",
        ]);
    });

    it("una ronda — lista plana sin «Rondas de»", () => {
        const group = forTimeGroup({
            timeCapMinutes: 15,
            rounds: 1,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "carrera",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: 400,
                    sets: [baseSet("")],
                },
                {
                    slotLabel: "2",
                    exerciseId: 2,
                    exerciseName: "Zancadas con peso",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [baseSet("20")],
                },
            ],
        });

        const view = buildAthleteForTimePrescriptionView(group);
        expect(view.headerTitle).toBe("FOR TIME");
        expect(view.uniformRepeatsLabel).toBeNull();
        expect(view.objectiveLine).toBe(FOR_TIME_OBJECTIVE_LINE);
        expect(view.flatExercises[0].displayLine).toBe("400 metros de carrera");
    });
});

import { describe, expect, it } from "vitest";
import {
    buildAthleteTimedPrescriptionExpandView,
    forTimeExpandTableColumns,
} from "./athleteTimedPrescriptionExpand";
import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";

function baseGroup(
    overrides: Partial<SessionExerciseGroupView> = {}
): SessionExerciseGroupView {
    return {
        groupId: "g1",
        kind: "amrap",
        badgeLabel: "AMRAP",
        rounds: 5,
        timeCapMinutes: 6,
        intervalSeconds: null,
        restBetweenSeconds: null,
        slots: [],
        ...overrides,
    };
}

describe("buildAthleteTimedPrescriptionExpandView", () => {
    it("AMRAP: no expand when only reps already in display line", () => {
        const group = baseGroup({
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Curl de bíceps",
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
            ],
        });
        const view = buildAthleteTimedPrescriptionExpandView({
            kind: "amrap",
            group,
            slot: group.slots[0],
            displayLine: "12 Curl de bíceps",
        });
        expect(view.hasExpandable).toBe(false);
        expect(view.detailRows).toHaveLength(0);
    });

    it("AMRAP: expand shows load and effort without repeating reps", () => {
        const group = baseGroup({
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Press",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "1",
                            index: 1,
                            plannedReps: "10",
                            plannedWeight: 40,
                            plannedDuration: null,
                            plannedRest: 60,
                            effortCharacter: "rir",
                            effortValue: 2,
                            actualReps: null,
                            actualWeight: null,
                            actualEffortValue: null,
                            rowLoggedSets: 0,
                            sourceLineId: 1,
                        },
                    ],
                },
            ],
        });
        const view = buildAthleteTimedPrescriptionExpandView({
            kind: "amrap",
            group,
            slot: group.slots[0],
            displayLine: "10 Press",
        });
        expect(view.hasExpandable).toBe(true);
        expect(view.detailRows.map((r) => r.label)).toEqual(["Carga", "Esfuerzo"]);
        expect(view.detailRows.find((r) => r.label === "Reps")).toBeUndefined();
        expect(view.detailRows.find((r) => r.label === "Descanso")).toBeUndefined();
    });

    it("FOR TIME: table when reps vary by round", () => {
        const group = baseGroup({
            kind: "for_time",
            restBetweenSeconds: null,
            slots: [
                {
                    slotLabel: "1",
                    exerciseId: 1,
                    exerciseName: "Wall ball",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "R1",
                            index: 1,
                            plannedReps: "21",
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
                        {
                            label: "R2",
                            index: 2,
                            plannedReps: "15",
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
            ],
        });
        const view = buildAthleteTimedPrescriptionExpandView({
            kind: "for_time",
            group,
            slot: group.slots[0],
            displayLine: "21 Wall ball",
        });
        expect(view.forTimeSetRows).toHaveLength(2);
        expect(forTimeExpandTableColumns(view.forTimeSetRows!)).toEqual(["reps"]);
    });
});

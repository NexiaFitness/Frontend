import { describe, expect, it } from "vitest";
import {
    buildAthletePreviewExerciseCards,
    buildAthletePreviewGroupRows,
} from "./athleteSessionPreviewUtils";
import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";

function baseGroup(
    overrides: Partial<SessionExerciseGroupView> = {}
): SessionExerciseGroupView {
    return {
        groupId: "g1",
        kind: "single_set",
        badgeLabel: "SINGLE SET",
        rounds: null,
        timeCapMinutes: null,
        intervalSeconds: null,
        restBetweenSeconds: 60,
        slots: [],
        ...overrides,
    };
}

describe("athleteSessionPreviewUtils", () => {
    it("builds uniform set lines for expandable preview", () => {
        const group = baseGroup({
            slots: [
                {
                    slotLabel: "A1",
                    exerciseId: 1,
                    exerciseName: "Press banca",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "S1",
                            index: 1,
                            plannedReps: "8",
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
                        {
                            label: "S2",
                            index: 2,
                            plannedReps: "8",
                            plannedWeight: 40,
                            plannedDuration: null,
                            plannedRest: 60,
                            effortCharacter: "rir",
                            effortValue: 2,
                            actualReps: null,
                            actualWeight: null,
                            actualEffortValue: null,
                            rowLoggedSets: 0,
                            sourceLineId: 2,
                        },
                    ],
                },
            ],
        });
        const cards = buildAthletePreviewExerciseCards(group);
        expect(cards).toHaveLength(1);
        expect(cards[0].setLines).toHaveLength(2);
        expect(cards[0].setLines[0].effort).toBe("RIR 2");
        expect(cards[0].setLines[0].rest).toBe("1m");
        expect(cards[0].setLines[0].displayLabel).toBe("Serie 1");
        expect(cards[0].detail).toBe("");
        expect(cards[0].secondaryDetail).toBeNull();
    });

    it("keeps compact row detail for list fallback", () => {
        const group = baseGroup({
            slots: [
                {
                    slotLabel: "A1",
                    exerciseId: 2,
                    exerciseName: "Comba",
                    notes: null,
                    plannedAssistanceKg: null,
                    plannedDistance: null,
                    sets: [
                        {
                            label: "R1",
                            index: 1,
                            plannedReps: "10",
                            plannedWeight: null,
                            plannedDuration: null,
                            plannedRest: 60,
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
        const rows = buildAthletePreviewGroupRows(group);
        expect(rows[0].detail).toContain("10 reps");
    });

    it("preserves per-series differences for the disclosure", () => {
        const group = baseGroup({
            restBetweenSeconds: null,
            slots: [{
                slotLabel: "1", exerciseId: 3, exerciseName: "Peso muerto", notes: null,
                plannedAssistanceKg: null, plannedDistance: null,
                sets: [
                    { label: "S1", index: 1, plannedReps: "8", plannedWeight: 80, plannedDuration: null, plannedRest: 90, effortCharacter: "rir", effortValue: 2, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 1 },
                    { label: "S2", index: 2, plannedReps: "6", plannedWeight: 85, plannedDuration: null, plannedRest: 120, effortCharacter: "rir", effortValue: 1, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 2 },
                ],
            }],
        });
        const card = buildAthletePreviewExerciseCards(group)[0];
        expect(card.setLines.map((line) => [line.reps, line.load])).toEqual([["8", "80 kg"], ["6", "85 kg"]]);
    });

    it("does not create disclosure data when only the compact reps are prescribed", () => {
        const group = baseGroup({
            restBetweenSeconds: null,
            slots: [{
                slotLabel: "1", exerciseId: 4, exerciseName: "Plancha", notes: null,
                plannedAssistanceKg: null, plannedDistance: null,
                sets: [{ label: "S1", index: 1, plannedReps: "30", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 1 }],
            }],
        });
        const card = buildAthletePreviewExerciseCards(group)[0];
        expect(card.setLines[0]).toMatchObject({ reps: "30", load: null, effort: null, rest: null, extras: null });
    });
});

/**
 * buildAthleteRunSteps.inputMode.spec.ts — D-B3: weight_reps en fuerza; duration por prescripción.
 */

import { describe, expect, it } from "vitest";
import type {
    SessionBlockView,
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
    SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";
import { SET_TYPE } from "../../types/sessionProgramming";
import { buildAthleteRunSteps } from "./buildAthleteRunSteps";

function setView(overrides: Partial<SessionExerciseSetView>): SessionExerciseSetView {
    return {
        label: "1",
        index: 1,
        plannedReps: "10",
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
        ...overrides,
    };
}

function slot(sets: SessionExerciseSetView[]): SessionExerciseSlotView {
    return {
        slotLabel: "A1",
        exerciseId: 1,
        exerciseName: "Test",
        notes: null,
        plannedAssistanceKg: null,
        plannedDistance: null,
        sets,
    };
}

function singleSetGroup(sets: SessionExerciseSetView[]): SessionExerciseGroupView {
    return {
        groupId: "g1",
        kind: "single_set",
        badgeLabel: "SINGLE SET",
        rounds: null,
        timeCapMinutes: null,
        intervalSeconds: null,
        restAfterSeconds: 60,
        instruction: null,
        slots: [slot(sets)],
    };
}

function structureWithGroups(groups: SessionExerciseGroupView[]): SessionStructureView {
    const block: SessionBlockView = {
        blockId: 1,
        blockTypeName: "Fuerza",
        setType: SET_TYPE.SINGLE_SET,
        objectiveText: null,
        groups,
    };
    return {
        blocks: [block],
        totalExercises: 1,
        totalSets: 1,
    };
}

describe("buildAthleteRunSteps resolveInputMode (D-B3)", () => {
    it("usa duration cuando hay plannedDuration > 0", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([
                singleSetGroup([setView({ plannedDuration: 45, plannedWeight: 20 })]),
            ])
        );
        expect(steps[0]?.inputMode).toBe("duration");
    });

    it("usa weight_reps cuando no hay peso prescrito (peso opcional en UI)", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([singleSetGroup([setView({ plannedWeight: null })])])
        );
        expect(steps[0]?.inputMode).toBe("weight_reps");
    });

    it("usa weight_reps cuando hay peso prescrito", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([singleSetGroup([setView({ plannedWeight: 40 })])])
        );
        expect(steps[0]?.inputMode).toBe("weight_reps");
    });

    it("no usa actualWeight como defaultWeight del paso", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([
                singleSetGroup([
                    setView({ plannedWeight: null, actualWeight: 55 }),
                ]),
            ])
        );
        expect(steps[0]?.defaultWeight).toBe(0);
        expect(steps[0]?.inputMode).toBe("weight_reps");
    });

    it("propaga weight_reps a slots de superserie sin peso prescrito", () => {
        const superset: SessionExerciseGroupView = {
            groupId: "ss1",
            kind: "superset",
            badgeLabel: "SUPERSET A",
            rounds: 1,
            timeCapMinutes: null,
            intervalSeconds: null,
            restAfterSeconds: 90,
            instruction: null,
            slots: [
                {
                    ...slot([setView({ plannedWeight: null })]),
                    slotLabel: "A1",
                    exerciseId: 1,
                },
                {
                    ...slot([setView({ plannedWeight: null, actualWeight: 20 })]),
                    slotLabel: "A2",
                    exerciseId: 2,
                    exerciseName: "Dominadas",
                },
            ],
        };
        const steps = buildAthleteRunSteps(structureWithGroups([superset]));
        const round = steps.find((s) => s.kind === "group_round");
        expect(round?.slots?.every((sl) => sl.inputMode === "weight_reps")).toBe(true);
        expect(round?.slots?.every((sl) => sl.defaultWeight === 0)).toBe(true);
    });
});

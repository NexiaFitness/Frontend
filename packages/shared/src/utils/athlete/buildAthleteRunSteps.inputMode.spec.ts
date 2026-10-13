/**
 * buildAthleteRunSteps.inputMode.spec.ts — MOD-09: reps_only y duration desde prescripción.
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

describe("buildAthleteRunSteps resolveInputMode (MOD-09)", () => {
    it("usa duration cuando hay plannedDuration > 0", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([
                singleSetGroup([setView({ plannedDuration: 45, plannedWeight: 20 })]),
            ])
        );
        expect(steps[0]?.inputMode).toBe("duration");
    });

    it("usa reps_only cuando no hay peso prescrito", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([singleSetGroup([setView({ plannedWeight: null })])])
        );
        expect(steps[0]?.inputMode).toBe("reps_only");
    });

    it("usa weight_reps cuando hay peso prescrito", () => {
        const steps = buildAthleteRunSteps(
            structureWithGroups([singleSetGroup([setView({ plannedWeight: 40 })])])
        );
        expect(steps[0]?.inputMode).toBe("weight_reps");
    });

    it("propaga reps_only a slots de superserie sin peso", () => {
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
                    ...slot([setView({ plannedWeight: null })]),
                    slotLabel: "A2",
                    exerciseId: 2,
                    exerciseName: "B",
                },
            ],
        };
        const steps = buildAthleteRunSteps(structureWithGroups([superset]));
        const round = steps.find((s) => s.kind === "group_round");
        expect(round?.slots?.every((sl) => sl.inputMode === "reps_only")).toBe(true);
    });
});

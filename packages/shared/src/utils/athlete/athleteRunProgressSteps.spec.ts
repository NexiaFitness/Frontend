/**
 * athleteRunProgressSteps.spec.ts — Regresión findFirstPendingStepIndex / resolución.
 */

import { describe, expect, it } from "vitest";
import type { AthleteRunProgress } from "../../types/athleteRunProgress";
import type { AthleteRunStep } from "./buildAthleteRunSteps";
import {
    collectProgressKeysForRunStep,
    findFirstPendingStepIndex,
    isRunStepResolved,
    shouldSkipRunStepPersist,
} from "./athleteRunProgressSteps";

function singleStep(stepKey: string): AthleteRunStep {
    return {
        stepKey,
        kind: "single_set",
        groupKind: "straight",
        blockId: 1,
        blockName: "Fuerza",
        groupId: "g1",
        badgeLabel: "S1",
        roundIndex: 1,
        roundTotal: 1,
        slotLabel: "S1",
        exerciseId: 11,
        exerciseName: "Press",
        setLabel: "S1",
        setIndex: 1,
        instruction: "",
        plannedLabel: "8",
        restAfterSeconds: null,
        inputMode: "weight_reps",
        blockExerciseId: 1,
        plannedWeight: 40,
        defaultWeight: 40,
        defaultReps: 8,
        defaultRpe: null,
        loggedSets: 0,
        totalSetsInSlot: 1,
        timeCapMinutes: null,
        intervalSeconds: null,
        plannedDurationSeconds: null,
    };
}

function progressPartial(blockId: number, registered: string[], pending: string[]): AthleteRunProgress {
    return {
        training_session_id: 1,
        pending_count: pending.length,
        first_pending_step_key: pending[0] ?? null,
        steps: registered.map((step_key) => ({
            step_key,
            status: "registered" as const,
            kind: "execution" as const,
            session_block_id: blockId,
            block_exercise_id: 1,
            exercise_id: 11,
            group_id: "g",
            weight_kg: 50,
            reps: 8,
            rpe: null,
            duration_seconds: null,
            rounds_completed: null,
            partial_reps: null,
            completed_as_planned: null,
            failure_reason: null,
            timed_mode: null,
            total_seconds: null,
            emom_completed_count: null,
            emom_failed_count: null,
            payload_json: null,
        })),
        blocks: [
            {
                session_block_id: blockId,
                set_type: "single_set",
                status: "pending",
                expected_step_keys: [...registered, ...pending],
                registered_step_keys: registered,
                not_performed_step_keys: [],
                pending_step_keys: pending,
            },
        ],
    };
}

describe("findFirstPendingStepIndex", () => {
    it("devuelve 0 si no hay progress", () => {
        expect(findFirstPendingStepIndex([singleStep("a"), singleStep("b")], null)).toBe(0);
    });

    it("salta paso 0 resuelto y apunta al pendiente (E4 orden B)", () => {
        const steps = [
            singleStep("block-194-single-0-r1-S1-S1-1"),
            singleStep("block-195-dropset-r1-A1-MAIN-1"),
        ];
        const p = progressPartial(194, ["block-194-single-0-r1-S1-S1-1"], ["block-195-dropset-r1-A1-MAIN-1"]);
        expect(findFirstPendingStepIndex(steps, p)).toBe(1);
    });

    it("not_performed cuenta como resuelto", () => {
        const key = "block-190-single-0-r2-S3-S2-2";
        const p: AthleteRunProgress = {
            training_session_id: 1,
            pending_count: 0,
            first_pending_step_key: null,
            steps: [
                {
                    step_key: key,
                    status: "not_performed",
                    kind: "execution",
                    session_block_id: 190,
                    block_exercise_id: 1,
                    exercise_id: 11,
                    group_id: "g",
                    weight_kg: null,
                    reps: null,
                    rpe: null,
                    duration_seconds: null,
                    rounds_completed: null,
                    partial_reps: null,
                    completed_as_planned: null,
                    failure_reason: "not_performed",
                    timed_mode: null,
                    total_seconds: null,
                    emom_completed_count: null,
                    emom_failed_count: null,
                    payload_json: null,
                },
            ],
            blocks: [],
        };
        expect(isRunStepResolved(singleStep(key), p)).toBe(true);
    });

    it("length si todos resueltos", () => {
        const k = "block-194-single-0-r1-S1-S1-1";
        const steps = [singleStep(k)];
        const p = progressPartial(194, [k], []);
        p.blocks[0].status = "registered";
        expect(findFirstPendingStepIndex(steps, p)).toBe(1);
    });
});

describe("collectProgressKeysForRunStep", () => {
    it("incluye slots de group_round", () => {
        const step: AthleteRunStep = {
            ...singleStep("round-1"),
            kind: "group_round",
            groupKind: "dropset",
            slots: [
                {
                    stepKey: "slot-main",
                    slotLabel: "A1",
                    exerciseId: 1,
                    exerciseName: "X",
                    setLabel: "MAIN",
                    plannedLabel: "8",
                    blockExerciseId: 1,
                    inputMode: "weight_reps",
                    defaultWeight: 0,
                    defaultReps: 8,
                    defaultRpe: null,
                    loggedSets: 0,
                },
            ],
        };
        expect(collectProgressKeysForRunStep(step)).toContain("slot-main");
    });
});

describe("shouldSkipRunStepPersist (M9)", () => {
    it("no re-POST si registered en BE y sin tocar", () => {
        const step = singleStep("block-194-single-0-r1-S1-S1-1");
        const p = progressPartial(194, [step.stepKey], []);
        expect(shouldSkipRunStepPersist(step, p, new Set())).toBe(true);
        expect(shouldSkipRunStepPersist(step, p, new Set([step.stepKey]))).toBe(false);
    });
});

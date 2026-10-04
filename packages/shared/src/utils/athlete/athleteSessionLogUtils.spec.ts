/**
 * athleteSessionLogUtils.spec.ts — FE-3 registro al final (bloques, payloads, Home CTA).
 */

import { describe, expect, it } from "vitest";
import type { AthleteRunProgress } from "../../types/athleteRunProgress";
import {
    countPendingProgressBlocks,
    hasPartialSessionLogProgress,
    isSessionLogReadyToComplete,
    validateBlockDraft,
    buildBlockSavePayloads,
    buildInitialBlockDraft,
    resolveLogDraftSetWeight,
    type AthleteSessionLogBlockModel,
    type AthleteSessionLogBlockDraft,
} from "./athleteSessionLogUtils";
import type { AthleteRunStep } from "../../types/athleteRunSteps";

function progress(partial: Partial<AthleteRunProgress>): AthleteRunProgress {
    return {
        training_session_id: 1,
        steps: [],
        blocks: [],
        pending_count: 0,
        ...partial,
    };
}

describe("session log progress helpers", () => {
    it("countPendingProgressBlocks ignora bloques sin steps", () => {
        const p = progress({
            blocks: [
                {
                    session_block_id: 1,
                    status: "pending",
                    expected_step_keys: ["a"],
                    registered_step_keys: [],
                    not_performed_step_keys: [],
                    pending_step_keys: ["a"],
                },
                {
                    session_block_id: 2,
                    status: "pending",
                    expected_step_keys: [],
                    registered_step_keys: [],
                    not_performed_step_keys: [],
                    pending_step_keys: [],
                },
            ],
        });
        expect(countPendingProgressBlocks(p)).toBe(1);
    });

    it("hasPartialSessionLogProgress cuando hay guardado y pendiente", () => {
        const p = progress({
            blocks: [
                {
                    session_block_id: 1,
                    status: "registered",
                    expected_step_keys: ["a"],
                    registered_step_keys: ["a"],
                    not_performed_step_keys: [],
                    pending_step_keys: [],
                },
                {
                    session_block_id: 2,
                    status: "pending",
                    expected_step_keys: ["b"],
                    registered_step_keys: [],
                    not_performed_step_keys: [],
                    pending_step_keys: ["b"],
                },
            ],
        });
        expect(hasPartialSessionLogProgress(p)).toBe(true);
        expect(isSessionLogReadyToComplete(p)).toBe(false);
    });

    it("hasPartialSessionLogProgress con bloque pending pero series ya guardadas (4438)", () => {
        const p = progress({
            pending_count: 2,
            blocks: [
                {
                    session_block_id: 190,
                    status: "pending",
                    expected_step_keys: ["s1", "s2", "s3"],
                    registered_step_keys: ["s1"],
                    not_performed_step_keys: [],
                    pending_step_keys: ["s2", "s3"],
                },
            ],
        });
        expect(hasPartialSessionLogProgress(p)).toBe(true);
        expect(countPendingProgressBlocks(p)).toBe(1);
    });

    it("isSessionLogReadyToComplete cuando todos los bloques registrables resueltos", () => {
        const p = progress({
            blocks: [
                {
                    session_block_id: 1,
                    status: "registered",
                    expected_step_keys: ["a"],
                    registered_step_keys: ["a"],
                    not_performed_step_keys: [],
                    pending_step_keys: [],
                },
                {
                    session_block_id: 2,
                    status: "not_performed",
                    expected_step_keys: ["b"],
                    registered_step_keys: [],
                    not_performed_step_keys: ["b"],
                    pending_step_keys: [],
                },
            ],
        });
        expect(isSessionLogReadyToComplete(p)).toBe(true);
        expect(hasPartialSessionLogProgress(p)).toBe(false);
    });
});

describe("buildInitialBlockDraft AMRAP", () => {
    it("hidrata parcial desde detail.partial_by_slot", () => {
        const timedStep: AthleteRunStep = {
            stepKey: "block-193-amrap-timed-1",
            kind: "timed_block",
            groupKind: "amrap",
            blockId: 193,
            blockName: "Hipertrofia",
            groupId: "block-193-amrap",
            badgeLabel: "AMRAP",
            roundIndex: 1,
            roundTotal: 1,
            slotLabel: "",
            exerciseId: 11,
            exerciseName: "Sentadilla",
            setLabel: "",
            setIndex: 1,
            instruction: "",
            plannedLabel: "",
            restAfterSeconds: null,
            inputMode: "rounds_reps",
            blockExerciseId: 1,
            defaultWeight: 0,
            defaultReps: 8,
            defaultRpe: null,
            loggedSets: 0,
            slots: [{ stepKey: "block-193-amrap-r1-1-1-1", slotLabel: "1", setIndex: 1, exerciseId: 11, exerciseName: "Sentadilla", setLabel: "1", plannedLabel: "8", blockExerciseId: 1, inputMode: "rounds_reps", defaultWeight: 0, defaultReps: 8, defaultRpe: null, loggedSets: 0 }],
        };
        const block: AthleteSessionLogBlockModel = {
            sessionBlockId: 193,
            blockTypeName: "Hipertrofia",
            setType: "amrap",
            status: "registered",
            expectedStepKeys: [timedStep.stepKey],
            steps: [timedStep],
            summaryLine: null,
            isPendingHighlight: false,
            hasRegisterableSteps: true,
        };
        const p = progress({
            steps: [
                {
                    step_key: timedStep.stepKey,
                    status: "registered",
                    kind: "timed",
                    session_block_id: 193,
                    rounds_completed: 5,
                    timed_mode: "amrap",
                    detail: {
                        kind: "amrap",
                        partial_total: 2,
                        partial_by_slot: { "block-193-amrap-r1-1-1-1": 2 },
                    },
                },
            ],
        });
        const draft = buildInitialBlockDraft(block, p);
        expect(draft.timed?.amrapRounds).toBe(5);
        expect(draft.timed?.amrapPartialReps["block-193-amrap-r1-1-1-1"]).toBe(2);
    });
});

describe("validateBlockDraft", () => {
    const block: AthleteSessionLogBlockModel = {
        sessionBlockId: 10,
        blockTypeName: "Fuerza",
        setType: "straight",
        status: "pending",
        expectedStepKeys: ["s1"],
        steps: [],
        summaryLine: null,
        isPendingHighlight: true,
        hasRegisterableSteps: true,
    };

    it("exige dato o skip en bloque con steps", () => {
        const draft: AthleteSessionLogBlockDraft = {
            sessionBlockId: 10,
            singleSets: [{ stepKey: "s1", weight: 0, reps: 0, skipped: false }],
            groupRounds: [],
            dropsetRounds: [],
            timed: null,
            mobilityDone: null,
        };
        expect(validateBlockDraft(block, draft)).toMatch(/Registra/);
    });
});

function singleSetStep(overrides: Partial<AthleteRunStep> = {}): AthleteRunStep {
    return {
        stepKey: "block-208-single-0-r1-S1-S1-1",
        kind: "single_set",
        groupKind: "single_set",
        blockId: 208,
        blockName: "Fuerza máxima",
        groupId: "block-208-single-0",
        badgeLabel: "S1",
        roundIndex: 1,
        roundTotal: 1,
        slotLabel: "S1",
        exerciseId: 11,
        exerciseName: "Sentadilla trasera",
        setLabel: "S1",
        setIndex: 1,
        instruction: "",
        plannedLabel: "8 reps · 50 kg",
        restAfterSeconds: 60,
        inputMode: "weight_reps",
        blockExerciseId: 883,
        plannedWeight: 50,
        defaultWeight: 0,
        defaultReps: 8,
        defaultRpe: null,
        loggedSets: 0,
        totalSetsInSlot: 1,
        timeCapMinutes: null,
        intervalSeconds: null,
        plannedDurationSeconds: null,
        ...overrides,
    };
}

describe("resolveLogDraftSetWeight (registro al final · carga programada)", () => {
    it("usa plannedWeight cuando defaultWeight es 0 (4453)", () => {
        const step = singleSetStep();
        expect(resolveLogDraftSetWeight(step)).toBe(50);
        const draft = buildInitialBlockDraft(
            {
                sessionBlockId: 208,
                blockTypeName: "Fuerza máxima",
                setType: "straight",
                status: "pending",
                expectedStepKeys: [step.stepKey],
                steps: [step],
                summaryLine: null,
                isPendingHighlight: true,
                hasRegisterableSteps: true,
            },
            null
        );
        expect(draft.singleSets[0]?.weight).toBe(50);
    });

    it("buildBlockSavePayloads persiste plannedWeight si el borrador aún tiene 0", () => {
        const step = singleSetStep();
        const block: AthleteSessionLogBlockModel = {
            sessionBlockId: 208,
            blockTypeName: "Fuerza máxima",
            setType: "straight",
            status: "pending",
            expectedStepKeys: [step.stepKey],
            steps: [step],
            summaryLine: null,
            isPendingHighlight: true,
            hasRegisterableSteps: true,
        };
        const draft: AthleteSessionLogBlockDraft = {
            sessionBlockId: 208,
            singleSets: [{ stepKey: step.stepKey, weight: 0, reps: 8, skipped: false }],
            groupRounds: [],
            dropsetRounds: [],
            timed: null,
            mobilityDone: null,
        };
        const { executions } = buildBlockSavePayloads(4453, block, draft);
        expect(executions).toHaveLength(1);
        expect(executions[0]?.weight_kg).toBe(50);
    });

    it("prioriza peso escrito a mano sobre plannedWeight", () => {
        const step = singleSetStep();
        const block: AthleteSessionLogBlockModel = {
            sessionBlockId: 208,
            blockTypeName: "Fuerza máxima",
            setType: "straight",
            status: "pending",
            expectedStepKeys: [step.stepKey],
            steps: [step],
            summaryLine: null,
            isPendingHighlight: true,
            hasRegisterableSteps: true,
        };
        const draft: AthleteSessionLogBlockDraft = {
            sessionBlockId: 208,
            singleSets: [{ stepKey: step.stepKey, weight: 55, reps: 8, skipped: false }],
            groupRounds: [],
            dropsetRounds: [],
            timed: null,
            mobilityDone: null,
        };
        const { executions } = buildBlockSavePayloads(4453, block, draft);
        expect(executions[0]?.weight_kg).toBe(55);
    });
});

describe("buildBlockSavePayloads skipped steps", () => {
    it("marca step_key en notPerformedStepKeys", () => {
        const block: AthleteSessionLogBlockModel = {
            sessionBlockId: 10,
            blockTypeName: "Fuerza",
            setType: "straight",
            status: "pending",
            expectedStepKeys: ["blk-1-ex-1-set-1"],
            steps: [
                {
                    stepKey: "blk-1-ex-1-set-1",
                    kind: "single_set",
                    groupKind: "straight",
                    blockId: 10,
                    blockName: "Fuerza",
                    groupId: "g1",
                    badgeLabel: "S1",
                    roundIndex: 1,
                    roundTotal: 1,
                    slotLabel: "A",
                    exerciseId: 1,
                    exerciseName: "Press",
                    setLabel: "S1",
                    setIndex: 1,
                    instruction: "",
                    plannedLabel: "8",
                    restAfterSeconds: null,
                    blockExerciseId: 1,
                    inputMode: "weight_reps",
                    defaultWeight: 40,
                    defaultReps: 8,
                    defaultRpe: null,
                    loggedSets: 0,
                    slots: [],
                },
            ],
            summaryLine: null,
            isPendingHighlight: true,
            hasRegisterableSteps: true,
        };
        const draft: AthleteSessionLogBlockDraft = {
            sessionBlockId: 10,
            singleSets: [
                { stepKey: "blk-1-ex-1-set-1", weight: 0, reps: 0, skipped: true },
            ],
            groupRounds: [],
            dropsetRounds: [],
            timed: null,
            mobilityDone: null,
        };
        const { executions, notPerformedStepKeys, notPerformedSteps } = buildBlockSavePayloads(
            99,
            block,
            draft
        );
        expect(executions).toHaveLength(0);
        expect(notPerformedStepKeys).toEqual(["blk-1-ex-1-set-1"]);
        expect(notPerformedSteps[0]?.exercise_id).toBe(1);
        expect(notPerformedSteps[0]?.session_block_id).toBe(10);
    });
});

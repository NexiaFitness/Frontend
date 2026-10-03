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
    type AthleteSessionLogBlockModel,
    type AthleteSessionLogBlockDraft,
} from "./athleteSessionLogUtils";

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
        const { executions, notPerformedStepKeys } = buildBlockSavePayloads(99, block, draft);
        expect(executions).toHaveLength(0);
        expect(notPerformedStepKeys).toEqual(["blk-1-ex-1-set-1"]);
    });
});

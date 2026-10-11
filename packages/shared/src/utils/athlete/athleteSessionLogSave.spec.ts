/**
 * athleteSessionLogSave.spec.ts — «Registrar al final»: lo guardado es lo visible.
 *
 * Contexto: F1/F3/F4/F5 del prompt de corrección pre-integración (D-LOG-TOUCH-01):
 * sin peso no prescrito ni tecleado → nunca 0 kg; un 0 tecleado se guarda; si falta
 * un dato, validateBlockDraft bloquea con aviso en lugar de descartar en silencio.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it } from "vitest";
import type { AthleteRunRoundSlot, AthleteRunStep } from "./buildAthleteRunSteps";
import {
    buildBlockSavePayloads,
    validateBlockDraft,
} from "./athleteSessionLogSave";
import {
    buildInitialBlockDraft,
    type AthleteSessionLogBlockDraft,
    type AthleteSessionLogBlockModel,
} from "./athleteSessionLogUtils";

function slot(overrides: Partial<AthleteRunRoundSlot>): AthleteRunRoundSlot {
    return {
        stepKey: "block-579-superset-1-r1-A1-R1-1",
        slotLabel: "A1",
        exerciseId: 11,
        exerciseName: "Curl de bíceps",
        setLabel: "R1",
        plannedLabel: "10 reps",
        blockExerciseId: 901,
        inputMode: "weight_reps",
        defaultWeight: 0,
        defaultReps: 10,
        defaultRpe: null,
        loggedSets: 0,
        ...overrides,
    };
}

function supersetStep(slots: AthleteRunRoundSlot[]): AthleteRunStep {
    return {
        stepKey: "block-579-superset-1-r1",
        kind: "group_round",
        groupKind: "superset",
        blockId: 579,
        blockName: "Acondicionamiento",
        groupId: "block-579-superset-1",
        badgeLabel: "A",
        roundIndex: 1,
        roundTotal: 1,
        slotLabel: "A",
        exerciseId: 11,
        exerciseName: "Curl de bíceps",
        setLabel: "R1",
        setIndex: 1,
        instruction: "",
        plannedLabel: "",
        restAfterSeconds: 60,
        inputMode: "weight_reps",
        blockExerciseId: 901,
        plannedWeight: null,
        defaultWeight: 0,
        defaultReps: 10,
        defaultRpe: null,
        loggedSets: 0,
        totalSetsInSlot: 1,
        timeCapMinutes: null,
        intervalSeconds: null,
        plannedDurationSeconds: null,
        slots,
    } as AthleteRunStep;
}

function blockOf(steps: AthleteRunStep[]): AthleteSessionLogBlockModel {
    return {
        sessionBlockId: 579,
        blockTypeName: "Acondicionamiento",
        setType: "superset",
        status: "pending",
        expectedStepKeys: steps.map((s) => s.stepKey),
        steps,
        summaryLine: null,
        isPendingHighlight: true,
        hasRegisterableSteps: true,
    };
}

function emptyDraft(): AthleteSessionLogBlockDraft {
    return {
        sessionBlockId: 579,
        singleSets: [],
        groupRounds: [],
        dropsetRounds: [],
        timed: null,
        mobilityDone: null,
        exerciseNotes: {},
    };
}

describe("F4 · grupos en registrar al final", () => {
    const slotA = slot({});
    const slotB = slot({
        stepKey: "block-579-superset-1-r1-A2-R1-1",
        slotLabel: "A2",
        exerciseId: 12,
        exerciseName: "Curl martillo",
        blockExerciseId: 902,
        defaultReps: 12,
    });
    const step = supersetStep([slotA, slotB]);
    const block = blockOf([step]);

    it("bloquea con aviso si un hueco weight_reps no tiene peso (no lo descarta)", () => {
        const draft: AthleteSessionLogBlockDraft = {
            ...emptyDraft(),
            groupRounds: [
                {
                    stepKey: step.stepKey,
                    skipped: false,
                    slotLogs: {
                        [slotA.stepKey]: { weight: 30, reps: 10 },
                        [slotB.stepKey]: { weight: null, reps: 12 },
                    },
                },
            ],
        };

        expect(validateBlockDraft(block, draft)).toBe(
            "Falta el peso en Curl martillo. Escríbelo (0 si fue sin carga) o marca «No lo hice (ronda)»."
        );
    });

    it("envía los huecos sin peso por diseño (reps_only) con weight_kg null", () => {
        const repsOnly = slot({
            stepKey: "block-579-superset-1-r1-A2-R1-1",
            slotLabel: "A2",
            exerciseName: "Dominadas",
            blockExerciseId: 902,
            inputMode: "reps_only",
        });
        const repsOnlyStep = supersetStep([slotA, repsOnly]);
        const draft: AthleteSessionLogBlockDraft = {
            ...emptyDraft(),
            groupRounds: [
                {
                    stepKey: repsOnlyStep.stepKey,
                    skipped: false,
                    slotLogs: {
                        [slotA.stepKey]: { weight: 30, reps: 10 },
                        [repsOnly.stepKey]: { weight: null, reps: 8 },
                    },
                },
            ],
        };
        const repsOnlyBlock = blockOf([repsOnlyStep]);

        expect(validateBlockDraft(repsOnlyBlock, draft)).toBeNull();
        const { executions } = buildBlockSavePayloads(1, repsOnlyBlock, draft);
        expect(executions.map((e) => [e.step_key, e.input_mode, e.weight_kg, e.reps])).toEqual([
            [slotA.stepKey, "weight_reps", 30, 10],
            [repsOnly.stepKey, "reps_only", null, 8],
        ]);
    });
});

function singleStep(overrides: Partial<AthleteRunStep> = {}): AthleteRunStep {
    return {
        ...supersetStep([]),
        stepKey: "block-578-single-0-r1-S2-S1-1",
        kind: "single_set",
        groupKind: "single_set",
        groupId: "block-578-single-0",
        exerciseName: "Sentadilla trasera",
        setLabel: "S1",
        setIndex: 1,
        slots: undefined,
        ...overrides,
    } as AthleteRunStep;
}

describe("F1 · registrar al final sin peso prescrito", () => {
    it("el borrador inicial deja el peso vacío (null), no 0", () => {
        const step = singleStep();
        const superset = supersetStep([slot({})]);
        const draft = buildInitialBlockDraft(blockOf([step, superset]), null);

        expect(draft.singleSets[0]?.weight).toBeNull();
        expect(draft.groupRounds[0]?.slotLogs[slot({}).stepKey]?.weight).toBeNull();
    });

    it("una serie weight_reps sin peso bloquea el guardado con aviso", () => {
        const step = singleStep();
        const draft: AthleteSessionLogBlockDraft = {
            ...emptyDraft(),
            singleSets: [{ stepKey: step.stepKey, weight: null, reps: 8, skipped: false }],
        };

        expect(validateBlockDraft(blockOf([step]), draft)).toBe(
            "Falta el peso en Sentadilla trasera · Serie 1. Escríbelo (0 si fue sin carga) o marca «No lo hice»."
        );
    });
});

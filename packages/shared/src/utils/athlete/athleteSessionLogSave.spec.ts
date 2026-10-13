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
    applyLogSetWeightChange,
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

    it("permite ronda con un slot sin peso y otro con peso (D-B3, no descarta en silencio)", () => {
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

        expect(validateBlockDraft(block, draft)).toBeNull();
        const { executions } = buildBlockSavePayloads(1, block, draft);
        expect(executions).toHaveLength(2);
        expect(executions.find((e) => e.step_key === slotB.stepKey)?.weight_kg ?? null).toBeNull();
    });

    it("envía slot sin peso tecleado como weight_reps con weight_kg null (D-B3)", () => {
        const noPrescribedWeight = slot({
            stepKey: "block-579-superset-1-r1-A2-R1-1",
            slotLabel: "A2",
            exerciseName: "Dominadas",
            blockExerciseId: 902,
            inputMode: "weight_reps",
        });
        const mixedStep = supersetStep([slotA, noPrescribedWeight]);
        const draft: AthleteSessionLogBlockDraft = {
            ...emptyDraft(),
            groupRounds: [
                {
                    stepKey: mixedStep.stepKey,
                    skipped: false,
                    slotLogs: {
                        [slotA.stepKey]: { weight: 30, reps: 10 },
                        [noPrescribedWeight.stepKey]: { weight: null, reps: 8 },
                    },
                },
            ],
        };
        const mixedBlock = blockOf([mixedStep]);

        expect(validateBlockDraft(mixedBlock, draft)).toBeNull();
        const { executions } = buildBlockSavePayloads(1, mixedBlock, draft);
        expect(executions.map((e) => [e.step_key, e.input_mode, e.weight_kg, e.reps])).toEqual([
            [slotA.stepKey, "weight_reps", 30, 10],
            [noPrescribedWeight.stepKey, "weight_reps", null, 8],
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

    it("permite guardar weight_reps con peso vacío si hay reps (D-B3)", () => {
        const step = singleStep();
        const draft: AthleteSessionLogBlockDraft = {
            ...emptyDraft(),
            singleSets: [{ stepKey: step.stepKey, weight: null, reps: 8, skipped: false }],
        };

        expect(validateBlockDraft(blockOf([step]), draft)).toBeNull();
        const { executions } = buildBlockSavePayloads(1, blockOf([step]), draft);
        expect(executions[0]?.input_mode).toBe("weight_reps");
        expect(executions[0]?.weight_kg ?? null).toBeNull();
    });
});

describe("F3 · 0 tecleado con peso prescrito", () => {
    it("se guarda 0, no la prescripción; sin tocar se guarda la prescripción visible", () => {
        const set1 = singleStep({ plannedWeight: 60 });
        const set2 = singleStep({
            plannedWeight: 60,
            stepKey: "block-578-single-0-r2-S2-S2-2",
            setLabel: "S2",
            setIndex: 2,
        });
        const block = blockOf([set1, set2]);
        const initial = buildInitialBlockDraft(block, null);
        const draft: AthleteSessionLogBlockDraft = {
            ...initial,
            singleSets: initial.singleSets.map((s) =>
                s.stepKey === set1.stepKey ? { ...s, weight: 0 } : s
            ),
        };

        expect(validateBlockDraft(block, draft)).toBeNull();
        const { executions } = buildBlockSavePayloads(1, block, draft);
        expect(executions.map((e) => e.weight_kg)).toEqual([0, 60]);
    });
});

describe("F5 · applyLogSetWeightChange (visible = guardado)", () => {
    const set1 = singleStep();
    const set2 = singleStep({
        stepKey: "block-578-single-0-r2-S2-S2-2",
        setLabel: "S2",
        setIndex: 2,
    });
    const otherExercise = singleStep({
        stepKey: "block-578-single-1-r1-S3-S1-1",
        groupId: "block-578-single-1",
        exerciseId: 12,
        setIndex: 2,
    });
    const steps = [set1, set2, otherExercise];
    const sets = [
        { stepKey: set1.stepKey, weight: null, reps: 8, skipped: false },
        { stepKey: set2.stepKey, weight: null, reps: 8, skipped: false },
        { stepKey: otherExercise.stepKey, weight: null, reps: 8, skipped: false },
    ];

    it("copia el peso a las series posteriores de la misma serie sin peso ni tocar", () => {
        const next = applyLogSetWeightChange({
            sets,
            steps,
            stepKey: set1.stepKey,
            weight: 60,
            touchedStepKeys: new Set([set1.stepKey]),
        });
        expect(next.map((s) => s.weight)).toEqual([60, 60, null]);
    });

    it("no pisa una prescripción, una serie tocada ni una marcada «No lo hice»", () => {
        const base = [
            sets[0],
            { ...sets[1], weight: 50 },
            sets[2],
        ];
        expect(
            applyLogSetWeightChange({
                sets: base,
                steps,
                stepKey: set1.stepKey,
                weight: 60,
                touchedStepKeys: new Set(),
            }).map((s) => s.weight)
        ).toEqual([60, 50, null]);
        expect(
            applyLogSetWeightChange({
                sets: [sets[0], { ...sets[1], skipped: true }, sets[2]],
                steps,
                stepKey: set1.stepKey,
                weight: 60,
                touchedStepKeys: new Set(),
            }).map((s) => s.weight)
        ).toEqual([60, null, null]);
        expect(
            applyLogSetWeightChange({
                sets,
                steps,
                stepKey: set1.stepKey,
                weight: 60,
                touchedStepKeys: new Set([set2.stepKey]),
            }).map((s) => s.weight)
        ).toEqual([60, null, null]);
    });

    it("vaciar o escribir 0 no se propaga", () => {
        for (const weight of [null, 0]) {
            expect(
                applyLogSetWeightChange({
                    sets,
                    steps,
                    stepKey: set1.stepKey,
                    weight,
                    touchedStepKeys: new Set(),
                }).map((s) => s.weight)
            ).toEqual([weight, null, null]);
        }
    });
});

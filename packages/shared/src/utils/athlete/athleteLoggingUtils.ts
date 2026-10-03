/**
 * athleteLoggingUtils.ts — Utilidades compartidas guiado + registro al final (FE-4).
 * Contexto: pasos de peso, reparto AMRAP y autocompletado N6 sin DOM.
 * Notas de mantenimiento: mantener paridad con buildAthleteRunSteps.inputMode.
 * @author Frontend Team
 * @since v8.3.0
 */

import type { AthleteRunInputMode } from "./buildAthleteRunSteps";

export const DEFAULT_BARBELL_STEP_KG = 2.5;
export const DUMBBELL_STEP_KG = 1;

export interface AmrapPartialSlotShape {
    stepKey: string;
    maxReps: number;
    exerciseName?: string;
}

/** Heurística P1-6: paso ±1 kg si el contexto sugiere mancuernas/kettlebell. */
export function resolveWeightIncrementStepKg(input: {
    currentKg: number;
    plannedKg?: number | null;
    referenceKg?: number | null;
}): number {
    const values = [input.currentKg, input.plannedKg, input.referenceKg].filter(
        (value): value is number => value != null && value > 0
    );
    const usesFineStep = values.some((kg) => {
        const mod25 = Math.abs(kg / DEFAULT_BARBELL_STEP_KG - Math.round(kg / DEFAULT_BARBELL_STEP_KG));
        return mod25 > 0.08;
    });
    return usesFineStep ? DUMBBELL_STEP_KG : DEFAULT_BARBELL_STEP_KG;
}

export function clampWeightKg(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value * 100) / 100);
}

export function parseDecimalInput(raw: string): number | null {
    const normalized = raw.replace(",", ".").trim();
    if (normalized === "") return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

/** True when a draft string is complete enough to sync parent state (avoid blur-only commits). */
export function shouldCommitNumericDraftOnChange(
    raw: string,
    allowDecimal: boolean
): boolean {
    const normalized = raw.replace(",", ".").trim();
    if (normalized === "") return false;
    if (!allowDecimal) return /^\d+$/.test(normalized);
    if (normalized.endsWith(".") || raw.trim().endsWith(",")) return false;
    return parseDecimalInput(normalized) != null;
}

/** Reparte reps parciales en orden de ronda (Opción B / 04 §2). */
export function distributeAmrapPartialReps(
    slots: readonly AmrapPartialSlotShape[],
    partialTotal: number
): { partialBySlot: Record<string, number>; suggestsExtraFullRound: boolean } {
    const total = Math.max(0, Math.floor(partialTotal));
    const repsPerRound = slots.reduce((sum, slot) => sum + Math.max(0, slot.maxReps), 0);
    const suggestsExtraFullRound = repsPerRound > 0 && total >= repsPerRound;

    const partialBySlot: Record<string, number> = {};
    let remaining = total;

    for (const slot of slots) {
        if (remaining <= 0) {
            partialBySlot[slot.stepKey] = 0;
            continue;
        }
        const take = Math.min(slot.maxReps, remaining);
        partialBySlot[slot.stepKey] = take;
        remaining -= take;
    }

    return { partialBySlot, suggestsExtraFullRound };
}

/** Texto «= 3 rondas + 10 sentadillas + 2 dominadas» (solo ronda incompleta). */
export function formatAmrapIncompleteRoundBreakdown(
    slots: readonly AmrapPartialSlotShape[],
    partialBySlot: Record<string, number>
): string {
    const parts = slots
        .map((slot) => {
            const reps = partialBySlot[slot.stepKey] ?? 0;
            if (reps <= 0) return null;
            const label = slot.exerciseName?.trim() || slot.stepKey;
            return `${reps} ${label}`;
        })
        .filter((part): part is string => Boolean(part));

    if (parts.length === 0) return "";
    return `= ${parts.join(" + ")}`;
}

/** N6 — copia peso de serie 1 a series siguientes no tocadas (mismo blockExerciseId). */
export function applySeriesWeightAutofill(input: {
    setIndex: number;
    weightKg: number;
    touchedStepKeys: ReadonlySet<string>;
    steps: ReadonlyArray<{ stepKey: string; setIndex: number; blockExerciseId: number }>;
}): string[] {
    if (input.setIndex !== 1 || input.weightKg <= 0) return [];
    const anchor = input.steps.find((step) => step.stepKey && step.setIndex === 1);
    if (!anchor) return [];

    return input.steps
        .filter(
            (step) =>
                step.blockExerciseId === anchor.blockExerciseId &&
                step.setIndex > 1 &&
                !input.touchedStepKeys.has(step.stepKey)
        )
        .map((step) => step.stepKey);
}

export function resolveExecutionFieldsForInputMode(
    inputMode: AthleteRunInputMode,
    values: { weightKg: number; reps: number; durationSeconds: number }
): {
    input_mode: AthleteRunInputMode;
    weight_kg?: number | null;
    reps?: number | null;
    duration_seconds?: number | null;
} {
    if (inputMode === "duration") {
        return {
            input_mode: "duration",
            duration_seconds: Math.max(0, values.durationSeconds),
            reps: null,
            weight_kg: null,
        };
    }
    if (inputMode === "reps_only") {
        return {
            input_mode: "reps_only",
            reps: Math.max(0, values.reps),
            weight_kg: null,
        };
    }
    return {
        input_mode: "weight_reps",
        weight_kg: clampWeightKg(values.weightKg),
        reps: Math.max(0, values.reps),
    };
}

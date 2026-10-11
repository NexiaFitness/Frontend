/**
 * runLoggerHydrationPolicy.ts — Merge de defaults del logger guiado sin pisar campos tocados.
 *
 * Contexto: superset/giant/dropset (slotLogs) y serie simple; D-LOG-TOUCH-01.
 * Notas: lógica pura; display ref en UI no pasa por aquí.
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import type { AthleteRunReferencePoint } from "../../types/athleteRunReference";
import type { RunLoggerDefaults } from "./runReferenceUtils";
import { prevWeightForApplicableMerge, readSlotWeightForMerge } from "./runLoggerFieldState";

export type RunLoggerTouchField =
    | "weight"
    | "reps"
    | "durationSeconds"
    | "roundRpe"
    | "rpe";

export interface RunLoggerSlotLogShape {
    weight: number | null;
    reps: number;
    durationSeconds?: number;
}

export interface MergeSlotLogInput {
    prev: RunLoggerSlotLogShape | undefined;
    defaults: RunLoggerDefaults;
    touched: ReadonlySet<string>;
    slotStepKey: string;
    prescribedDefaultWeight: number;
    prescribedDefaultReps: number;
}

/** Clave estable de campo tocado (slot / ronda / single). */
export function buildRunLoggerFieldTouchKey(
    scope: "slot" | "round" | "single",
    id: string,
    field: RunLoggerTouchField
): string {
    return `${scope}:${id}:${field}`;
}

/** Token de referencia por slot para idempotencia incremental. */
export function runLoggerReferenceTokenForSlot(
    referenceWeightKg: number | null | undefined,
    localWeightKg: number | null | undefined
): string {
    const weight = referenceWeightKg ?? localWeightKg;
    if (weight == null || weight <= 0) return "pending";
    return String(weight);
}

/** Token slot (peso + RPE): hidratación RPE no depende de peso resuelto. */
export function runLoggerSlotHydrationToken(
    apiRef: AthleteRunReferencePoint | null | undefined,
    localRef: AthleteRunReferencePoint | null | undefined
): string {
    const weight = apiRef?.weight_kg ?? localRef?.weight_kg;
    const rpe = apiRef?.rpe ?? localRef?.rpe;
    const wPart = weight != null && weight > 0 ? String(weight) : "pw";
    const rPart = rpe != null ? String(rpe) : "pr";
    return `${wPart}:${rPart}`;
}

/** Peso inicial al abrir paso: prescripción o vacío (nunca 0 implícito). */
export function resolveInitialSlotWeight(prescribedDefaultWeight: number): number | null {
    return prescribedDefaultWeight > 0 ? prescribedDefaultWeight : null;
}

/** Peso aplicable desde defaults sin forzar 0 cuando no hay dato. */
export function resolveApplicableSlotWeight(
    defaults: RunLoggerDefaults,
    prescribedDefaultWeight: number,
    prevWeight: number | null | undefined
): number | null {
    if (defaults.weight > 0) return defaults.weight;
    if (prescribedDefaultWeight > 0) return prescribedDefaultWeight;
    if (prevWeight != null && prevWeight > 0) return prevWeight;
    return null;
}

function isSlotFieldTouched(
    touched: ReadonlySet<string>,
    slotStepKey: string,
    field: "weight" | "reps" | "durationSeconds"
): boolean {
    return touched.has(buildRunLoggerFieldTouchKey("slot", slotStepKey, field));
}

function isSingleFieldTouched(
    touched: ReadonlySet<string>,
    stepKey: string,
    field: "weight" | "reps" | "rpe"
): boolean {
    return touched.has(buildRunLoggerFieldTouchKey("single", stepKey, field));
}

export interface SingleLoggerStateShape {
    weight: number | null;
    reps: number;
    rpe: number | null;
}

export interface MergeSingleLoggerInput {
    prev: SingleLoggerStateShape;
    defaults: RunLoggerDefaults;
    touched: ReadonlySet<string>;
    stepKey: string;
    prescribedDefaultWeight: number;
    plannedWeight: number | null;
    seriesPosition: number;
    seriesAutofillWeight: number | null;
    durationFallbackReps: number;
    inputMode: string;
    /** false al cambiar de ejercicio: no arrastrar peso del paso anterior. */
    allowCarryPrevWeight: boolean;
}

/** Serie simple: merge por campo (R-LOG-07 single). */
export function mergeSingleLoggerWithDefaults(input: MergeSingleLoggerInput): SingleLoggerStateShape {
    const {
        prev,
        defaults,
        touched,
        stepKey,
        prescribedDefaultWeight,
        plannedWeight,
        seriesPosition,
        seriesAutofillWeight,
        durationFallbackReps,
        inputMode,
        allowCarryPrevWeight,
    } = input;

    const hasCoachWeight = plannedWeight != null && plannedWeight > 0;
    let nextWeight: number | null = defaults.weight;
    if (
        seriesPosition > 1 &&
        !hasCoachWeight &&
        !isSingleFieldTouched(touched, stepKey, "weight")
    ) {
        if (seriesAutofillWeight != null && seriesAutofillWeight > 0) {
            nextWeight = seriesAutofillWeight;
        }
    }
    if (!isSingleFieldTouched(touched, stepKey, "weight")) {
        const applicable = resolveApplicableSlotWeight(
            { ...defaults, weight: nextWeight },
            prescribedDefaultWeight,
            prevWeightForApplicableMerge(
                prev.weight != null && prev.weight > 0 ? prev.weight : null,
                allowCarryPrevWeight
            )
        );
        nextWeight =
            applicable ??
            (allowCarryPrevWeight
                ? prev.weight
                : resolveInitialSlotWeight(prescribedDefaultWeight));
    } else {
        nextWeight = prev.weight;
    }

    let nextReps =
        inputMode === "duration" ? durationFallbackReps : defaults.reps;
    if (isSingleFieldTouched(touched, stepKey, "reps")) {
        nextReps = prev.reps;
    }

    let nextRpe = defaults.rpe;
    if (isSingleFieldTouched(touched, stepKey, "rpe")) {
        nextRpe = prev.rpe;
    }

    return { weight: nextWeight, reps: nextReps, rpe: nextRpe };
}

/** Fusiona defaults en un slot respetando campos tocados (R-LOG-01–04). */
export function mergeSlotLogWithDefaults(input: MergeSlotLogInput): RunLoggerSlotLogShape {
    const {
        prev,
        defaults,
        touched,
        slotStepKey,
        prescribedDefaultWeight,
        prescribedDefaultReps,
    } = input;

    const baseReps =
        prev?.reps != null && prev.reps > 0
            ? prev.reps
            : prescribedDefaultReps > 0
              ? prescribedDefaultReps
              : defaults.reps;

    const weightTouched = isSlotFieldTouched(touched, slotStepKey, "weight");
    const mergedWeight = readSlotWeightForMerge({
        prev: prev ? { weight: prev.weight } : undefined,
        touched: weightTouched,
    });

    let nextWeight: number | null;
    if (weightTouched) {
        nextWeight = mergedWeight ?? null;
    } else if (mergedWeight === undefined) {
        nextWeight =
            resolveApplicableSlotWeight(defaults, prescribedDefaultWeight, undefined) ??
            resolveInitialSlotWeight(prescribedDefaultWeight);
    } else {
        nextWeight =
            resolveApplicableSlotWeight(defaults, prescribedDefaultWeight, mergedWeight) ??
            mergedWeight;
    }

    const next: RunLoggerSlotLogShape = {
        weight: nextWeight,
        reps: baseReps,
        durationSeconds: prev?.durationSeconds,
    };

    if (!isSlotFieldTouched(touched, slotStepKey, "reps")) {
        next.reps = defaults.reps > 0 ? defaults.reps : prescribedDefaultReps;
    }

    if (
        prev?.durationSeconds != null &&
        !isSlotFieldTouched(touched, slotStepKey, "durationSeconds")
    ) {
        next.durationSeconds = defaults.reps > 0 ? defaults.reps : prev.durationSeconds;
    }

    return next;
}

/** RPE de ronda: conservar si el atleta lo tocó (R-LOG-05). */
export function mergeRoundRpeWithDefaults(
    prev: number | null,
    defaultsRpe: number | null | undefined,
    runStepKey: string,
    touched: ReadonlySet<string>
): number | null {
    if (touched.has(buildRunLoggerFieldTouchKey("round", runStepKey, "roundRpe"))) {
        return prev;
    }
    if (defaultsRpe != null) return defaultsRpe;
    return prev;
}

/** Confirmación batch: lo visible debe ser válido (D-LOG-TOUCH-01). */
export function isRunLoggerSlotConfirmValid(
    log: RunLoggerSlotLogShape,
    inputMode: string = "weight_reps"
): boolean {
    if (inputMode === "duration") {
        return (log.durationSeconds ?? log.reps) > 0;
    }
    if (inputMode === "reps_only") {
        return log.reps > 0;
    }
    return log.reps > 0 && log.weight != null && log.weight >= 0;
}

/**
 * useAthleteRunSingleLoggerDefaults.ts — Defaults serie simple sin pisar campos tocados.
 *
 * Contexto: D-LOG-TOUCH-01; referencia tardía en single_set.
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import { useEffect, useRef, type MutableRefObject } from "react";
import type { AthleteFlatExercise } from "@nexia/shared/offline/athleteSessionTypes";
import { mergeSingleLoggerWithDefaults } from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import { resolveRunLoggerDefaults } from "@nexia/shared/utils/athlete/runReferenceUtils";
import { resolveSeriesWeightAutofillKey } from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";

export interface UseAthleteRunSingleLoggerDefaultsOptions {
    restShowLogger: boolean;
    current: AthleteFlatExercise | null;
    isBatchStep: boolean;
    effectiveRunReference: AthleteRunReference | null | undefined;
    getTouchedSnapshot: () => ReadonlySet<string>;
    weight: number | null;
    reps: number;
    rpe: number | null;
    seriesAutofillWeightRef: MutableRefObject<Map<string, number>>;
    setWeight: (v: number | null) => void;
    setReps: (v: number) => void;
    setRpe: (v: number | null) => void;
}

export function useAthleteRunSingleLoggerDefaults({
    restShowLogger,
    current,
    isBatchStep,
    effectiveRunReference,
    getTouchedSnapshot,
    weight,
    reps,
    rpe,
    seriesAutofillWeightRef,
    setWeight,
    setReps,
    setRpe,
}: UseAthleteRunSingleLoggerDefaultsOptions): void {
    const singleLoggerDefaultsStepRef = useRef<string | null>(null);
    const singleLoggerLastAutofillKeyRef = useRef<string | null>(null);
    const singleLoggerHydratedStepKeyRef = useRef<string | null>(null);

    useEffect(() => {
        singleLoggerDefaultsStepRef.current = null;
    }, [current?.stepKey]);

    useEffect(() => {
        if (!restShowLogger || !current || isBatchStep) return;

        const stepChanged =
            singleLoggerHydratedStepKeyRef.current != null &&
            singleLoggerHydratedStepKeyRef.current !== current.stepKey;
        if (stepChanged) {
            singleLoggerLastAutofillKeyRef.current = null;
        }

        const ref = effectiveRunReference?.reference;
        const refToken =
            ref == null
                ? "pending"
                : ref.weight_kg != null && ref.weight_kg > 0
                  ? String(ref.weight_kg)
                  : "ref-empty";
        const plannedToken =
            current.plannedWeight != null && current.plannedWeight > 0
                ? `p${current.plannedWeight}`
                : "np";
        const defaultsKey = `${current.stepKey}:${plannedToken}:${refToken}`;
        if (singleLoggerDefaultsStepRef.current === defaultsKey) return;

        const defaults = resolveRunLoggerDefaults({
            setIndex: current.setIndex,
            prescribedReps: current.defaultReps,
            prescribedRpe: current.defaultRpe,
            plannedWeight: current.plannedWeight,
            defaultWeight: current.defaultWeight,
            reference: ref,
        });

        const seriesPosition = Math.max(current.setIndex, current.roundIndex ?? 1);
        const autofill = seriesAutofillWeightRef.current.get(
            resolveSeriesWeightAutofillKey(current)
        );

        const currentAutofillKey = resolveSeriesWeightAutofillKey({
            groupKind: current.groupKind,
            groupId: current.groupId,
            exerciseId: current.exerciseId,
            blockExerciseId: current.blockExerciseId,
        });
        const allowCarryPrevWeight =
            singleLoggerLastAutofillKeyRef.current != null &&
            singleLoggerLastAutofillKeyRef.current === currentAutofillKey;

        const merged = mergeSingleLoggerWithDefaults({
            prev: {
                weight: stepChanged ? null : weight,
                reps,
                rpe,
            },
            defaults,
            touched: getTouchedSnapshot(),
            stepKey: current.stepKey,
            prescribedDefaultWeight: current.defaultWeight,
            plannedWeight: current.plannedWeight,
            seriesPosition,
            seriesAutofillWeight: autofill ?? null,
            durationFallbackReps:
                current.plannedDurationSeconds ?? current.defaultReps,
            inputMode: current.inputMode ?? "weight_reps",
            allowCarryPrevWeight,
        });

        if (merged.weight !== weight) setWeight(merged.weight);
        if (merged.reps !== reps) setReps(merged.reps);
        if (merged.rpe !== rpe) setRpe(merged.rpe);

        singleLoggerDefaultsStepRef.current = defaultsKey;
        singleLoggerLastAutofillKeyRef.current = currentAutofillKey;
        singleLoggerHydratedStepKeyRef.current = current.stepKey;
    }, [
        restShowLogger,
        current,
        isBatchStep,
        effectiveRunReference?.reference,
        getTouchedSnapshot,
        weight,
        reps,
        rpe,
        seriesAutofillWeightRef,
        setReps,
        setRpe,
        setWeight,
    ]);
}

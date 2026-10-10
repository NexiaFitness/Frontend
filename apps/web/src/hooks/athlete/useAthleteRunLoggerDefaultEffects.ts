/**
 * useAthleteRunLoggerDefaultEffects.ts — Orquestador defaults logger guiado (single + group).
 *
 * Propósito: delega ronda grupal a useAthleteRunGroupLoggerDefaults; serie simple aquí (H4).
 * Contexto: useAthleteSessionRun (FE-4/FE-5); D-LOG-TOUCH-01.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import { useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import type { AthleteFlatExercise } from "@nexia/shared/offline/athleteSessionTypes";
import { resolveRunLoggerDefaults } from "@nexia/shared/utils/athlete/runReferenceUtils";
import { resolveSeriesWeightAutofillKey } from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";
import { useAthleteRunGroupLoggerDefaults } from "@/hooks/athlete/useAthleteRunGroupLoggerDefaults";

export interface UseAthleteRunLoggerDefaultEffectsOptions {
    currentStepKey: string | undefined;
    current: AthleteFlatExercise | null;
    isBatchStep: boolean;
    restShowLogger: boolean;
    restPhase: string;
    isGroupRound: boolean;
    currentRunStep: AthleteRunStep | undefined;
    effectiveRunReference: AthleteRunReference | null | undefined;
    slotReferences: Record<string, Pick<AthleteRunReference, "reference">>;
    localExecutions: LocalSetExecution[];
    touchedWeightStepKeysRef: MutableRefObject<Set<string>>;
    seriesAutofillWeightRef: MutableRefObject<Map<string, number>>;
    getTouchedSnapshot: () => ReadonlySet<string>;
    roundRpe: number | null;
    setWeight: (v: number) => void;
    setReps: (v: number) => void;
    setRpe: (v: number | null) => void;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    setRoundRpeState: (v: number | null) => void;
}

export function useAthleteRunLoggerDefaultEffects({
    currentStepKey,
    current,
    isBatchStep,
    restShowLogger,
    restPhase,
    isGroupRound,
    currentRunStep,
    effectiveRunReference,
    slotReferences,
    localExecutions,
    touchedWeightStepKeysRef,
    seriesAutofillWeightRef,
    getTouchedSnapshot,
    roundRpe,
    setWeight,
    setReps,
    setRpe,
    setSlotLogs,
    setRoundRpeState,
}: UseAthleteRunLoggerDefaultEffectsOptions): void {
    const singleLoggerDefaultsStepRef = useRef<string | null>(null);

    useEffect(() => {
        singleLoggerDefaultsStepRef.current = null;
    }, [currentStepKey]);

    useAthleteRunGroupLoggerDefaults({
        restPhase,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
        getTouchedSnapshot,
        setSlotLogs,
        roundRpe,
        setRoundRpeState,
    });

    useEffect(() => {
        if (!restShowLogger || !current || isBatchStep) return;

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
        const hasCoachWeight =
            current.plannedWeight != null && current.plannedWeight > 0;
        let nextWeight = defaults.weight;
        if (
            seriesPosition > 1 &&
            !hasCoachWeight &&
            !touchedWeightStepKeysRef.current.has(current.stepKey)
        ) {
            const autofill = seriesAutofillWeightRef.current.get(
                resolveSeriesWeightAutofillKey(current)
            );
            if (autofill != null && autofill > 0) {
                nextWeight = autofill;
            }
        }
        setWeight(nextWeight);
        const nextReps =
            current.inputMode === "duration"
                ? current.plannedDurationSeconds ?? current.defaultReps
                : defaults.reps;
        setReps(nextReps);
        setRpe(defaults.rpe);
        singleLoggerDefaultsStepRef.current = defaultsKey;
    }, [
        restShowLogger,
        current,
        isBatchStep,
        effectiveRunReference?.reference,
        seriesAutofillWeightRef,
        setReps,
        setRpe,
        setWeight,
        touchedWeightStepKeysRef,
    ]);
}

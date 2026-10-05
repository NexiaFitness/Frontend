/**
 * useAthleteRunLoggerDefaultEffects.ts — Defaults de logger guiado (single + group round).
 *
 * Propósito: hidratar peso/reps/RPE y slotLogs al abrir logger o descanso post-ronda.
 * Contexto: useAthleteSessionRun (FE-4/FE-5); no duplica buildAthleteRunSteps.
 * Notas de mantenimiento: refs autofill serie a serie; no crecer — extraer si añade modos.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import { useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import type { AthleteFlatExercise } from "@nexia/shared/offline/athleteSessionTypes";
import { resolveRunLoggerDefaults } from "@nexia/shared/utils/athlete/runReferenceUtils";
import { resolveLocalRunReference } from "@nexia/shared/utils/athlete/localRunReferenceUtils";
import { resolveSeriesWeightAutofillKey } from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/execution/AthleteMultiSlotLogger";
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
    setWeight: (v: number) => void;
    setReps: (v: number) => void;
    setRpe: (v: number | null) => void;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    setRoundRpe: (v: number | null) => void;
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
    setWeight,
    setReps,
    setRpe,
    setSlotLogs,
    setRoundRpe,
}: UseAthleteRunLoggerDefaultEffectsOptions): void {
    const loggerDefaultsStepRef = useRef<string | null>(null);

    useEffect(() => {
        loggerDefaultsStepRef.current = null;
    }, [currentStepKey]);

    useEffect(() => {
        if (!restShowLogger || !current || isBatchStep) return;
        const defaultsKey = current.stepKey;
        if (loggerDefaultsStepRef.current === defaultsKey) return;

        const defaults = resolveRunLoggerDefaults({
            setIndex: current.setIndex,
            prescribedReps: current.defaultReps,
            prescribedRpe: current.defaultRpe,
            plannedWeight: current.plannedWeight,
            defaultWeight: current.defaultWeight,
            reference: effectiveRunReference?.reference,
        });

        const seriesPosition = Math.max(current.setIndex, current.roundIndex ?? 1);
        let nextWeight = defaults.weight;
        if (
            seriesPosition > 1 &&
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
        loggerDefaultsStepRef.current = defaultsKey;
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

    useEffect(() => {
        if (restPhase !== "logging_rest" || !isGroupRound || !currentRunStep?.slots?.length) {
            return;
        }

        const refFingerprint = currentRunStep.slots
            .map((slot) => {
                const apiRef = slotReferences[slot.stepKey]?.reference;
                const localRef = resolveLocalRunReference({
                    exerciseId: slot.exerciseId,
                    roundIndex: currentRunStep.roundIndex,
                    slotLabel: slot.slotLabel,
                    groupKind: currentRunStep.groupKind,
                    localExecutions,
                });
                const weight = apiRef?.weight_kg ?? localRef?.weight_kg ?? "pending";
                return `${slot.stepKey}:${weight}`;
            })
            .join("|");
        const defaultsKey = `${currentRunStep.stepKey}:${refFingerprint}`;
        if (loggerDefaultsStepRef.current === defaultsKey) return;

        setSlotLogs((prev) => {
            const next = { ...prev };
            for (const slot of currentRunStep.slots!) {
                const reference =
                    slotReferences[slot.stepKey]?.reference ??
                    resolveLocalRunReference({
                        exerciseId: slot.exerciseId,
                        roundIndex: currentRunStep.roundIndex,
                        slotLabel: slot.slotLabel,
                        groupKind: currentRunStep.groupKind,
                        localExecutions,
                    });
                const defaults = resolveRunLoggerDefaults({
                    setIndex: currentRunStep.roundIndex,
                    prescribedReps: slot.defaultReps,
                    prescribedRpe: slot.defaultRpe,
                    plannedWeight: null,
                    defaultWeight: slot.defaultWeight,
                    reference,
                });
                next[slot.stepKey] = {
                    weight: defaults.weight,
                    reps: defaults.reps,
                };
            }
            return next;
        });

        const prescribedRpe =
            currentRunStep.slots.find((slot) => slot.defaultRpe != null)?.defaultRpe ??
            null;
        const refRpe = currentRunStep.slots
            .map((slot) => slotReferences[slot.stepKey]?.reference?.rpe)
            .find((value) => value != null);
        if (currentRunStep.roundIndex > 1 && refRpe != null) {
            setRoundRpe(refRpe);
        } else if (prescribedRpe != null) {
            setRoundRpe(prescribedRpe);
        }

        loggerDefaultsStepRef.current = defaultsKey;
    }, [
        restPhase,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
        setRoundRpe,
        setSlotLogs,
    ]);
}

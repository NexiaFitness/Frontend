/**
 * useAthleteRunLoggerDefaultEffects.ts — Orquestador defaults logger guiado (single + group).
 *
 * Propósito: delega a hooks por modo; D-LOG-TOUCH-01.
 * Contexto: useAthleteSessionRun (FE-4/FE-5).
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import {
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
    useEffect,
    useRef,
} from "react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import type { AthleteFlatExercise } from "@nexia/shared/offline/athleteSessionTypes";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";
import { useAthleteRunGroupLoggerDefaults } from "@/hooks/athlete/useAthleteRunGroupLoggerDefaults";
import { useAthleteRunSingleLoggerDefaults } from "@/hooks/athlete/useAthleteRunSingleLoggerDefaults";

export interface UseAthleteRunLoggerDefaultEffectsOptions {
    current: AthleteFlatExercise | null;
    isBatchStep: boolean;
    restShowLogger: boolean;
    isGroupRound: boolean;
    currentRunStep: AthleteRunStep | undefined;
    effectiveRunReference: AthleteRunReference | null | undefined;
    slotReferences: Record<string, Pick<AthleteRunReference, "reference">>;
    localExecutions: LocalSetExecution[];
    seriesAutofillWeightRef: MutableRefObject<Map<string, number>>;
    getTouchedSnapshot: () => ReadonlySet<string>;
    weight: number | null;
    reps: number;
    rpe: number | null;
    setWeight: (v: number | null) => void;
    setReps: (v: number) => void;
    setRpe: (v: number | null) => void;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    setRoundRpeState: Dispatch<SetStateAction<number | null>>;
}

export function useAthleteRunLoggerDefaultEffects({
    current,
    isBatchStep,
    restShowLogger,
    isGroupRound,
    currentRunStep,
    effectiveRunReference,
    slotReferences,
    localExecutions,
    seriesAutofillWeightRef,
    getTouchedSnapshot,
    weight,
    reps,
    rpe,
    setWeight,
    setReps,
    setRpe,
    setSlotLogs,
    setRoundRpeState,
}: UseAthleteRunLoggerDefaultEffectsOptions): void {
    const prevSingleStepKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (isBatchStep || !current?.stepKey) return;
        if (
            prevSingleStepKeyRef.current != null &&
            prevSingleStepKeyRef.current !== current.stepKey
        ) {
            setWeight(null);
        }
        prevSingleStepKeyRef.current = current.stepKey;
    }, [current?.stepKey, isBatchStep, setWeight]);

    useAthleteRunGroupLoggerDefaults({
        restShowLogger,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
        getTouchedSnapshot,
        setSlotLogs,
        setRoundRpeState,
    });

    useAthleteRunSingleLoggerDefaults({
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
    });
}

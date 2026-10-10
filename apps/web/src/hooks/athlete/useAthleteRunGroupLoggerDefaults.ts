/**
 * useAthleteRunGroupLoggerDefaults.ts — Defaults incrementales por slot en logging_rest.
 *
 * Contexto: superset/giant/dropset; fusiona con slotLogs sin pisar campos tocados.
 * Notas: ref display en tarjetas no muta estado aquí.
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import { useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import { resolveLocalRunReference } from "@nexia/shared/utils/athlete/localRunReferenceUtils";
import {
    mergeRoundRpeWithDefaults,
    mergeSlotLogWithDefaults,
    runLoggerReferenceTokenForSlot,
} from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import { resolveRunLoggerDefaults } from "@nexia/shared/utils/athlete/runReferenceUtils";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";

export interface UseAthleteRunGroupLoggerDefaultsOptions {
    restPhase: string;
    isGroupRound: boolean;
    currentRunStep: AthleteRunStep | undefined;
    slotReferences: Record<string, Pick<AthleteRunReference, "reference">>;
    localExecutions: LocalSetExecution[];
    getTouchedSnapshot: () => ReadonlySet<string>;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    roundRpe: number | null;
    setRoundRpeState: (value: number | null) => void;
}

export function useAthleteRunGroupLoggerDefaults({
    restPhase,
    isGroupRound,
    currentRunStep,
    slotReferences,
    localExecutions,
    getTouchedSnapshot,
    setSlotLogs,
    roundRpe,
    setRoundRpeState,
}: UseAthleteRunGroupLoggerDefaultsOptions): void {
    const appliedRefTokenBySlotRef = useRef<Map<string, string>>(new Map());
    const runStepKeyRef = useRef<string | null>(null);

    useEffect(() => {
        appliedRefTokenBySlotRef.current = new Map();
        runStepKeyRef.current = currentRunStep?.stepKey ?? null;
    }, [currentRunStep?.stepKey]);

    useEffect(() => {
        if (restPhase !== "logging_rest" || !isGroupRound || !currentRunStep?.slots?.length) {
            return;
        }

        const touched = getTouchedSnapshot();
        const slotsToHydrate: typeof currentRunStep.slots = [];

        for (const slot of currentRunStep.slots) {
            const apiRef = slotReferences[slot.stepKey]?.reference;
            const localRef = resolveLocalRunReference({
                exerciseId: slot.exerciseId,
                roundIndex: currentRunStep.roundIndex,
                slotLabel: slot.slotLabel,
                groupKind: currentRunStep.groupKind,
                localExecutions,
            });
            const token = runLoggerReferenceTokenForSlot(
                apiRef?.weight_kg,
                localRef?.weight_kg
            );
            const prevToken = appliedRefTokenBySlotRef.current.get(slot.stepKey);
            if (prevToken === token) continue;
            appliedRefTokenBySlotRef.current.set(slot.stepKey, token);
            slotsToHydrate.push(slot);
        }

        if (slotsToHydrate.length === 0) return;

        setSlotLogs((prev) => {
            const next = { ...prev };
            for (const slot of slotsToHydrate) {
                const apiRef = slotReferences[slot.stepKey]?.reference;
                const localRef = resolveLocalRunReference({
                    exerciseId: slot.exerciseId,
                    roundIndex: currentRunStep.roundIndex,
                    slotLabel: slot.slotLabel,
                    groupKind: currentRunStep.groupKind,
                    localExecutions,
                });
                const reference: AthleteRunReferencePoint | null | undefined =
                    apiRef ?? localRef ?? null;
                const defaults = resolveRunLoggerDefaults({
                    setIndex: currentRunStep.roundIndex,
                    prescribedReps: slot.defaultReps,
                    prescribedRpe: slot.defaultRpe,
                    plannedWeight: null,
                    defaultWeight: slot.defaultWeight,
                    reference,
                });
                next[slot.stepKey] = mergeSlotLogWithDefaults({
                    prev: prev[slot.stepKey],
                    defaults,
                    touched,
                    slotStepKey: slot.stepKey,
                    prescribedDefaultWeight: slot.defaultWeight,
                    prescribedDefaultReps: slot.defaultReps,
                });
            }
            return next;
        });

        const prescribedRpe =
            currentRunStep.slots.find((s) => s.defaultRpe != null)?.defaultRpe ?? null;
        const refRpe = currentRunStep.slots
            .map((s) => slotReferences[s.stepKey]?.reference?.rpe)
            .find((v) => v != null);
        const defaultsRpe =
            currentRunStep.roundIndex > 1 && refRpe != null
                ? refRpe
                : prescribedRpe;

        const mergedRpe = mergeRoundRpeWithDefaults(
            roundRpe,
            defaultsRpe,
            currentRunStep.stepKey,
            touched
        );
        if (mergedRpe !== roundRpe) {
            setRoundRpeState(mergedRpe);
        }
    }, [
        restPhase,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
        getTouchedSnapshot,
        setSlotLogs,
        roundRpe,
        setRoundRpeState,
    ]);
}

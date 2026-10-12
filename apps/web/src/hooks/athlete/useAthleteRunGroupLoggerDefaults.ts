/**
 * useAthleteRunGroupLoggerDefaults.ts — Defaults incrementales por slot en logging_rest.
 *
 * Contexto: superset/giant/dropset; fusiona con slotLogs sin pisar campos tocados.
 * Notas: ref display en tarjetas no muta estado aquí. El RPE de ronda se escribe con
 * actualización funcional, igual que slotLogs: al cambiar de paso,
 * useAthleteRunBatchStepOnStepKeyChange reinicia el RPE en el mismo commit y el
 * estado del render aún trae el valor de la ronda anterior (R-LOG-05).
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import {
    resolveLocalRoundRpeFromExecutions,
    resolveLocalRunReference,
} from "@nexia/shared/utils/athlete/localRunReferenceUtils";
import {
    mergeRoundRpeWithDefaults,
    mergeSlotLogWithDefaults,
    runLoggerSlotHydrationToken,
} from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import { resolveRunLoggerDefaults } from "@nexia/shared/utils/athlete/runReferenceUtils";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";

export interface UseAthleteRunGroupLoggerDefaultsOptions {
    /** Misma señal que serie simple: hidratar cuando el logger es visible (doing o logging_rest). */
    restShowLogger: boolean;
    isGroupRound: boolean;
    currentRunStep: AthleteRunStep | undefined;
    slotReferences: Record<string, Pick<AthleteRunReference, "reference">>;
    localExecutions: LocalSetExecution[];
    getTouchedSnapshot: () => ReadonlySet<string>;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    setRoundRpeState: Dispatch<SetStateAction<number | null>>;
}

export function useAthleteRunGroupLoggerDefaults({
    restShowLogger,
    isGroupRound,
    currentRunStep,
    slotReferences,
    localExecutions,
    getTouchedSnapshot,
    setSlotLogs,
    setRoundRpeState,
}: UseAthleteRunGroupLoggerDefaultsOptions): void {
    const appliedRefTokenBySlotRef = useRef<Map<string, string>>(new Map());
    const appliedRoundRpeTokenRef = useRef<string>("");

    useEffect(() => {
        appliedRefTokenBySlotRef.current = new Map();
        appliedRoundRpeTokenRef.current = "";
    }, [currentRunStep?.stepKey]);

    useEffect(() => {
        if (!restShowLogger || !isGroupRound || !currentRunStep?.slots?.length) {
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
            const token = runLoggerSlotHydrationToken(apiRef, localRef);
            const prevToken = appliedRefTokenBySlotRef.current.get(slot.stepKey);
            if (prevToken === token) continue;
            appliedRefTokenBySlotRef.current.set(slot.stepKey, token);
            slotsToHydrate.push(slot);
        }

        if (slotsToHydrate.length > 0) {
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
        }

        const prescribedRpe =
            currentRunStep.slots.find((s) => s.defaultRpe != null)?.defaultRpe ?? null;
        const apiRpe = currentRunStep.slots
            .map((s) => slotReferences[s.stepKey]?.reference?.rpe)
            .find((v) => v != null);
        const localRpe = resolveLocalRoundRpeFromExecutions(
            localExecutions,
            currentRunStep.roundIndex,
            currentRunStep.groupKind,
            currentRunStep.groupId
        );
        const refRpe = apiRpe ?? localRpe;
        const roundRpeToken = `${currentRunStep.roundIndex}|${refRpe ?? "na"}|${prescribedRpe ?? "na"}`;
        if (appliedRoundRpeTokenRef.current !== roundRpeToken) {
            appliedRoundRpeTokenRef.current = roundRpeToken;
            const defaultsRpe =
                currentRunStep.roundIndex > 1 && refRpe != null ? refRpe : prescribedRpe;
            const roundStepKey = currentRunStep.stepKey;
            setRoundRpeState((prev) =>
                mergeRoundRpeWithDefaults(prev, defaultsRpe, roundStepKey, touched)
            );
        }
    }, [
        restShowLogger,
        isGroupRound,
        currentRunStep,
        slotReferences,
        localExecutions,
        getTouchedSnapshot,
        setSlotLogs,
        setRoundRpeState,
    ]);
}

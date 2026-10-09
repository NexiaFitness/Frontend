/**
 * useAthleteRunRestConfirm.ts — Confirmación de paso + descanso V05 (§5a).
 *
 * Propósito: extraer onConfirm/restFlow de useAthleteSessionRun (D6 sin inflar wc).
 * Contexto: run guiado atleta.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import { useCallback } from "react";
import {
    useAthleteRunRestFlow,
    type AthleteRunRestPhase,
} from "@/hooks/athlete/useAthleteRunRestFlow";
import { getAthleteBlockStartLabel } from "@/components/athlete/execution/athleteRunPresentation";

export interface UseAthleteRunRestConfirmOptions {
    restAfterSeconds: number | null;
    confirmLabel: string;
    currentStepKey: string | null;
    isAmrapBlock: boolean;
    amrapRounds: number;
    amrapPartialTotal: number;
    setAmrapValidationVisible: (visible: boolean) => void;
    isBatchStep: boolean;
    handleSaveBatch: () => Promise<void>;
    handleSaveSet: () => Promise<void>;
    advanceAfterRest: () => void;
    isConfirmValid: boolean;
    isDropsetRound: boolean;
    isTimedBlock: boolean;
    isEmomBlock: boolean;
    isForTimeBlock: boolean;
    afterStepConfirm?: () => Promise<void>;
}

export function useAthleteRunRestConfirm({
    restAfterSeconds,
    confirmLabel,
    currentStepKey,
    isAmrapBlock,
    amrapRounds,
    amrapPartialTotal,
    setAmrapValidationVisible,
    isBatchStep,
    handleSaveBatch,
    handleSaveSet,
    advanceAfterRest,
    isConfirmValid,
    isDropsetRound,
    isTimedBlock,
    isEmomBlock,
    isForTimeBlock,
    afterStepConfirm,
}: UseAthleteRunRestConfirmOptions) {
    const onConfirm = useCallback(async (): Promise<boolean> => {
        if (isAmrapBlock) {
            if (amrapRounds === 0 && amrapPartialTotal === 0) {
                setAmrapValidationVisible(true);
                return false;
            }
            setAmrapValidationVisible(false);
        }
        if (afterStepConfirm) {
            await afterStepConfirm();
        }
        if (isBatchStep) {
            await handleSaveBatch();
        } else {
            await handleSaveSet();
        }
        return true;
    }, [
        afterStepConfirm,
        amrapPartialTotal,
        amrapRounds,
        handleSaveBatch,
        handleSaveSet,
        isAmrapBlock,
        isBatchStep,
        setAmrapValidationVisible,
    ]);

    const hasPrescribedRest =
        restAfterSeconds != null && restAfterSeconds > 0;

    const restFlow = useAthleteRunRestFlow({
        restAfterSeconds,
        confirmLabel,
        stepKey: currentStepKey,
        onConfirm,
        onRestComplete: advanceAfterRest,
        isConfirmValid: isAmrapBlock ? true : isConfirmValid,
        // D-REST-01: single_set con descanso — logger solo tras «Empezar descanso».
        requireStartBeforeLog:
            isDropsetRound ||
            isTimedBlock ||
            (!isBatchStep && hasPrescribedRest),
        startRestLabel: isDropsetRound
            ? "Registrar dropset"
            : isAmrapBlock
              ? "Registrar AMRAP"
              : isEmomBlock
                ? getAthleteBlockStartLabel("emom")
                : isForTimeBlock
                  ? getAthleteBlockStartLabel("for_time")
                  : "Empezar descanso",
    });

    return { restFlow, restPhase: restFlow.phase as AthleteRunRestPhase };
}

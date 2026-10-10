/**
 * useAthleteRunBatchStepOnStepKeyChange.ts — Reset slotLogs / AMRAP / EMOM al cambiar paso.
 *
 * Contexto: extraído de useAthleteSessionRun (§7.1); D-LOG-TOUCH-01 init peso vacío/prescripción.
 *
 * @author Frontend Team
 * @since v8.5.0
 */

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { buildInitialAmrapPartial } from "@nexia/shared/utils/athlete/amrapResult";
import { resolveInitialSlotWeight } from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";

export interface UseAthleteRunBatchStepOnStepKeyChangeOptions {
    currentStepKey: string | null;
    runStepsRef: MutableRefObject<AthleteRunStep[]>;
    setSlotLogs: Dispatch<SetStateAction<Record<string, SlotLogValues>>>;
    setRoundRpe: Dispatch<SetStateAction<number | null>>;
    setAmrapRounds: Dispatch<SetStateAction<number>>;
    setAmrapPartialReps: Dispatch<SetStateAction<Record<string, number>>>;
    setAmrapValidationVisible: Dispatch<SetStateAction<boolean>>;
    setEmomAsPlanned: Dispatch<SetStateAction<boolean | null>>;
    setEmomAthleteNote: Dispatch<SetStateAction<string>>;
}

export function useAthleteRunBatchStepOnStepKeyChange({
    currentStepKey,
    runStepsRef,
    setSlotLogs,
    setRoundRpe,
    setAmrapRounds,
    setAmrapPartialReps,
    setAmrapValidationVisible,
    setEmomAsPlanned,
    setEmomAthleteNote,
}: UseAthleteRunBatchStepOnStepKeyChangeOptions): void {
    useEffect(() => {
        if (!currentStepKey) return;

        const runStep = runStepsRef.current.find((item) => item.stepKey === currentStepKey);
        if (
            !runStep ||
            (runStep.kind !== "group_round" && runStep.kind !== "timed_block") ||
            (!runStep.slots?.length && !runStep.emomIntervals?.length)
        ) {
            setSlotLogs((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setRoundRpe((prev) => (prev === null ? prev : null));
            setAmrapRounds((prev) => (prev === 0 ? prev : 0));
            setAmrapPartialReps((prev) => (Object.keys(prev).length === 0 ? prev : {}));
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomAthleteNote((prev) => (prev === "" ? prev : ""));
            return;
        }

        if (runStep.groupKind === "emom" && runStep.emomIntervals?.length) {
            setEmomAsPlanned((prev) => (prev === null ? prev : null));
            setEmomAthleteNote((prev) => (prev === "" ? prev : ""));
        }

        if (!runStep.slots?.length) return;

        const partialSlots = runStep.slots.map((slot) => ({
            stepKey: slot.stepKey,
            maxReps: slot.defaultReps,
        }));
        const initialPartial = buildInitialAmrapPartial(partialSlots);
        const initial: Record<string, SlotLogValues> = {};
        for (const slot of runStep.slots) {
            initial[slot.stepKey] = {
                weight: resolveInitialSlotWeight(slot.defaultWeight),
                reps: slot.defaultReps,
            };
        }

        const prescribedRpe =
            runStep.slots.find((slot) => slot.defaultRpe != null)?.defaultRpe ?? null;

        setSlotLogs((prev) => {
            const keys = Object.keys(initial);
            if (
                keys.length === Object.keys(prev).length &&
                keys.every((key) => {
                    const previous = prev[key];
                    const next = initial[key];
                    return (
                        previous &&
                        next &&
                        previous.weight === next.weight &&
                        previous.reps === next.reps
                    );
                })
            ) {
                return prev;
            }
            return initial;
        });

        setRoundRpe((prev) => (prev === prescribedRpe ? prev : prescribedRpe));
        setAmrapRounds((prev) => (prev === 0 ? prev : 0));
        setAmrapPartialReps((prev) => {
            const keys = Object.keys(initialPartial);
            if (
                keys.length === Object.keys(prev).length &&
                keys.every((key) => (prev[key] ?? 0) === (initialPartial[key] ?? 0))
            ) {
                return prev;
            }
            return initialPartial;
        });
        setAmrapValidationVisible((prev) => (prev === false ? prev : false));
    }, [
        currentStepKey,
        runStepsRef,
        setAmrapPartialReps,
        setAmrapRounds,
        setAmrapValidationVisible,
        setEmomAsPlanned,
        setEmomAthleteNote,
        setRoundRpe,
        setSlotLogs,
    ]);
}

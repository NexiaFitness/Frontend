/**
 * runAthleteGroupRoundSlotPersist.ts — Persistencia de slots en ronda guiada (H2 S4/S5).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import type { MutableRefObject } from "react";
import type { AthleteRunExecutionCreate } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    allGroupRoundSlotsAccountedFor,
    buildDefaultSlotLog,
    isSlotReadyToPersist,
    shouldSkipSlotOnGroupRoundSave,
} from "@nexia/shared/utils/athlete/athleteRunGroupRoundPersist";
import { buildAthleteRunExecutionPayloadFromSlot } from "@nexia/shared/utils/athlete/runReferenceUtils";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";

export interface PersistGroupRoundSlotsInput {
    sessionId: number;
    runStep: AthleteRunStep;
    slotLogs: Record<string, SlotLogValues>;
    roundRpe: number | null;
    completedStepKeys: Set<string>;
    touchedKeys: ReadonlySet<string>;
    slotReferences: Record<string, { suggestion?: unknown } | undefined>;
    getNextActualSets: (blockExerciseId: number, loggedSets?: number) => number;
    loggedSetsRef: MutableRefObject<Map<number, number>>;
    isOnline: boolean;
    postRunExecution: (payload: AthleteRunExecutionCreate) => { unwrap: () => Promise<unknown> };
    logExecution: (payload: AthleteRunExecutionCreate) => Promise<"synced" | "queued" | "offline">;
}

export async function persistGroupRoundStandardSlots(
    input: PersistGroupRoundSlotsInput
): Promise<{
    lastResult: "synced" | "queued" | "offline";
    roundComplete: boolean;
}> {
    const {
        sessionId,
        runStep,
        slotLogs,
        roundRpe,
        completedStepKeys,
        touchedKeys,
        slotReferences,
        getNextActualSets,
        loggedSetsRef,
        isOnline,
        postRunExecution,
        logExecution,
    } = input;

    const slots = runStep.slots ?? [];
    let lastResult: "synced" | "queued" | "offline" = "synced";
    const persistedThisRound = new Set<string>();
    const skippedInvalid = new Set<string>();

    for (const slot of slots) {
        if (
            shouldSkipSlotOnGroupRoundSave(
                slot.stepKey,
                completedStepKeys,
                touchedKeys
            )
        ) {
            continue;
        }

        const log = slotLogs[slot.stepKey] ?? buildDefaultSlotLog(slot);
        if (!isSlotReadyToPersist(log, slot.inputMode)) {
            skippedInvalid.add(slot.stepKey);
            continue;
        }

        const nextSets = getNextActualSets(slot.blockExerciseId, slot.loggedSets);
        loggedSetsRef.current.set(slot.blockExerciseId, nextSets);

        const executionPayload = buildAthleteRunExecutionPayloadFromSlot(
            sessionId,
            runStep,
            slot,
            {
                weight: log.weight,
                reps: log.reps,
                rpe: roundRpe,
                durationSeconds: log.durationSeconds ?? log.reps,
            },
            slotReferences[slot.stepKey]?.suggestion as never
        );

        if (isOnline) {
            await postRunExecution(executionPayload).unwrap();
            lastResult = "synced";
        } else {
            lastResult = await logExecution(executionPayload);
        }
        completedStepKeys.add(slot.stepKey);
        persistedThisRound.add(slot.stepKey);
    }

    const roundComplete = allGroupRoundSlotsAccountedFor(
        slots,
        persistedThisRound,
        skippedInvalid,
        completedStepKeys,
        touchedKeys
    );

    return { lastResult, roundComplete };
}

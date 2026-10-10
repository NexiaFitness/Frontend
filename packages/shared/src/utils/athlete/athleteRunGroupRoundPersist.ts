/**
 * athleteRunGroupRoundPersist.ts — Qué slots persistir en ronda guiada (H2 S4/S5).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import type { AthleteRunRoundSlot } from "./buildAthleteRunSteps";
import {
    isRunLoggerSlotConfirmValid,
    resolveInitialSlotWeight,
    type RunLoggerSlotLogShape,
} from "./runLoggerHydrationPolicy";

export interface GroupRoundSlotLog extends RunLoggerSlotLogShape {}

export function buildDefaultSlotLog(slot: AthleteRunRoundSlot): GroupRoundSlotLog {
    return {
        weight: resolveInitialSlotWeight(slot.defaultWeight),
        reps: slot.defaultReps,
        durationSeconds: slot.defaultReps,
    };
}

/** S5: omitir solo si ya se guardó y el atleta no editó ese slot. */
export function shouldSkipSlotOnGroupRoundSave(
    slotStepKey: string,
    completedStepKeys: ReadonlySet<string>,
    touchedKeys: ReadonlySet<string>
): boolean {
    if (!completedStepKeys.has(slotStepKey)) {
        return false;
    }
    return !touchedKeys.has(slotStepKey);
}

/** S4: no saltar por peso null si reps_only/duration son válidos. */
export function isSlotReadyToPersist(
    log: GroupRoundSlotLog,
    inputMode: string | undefined
): boolean {
    return isRunLoggerSlotConfirmValid(log, inputMode ?? "weight_reps");
}

export function allGroupRoundSlotsAccountedFor(
    slots: readonly AthleteRunRoundSlot[],
    persistedThisRound: ReadonlySet<string>,
    skippedInvalid: ReadonlySet<string>,
    completedStepKeys: ReadonlySet<string>,
    touchedKeys: ReadonlySet<string>
): boolean {
    return slots.every((slot) => {
        if (persistedThisRound.has(slot.stepKey)) return true;
        if (skippedInvalid.has(slot.stepKey)) return true;
        return shouldSkipSlotOnGroupRoundSave(
            slot.stepKey,
            completedStepKeys,
            touchedKeys
        );
    });
}

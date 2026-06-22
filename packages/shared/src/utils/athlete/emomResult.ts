/**
 * emomResult.ts — Planificación, etiquetas y guardado de bloques EMOM continuos (V05).
 */

import type { AthleteEmomInterval, AthleteRunRoundSlot } from "./buildAthleteRunSteps";

export function formatEmomMinuteLabel(
    intervalSeconds: number | null | undefined,
    minuteIndex: number,
    minuteTotal: number
): string {
    const unit = intervalSeconds === 60 ? "Minuto" : "Intervalo";
    const plural = minuteTotal === 1 ? unit : `${unit}s`;
    return `${plural} ${minuteIndex} de ${minuteTotal}`;
}

export function buildInitialEmomOverrides(
    intervals: readonly AthleteEmomInterval[]
): Record<string, Record<string, number>> {
    const overrides: Record<string, Record<string, number>> = {};
    for (const interval of intervals) {
        overrides[interval.intervalKey] = Object.fromEntries(
            interval.slots.map((slot) => [slot.stepKey, slot.defaultReps])
        );
    }
    return overrides;
}

export function resolveEmomSlotReps(
    slot: AthleteRunRoundSlot,
    asPlanned: boolean,
    overrides: Record<string, Record<string, number>>,
    intervalKey: string
): number {
    if (asPlanned) return slot.defaultReps;
    const value = overrides[intervalKey]?.[slot.stepKey];
    if (value == null) return slot.defaultReps;
    return Math.max(0, Math.min(slot.defaultReps, value));
}

/** Notación compacta para entrenador (p. ej. «4/4» o «3/4»). */
export function formatEmomCompletionNotation(
    intervals: readonly AthleteEmomInterval[],
    asPlanned: boolean,
    overrides: Record<string, Record<string, number>>
): string {
    if (asPlanned) return `${intervals.length}/${intervals.length}`;
    let met = 0;
    for (const interval of intervals) {
        const allMet = interval.slots.every(
            (slot) => resolveEmomSlotReps(slot, false, overrides, interval.intervalKey) >= slot.defaultReps
        );
        if (allMet) met += 1;
    }
    return `${met}/${intervals.length}`;
}

export function buildEmomSavePayloads(input: {
    intervals: readonly AthleteEmomInterval[];
    asPlanned: boolean;
    overrides: Record<string, Record<string, number>>;
    roundRpe: number | null;
}): Array<{
    blockExerciseId: number;
    intervalKey: string;
    loggedSets: number;
    data: {
        actual_weight: number;
        actual_reps: string;
        actual_effort_value?: number;
        notes?: string;
    };
}> {
    const payloads: Array<{
        blockExerciseId: number;
        intervalKey: string;
        loggedSets: number;
        data: {
            actual_weight: number;
            actual_reps: string;
            actual_effort_value?: number;
            notes?: string;
        };
    }> = [];

    const scoreNote = formatEmomCompletionNotation(
        input.intervals,
        input.asPlanned,
        input.overrides
    );
    let wroteNote = false;

    for (const interval of input.intervals) {
        for (const slot of interval.slots) {
            const reps = resolveEmomSlotReps(
                slot,
                input.asPlanned,
                input.overrides,
                interval.intervalKey
            );

            payloads.push({
                blockExerciseId: slot.blockExerciseId,
                intervalKey: interval.intervalKey,
                loggedSets: slot.loggedSets,
                data: {
                    actual_weight: slot.defaultWeight,
                    actual_reps: String(reps),
                    ...(!wroteNote ? { notes: scoreNote } : {}),
                },
            });
            wroteNote = true;
        }
    }

    const last = payloads[payloads.length - 1];
    if (last && input.roundRpe != null) {
        last.data.actual_effort_value = input.roundRpe;
    }

    return payloads;
}

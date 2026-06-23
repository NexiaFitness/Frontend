/**
 * emomResult.ts — Planificación, etiquetas y guardado de bloques EMOM continuos (V05).
 */

import type { AthleteEmomInterval, AthleteRunRoundSlot } from "./buildAthleteRunSteps";

/** Reps por ejercicio en un fallo (plantilla del intervalo de referencia). */
export type EmomFailureEntry = Record<string, number>;

/** Etiqueta atleta: intervalo + duración (sin asumir 60 s). */
export function formatEmomIntervalLabel(
    intervalSeconds: number | null | undefined,
    intervalIndex: number,
    intervalTotal: number
): string {
    const unit = intervalTotal === 1 ? "Intervalo" : "Intervalos";
    const duration =
        intervalSeconds != null && intervalSeconds > 0 ? ` · ${intervalSeconds} s` : "";
    return `${unit} ${intervalIndex} de ${intervalTotal}${duration}`;
}

export function getEmomTemplateSlots(
    intervals: readonly AthleteEmomInterval[]
): AthleteRunRoundSlot[] {
    return intervals[0]?.slots ?? [];
}

export function buildEmomFailureEntryDefaults(
    templateSlots: readonly AthleteRunRoundSlot[]
): EmomFailureEntry {
    return Object.fromEntries(templateSlots.map((slot) => [slot.stepKey, 0]));
}

export function resizeEmomFailureEntries(
    previous: readonly EmomFailureEntry[],
    nextCount: number,
    templateSlots: readonly AthleteRunRoundSlot[]
): EmomFailureEntry[] {
    const clamped = Math.max(0, nextCount);
    if (previous.length === clamped) return [...previous];
    if (previous.length < clamped) {
        const empty = buildEmomFailureEntryDefaults(templateSlots);
        return [
            ...previous,
            ...Array.from({ length: clamped - previous.length }, () => ({ ...empty })),
        ];
    }
    return previous.slice(0, clamped);
}

/**
 * Mapea N fallos a los últimos N intervalos del bloque.
 * El entrenador usa el score agregado (cuántos), no el minuto concreto.
 */
export function buildEmomOverridesFromFailures(input: {
    intervals: readonly AthleteEmomInterval[];
    failedCount: number;
    failureEntries: readonly EmomFailureEntry[];
    templateSlots: readonly AthleteRunRoundSlot[];
}): Record<string, Record<string, number>> {
    const overrides: Record<string, Record<string, number>> = {};
    const total = input.intervals.length;
    const successCount = Math.max(0, total - input.failedCount);

    for (let failureIndex = 0; failureIndex < input.failedCount; failureIndex += 1) {
        const interval = input.intervals[successCount + failureIndex];
        if (!interval) continue;

        const entry = input.failureEntries[failureIndex] ?? {};
        overrides[interval.intervalKey] = {};

        interval.slots.forEach((slot, slotIndex) => {
            const templateSlot = input.templateSlots[slotIndex];
            const reps = templateSlot ? entry[templateSlot.stepKey] : undefined;
            overrides[interval.intervalKey][slot.stepKey] = Math.max(
                0,
                Math.min(slot.defaultReps, reps ?? 0)
            );
        });
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

/** Notación compacta para entrenador (p. ej. «4/4» o «2/4»). */
export function formatEmomCompletionNotation(
    intervals: readonly AthleteEmomInterval[],
    asPlanned: boolean,
    failedCount?: number
): string {
    if (asPlanned) return `${intervals.length}/${intervals.length}`;
    if (failedCount != null && failedCount >= 0) {
        return `${Math.max(0, intervals.length - failedCount)}/${intervals.length}`;
    }
    return `0/${intervals.length}`;
}

export function isEmomCompletionValid(input: {
    asPlanned: boolean | null;
    failedCount: number;
    failureEntries: readonly EmomFailureEntry[];
    intervals: readonly AthleteEmomInterval[];
    templateSlots: readonly AthleteRunRoundSlot[];
}): boolean {
    if (input.asPlanned === null) return false;
    if (input.asPlanned) return true;

    const total = input.intervals.length;
    if (total === 0 || input.templateSlots.length === 0) return false;
    if (input.failedCount < 1 || input.failedCount > total) return false;
    if (input.failureEntries.length !== input.failedCount) return false;

    return input.failureEntries.every((entry) =>
        input.templateSlots.every(
            (slot) => entry[slot.stepKey] != null && entry[slot.stepKey] >= 0
        )
    );
}

export function buildEmomSavePayloads(input: {
    intervals: readonly AthleteEmomInterval[];
    asPlanned: boolean;
    failedCount: number;
    failureEntries: readonly EmomFailureEntry[];
    templateSlots: readonly AthleteRunRoundSlot[];
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
    const overrides = input.asPlanned
        ? {}
        : buildEmomOverridesFromFailures({
              intervals: input.intervals,
              failedCount: input.failedCount,
              failureEntries: input.failureEntries,
              templateSlots: input.templateSlots,
          });

    const scoreNote = formatEmomCompletionNotation(
        input.intervals,
        input.asPlanned,
        input.asPlanned ? undefined : input.failedCount
    );

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

    let wroteNote = false;

    for (const interval of input.intervals) {
        for (const slot of interval.slots) {
            const reps = resolveEmomSlotReps(
                slot,
                input.asPlanned,
                overrides,
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

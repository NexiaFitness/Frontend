/**
 * amrapResult.ts — Cálculo y formato de resultado AMRAP (rondas + parcial secuencial).
 */

export interface AmrapPartialSlot {
    stepKey: string;
    maxReps: number;
}

export function computeAmrapExerciseTotalReps(
    fullRounds: number,
    plannedRepsPerRound: number,
    partialRepsInIncompleteRound: number
): number {
    const rounds = Math.max(0, fullRounds);
    const planned = Math.max(0, plannedRepsPerRound);
    const partial = Math.max(0, partialRepsInIncompleteRound);
    return rounds * planned + partial;
}

export function computeAmrapPartialTotal(partialReps: readonly number[]): number {
    return partialReps.reduce((sum, value) => sum + Math.max(0, value), 0);
}

/** Notación compacta para entrenador (p. ej. «5+19»). */
export function formatAmrapScoreNotation(
    fullRounds: number,
    partialTotal: number
): string {
    const rounds = Math.max(0, fullRounds);
    const partial = Math.max(0, partialTotal);
    if (partial > 0) return `${rounds}+${partial}`;
    return String(rounds);
}

/** Resumen legible para el atleta antes de guardar. */
export function formatAmrapResultSummary(
    fullRounds: number,
    partialTotal: number
): string {
    const rounds = Math.max(0, fullRounds);
    const partial = Math.max(0, partialTotal);
    if (rounds <= 0 && partial <= 0) return "Sin rondas registradas";
    if (partial > 0) {
        return rounds > 0
            ? `${rounds} ${rounds === 1 ? "ronda" : "rondas"} + ${partial} reps`
            : `${partial} reps en ronda incompleta`;
    }
    return `${rounds} ${rounds === 1 ? "ronda completa" : "rondas completas"}`;
}

export function buildInitialAmrapPartial(
    slots: readonly AmrapPartialSlot[]
): Record<string, number> {
    return Object.fromEntries(slots.map((slot) => [slot.stepKey, 0]));
}

export function hasAmrapPartialProgress(partial: Record<string, number>): boolean {
    return Object.values(partial).some((value) => value > 0);
}

/**
 * Mantiene el orden de la secuencia: si hay progreso en un slot,
 * los anteriores deben estar completos y los posteriores en cero si el actual es parcial.
 */
export function applyAmrapPartialChange(
    current: Record<string, number>,
    slots: readonly AmrapPartialSlot[],
    changedStepKey: string,
    nextValue: number
): Record<string, number> {
    const index = slots.findIndex((slot) => slot.stepKey === changedStepKey);
    if (index < 0) return current;

    const maxReps = slots[index].maxReps;
    const clamped = Math.max(0, Math.min(maxReps, nextValue));
    const next: Record<string, number> = { ...current, [changedStepKey]: clamped };

    const previousValue = current[changedStepKey] ?? 0;

    if (clamped < previousValue) {
        for (let i = index + 1; i < slots.length; i++) {
            next[slots[i].stepKey] = 0;
        }
    }

    if (clamped > 0) {
        for (let i = 0; i < index; i++) {
            next[slots[i].stepKey] = slots[i].maxReps;
        }
    }

    if (clamped > 0 && clamped < maxReps) {
        for (let i = index + 1; i < slots.length; i++) {
            next[slots[i].stepKey] = 0;
        }
    }

    return next;
}

export function buildAmrapSavePayloads(input: {
    fullRounds: number;
    slots: ReadonlyArray<{
        stepKey: string;
        blockExerciseId: number;
        plannedRepsPerRound: number;
        defaultWeight: number;
        loggedSets: number;
    }>;
    partialReps: Record<string, number>;
    roundRpe: number | null;
    getNextActualSets: (blockExerciseId: number, loggedSets: number) => number;
}): Array<{
    blockExerciseId: number;
    data: {
        actual_weight: number;
        actual_reps: string;
        actual_sets: number;
        actual_effort_value?: number;
        notes?: string;
    };
}> {
    const partialValues = input.slots.map(
        (slot) => input.partialReps[slot.stepKey] ?? 0
    );
    const partialTotal = computeAmrapPartialTotal(partialValues);
    const scoreNote = formatAmrapScoreNotation(input.fullRounds, partialTotal);

    return input.slots.map((slot, index) => {
        const partial = input.partialReps[slot.stepKey] ?? 0;
        const totalReps = computeAmrapExerciseTotalReps(
            input.fullRounds,
            slot.plannedRepsPerRound,
            partial
        );

        return {
            blockExerciseId: slot.blockExerciseId,
            data: {
                actual_weight: slot.defaultWeight,
                actual_reps: String(totalReps),
                actual_sets: input.getNextActualSets(
                    slot.blockExerciseId,
                    slot.loggedSets
                ),
                ...(input.roundRpe != null
                    ? { actual_effort_value: input.roundRpe }
                    : {}),
                ...(index === 0 ? { notes: scoreNote } : {}),
            },
        };
    });
}

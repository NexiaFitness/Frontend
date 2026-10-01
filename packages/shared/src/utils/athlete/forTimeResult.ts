/**
 * forTimeResult.ts — Etiquetas, splits y guardado de bloques FOR TIME continuos (V05).
 */

import type { AthleteForTimeRound } from "./buildAthleteRunSteps";

export interface ForTimeSplitView {
    roundIndex: number;
    cumulativeSeconds: number;
    segmentSeconds: number;
}

/** mm:ss — tiempo legible para atleta y entrenador. */
export function formatForTimeDuration(totalSeconds: number): string {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatForTimeRoundLabel(roundIndex: number, roundTotal: number): string {
    const unit = roundTotal === 1 ? "Ronda" : "Rondas";
    return `${unit} ${roundIndex} de ${roundTotal}`;
}

export function formatForTimeSegmentDelta(segmentSeconds: number): string {
    return `+${formatForTimeDuration(segmentSeconds)}`;
}

export function buildForTimeSplitViews(
    cumulativeSplits: readonly number[]
): ForTimeSplitView[] {
    return cumulativeSplits.map((cumulative, index) => ({
        roundIndex: index + 1,
        cumulativeSeconds: cumulative,
        segmentSeconds:
            index === 0 ? cumulative : cumulative - (cumulativeSplits[index - 1] ?? 0),
    }));
}

/** Nota compacta post-sesión: total; splits solo si se registraron. */
export function formatForTimeCompletionNote(
    totalSeconds: number,
    cumulativeSplits?: readonly number[]
): string {
    const total = formatForTimeDuration(totalSeconds);
    const splits = cumulativeSplits ?? [];
    if (splits.length <= 1) return total;
    const splitLabels = splits.map(formatForTimeDuration).join(" · ");
    return `${total} (${splitLabels})`;
}

/** B4: basta tiempo total > 0 (splits opcionales). */
export function isForTimeCompletionValid(totalSeconds: number): boolean {
    return totalSeconds > 0;
}

export function parseForTimeMmSs(value: string): number | null {
    const trimmed = value.trim();
    const match = /^(\d+):(\d{1,2})$/.exec(trimmed);
    if (!match) return null;
    const mins = Number.parseInt(match[1] ?? "0", 10);
    const secs = Number.parseInt(match[2] ?? "0", 10);
    if (Number.isNaN(mins) || Number.isNaN(secs) || secs >= 60) return null;
    return mins * 60 + secs;
}

export function clampForTimeTotalSeconds(seconds: number): number {
    return Math.max(0, Math.floor(seconds));
}

export function buildForTimeSavePayloads(input: {
    rounds: readonly AthleteForTimeRound[];
    cumulativeSplits?: readonly number[];
    totalSeconds: number;
    roundRpe: number | null;
    getNextActualSets: (blockExerciseId: number, loggedSets?: number) => number;
}): Array<{
    blockExerciseId: number;
    roundKey: string;
    loggedSets: number;
    data: {
        actual_weight: number;
        actual_reps: string;
        actual_sets: number;
        actual_effort_value?: number;
        actual_duration?: number;
        notes?: string;
    };
}> {
    const splits = input.cumulativeSplits ?? [];
    const note = formatForTimeCompletionNote(input.totalSeconds, splits);
    const payloads: Array<{
        blockExerciseId: number;
        roundKey: string;
        loggedSets: number;
        data: {
            actual_weight: number;
            actual_reps: string;
            actual_sets: number;
            actual_effort_value?: number;
            actual_duration?: number;
            notes?: string;
        };
    }> = [];

    let wroteMeta = false;

    for (const round of input.rounds) {
        for (const slot of round.slots) {
            const nextSets = input.getNextActualSets(slot.blockExerciseId, slot.loggedSets);
            payloads.push({
                blockExerciseId: slot.blockExerciseId,
                roundKey: round.roundKey,
                loggedSets: slot.loggedSets,
                data: {
                    actual_weight: slot.defaultWeight,
                    actual_reps: String(slot.defaultReps),
                    actual_sets: nextSets,
                    ...(!wroteMeta
                        ? {
                              notes: note,
                              actual_duration: input.totalSeconds,
                          }
                        : {}),
                },
            });
            wroteMeta = true;
        }
    }

    const last = payloads[payloads.length - 1];
    if (last && input.roundRpe != null) {
        last.data.actual_effort_value = input.roundRpe;
    }

    return payloads;
}

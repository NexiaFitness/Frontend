/**
 * detailFormatters.ts — Funciones de formato compartidas para la vista read-only.
 *
 * Extraídas de DetailSeriesTable para evitar warnings de react-refresh
 * al exportar funciones no-componentes desde archivos de componentes.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import type { SessionExerciseSetView } from "@nexia/shared";
import { displayAmrapPlannedReps } from "@nexia/shared";

export function formatReps(setRow: SessionExerciseSetView): string | null {
    const reps = displayAmrapPlannedReps(setRow.plannedReps);
    if (reps) return reps;
    if (setRow.plannedDuration != null) return `${setRow.plannedDuration}s`;
    return null;
}

export function formatEffort(
    character: SessionExerciseSetView["effortCharacter"],
    value: number | null
): string | null {
    if (value == null) return character ? character.toUpperCase() : null;
    if (!character) return String(value);
    switch (character) {
        case "rpe":
            return `RPE ${value}`;
        case "rir":
            return `RIR ${value}`;
        case "velocity_loss":
            return `VL ${value}%`;
        case "pct_rm":
            return `${value}% 1RM`;
        default:
            return `${value}`;
    }
}

export function formatRest(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds <= 0) return "0s";
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

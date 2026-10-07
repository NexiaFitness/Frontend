/**
 * nexiaProgressPresentation.ts — Barras % premium (canónico plataforma + atleta).
 *
 * Implementación única: athleteProgressPresentation.ts (F3b).
 * Entrenador/admin importan desde aquí o desde NexiaProgressBar.
 *
 * Doc: DESIGN_PREMIUM.md §4.2 · F3b §BARRAS DE PROGRESO
 */

import type { AthleteProgressTone } from "@/components/athlete/athleteProgressPresentation";

export {
    ATHLETE_PROGRESS_TRACK_SHELL,
    ATHLETE_PROGRESS_TRACK,
    ATHLETE_PROGRESS_FILL,
    type AthleteProgressTone as NexiaProgressTone,
} from "@/components/athlete/athleteProgressPresentation";

/** Volumen → primary; intensidad → warning (semántica F3b). */
export function nexiaProgressToneFromBlockLevel(tone: "volume" | "intensity"): AthleteProgressTone {
    return tone === "volume" ? "primary" : "warning";
}

/** Volumen muscular semanal (constructor / revisión sesión). */
export function nexiaProgressToneFromMuscleVolumeStatus(
    status: "deficit" | "on_target" | "excess" | "no_target",
): AthleteProgressTone {
    switch (status) {
        case "on_target":
            return "success";
        case "deficit":
            return "warning";
        case "excess":
            return "destructive";
        default:
            return "primary";
    }
}

/** Desviación % vs planificado (validación sesión). */
export function nexiaProgressToneFromDeviationPercent(percent: number): AthleteProgressTone {
    const abs = Math.abs(percent);
    if (abs <= 15) return "success";
    if (abs <= 30) return "warning";
    return "destructive";
}

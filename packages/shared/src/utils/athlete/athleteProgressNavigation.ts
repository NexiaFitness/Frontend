/**
 * athleteProgressNavigation.ts — Rutas y estado de navegación V10/V11.
 * Contexto: Progreso abre V04 para sesiones y V11 para ejercicio.
 * Notas: volver usa `from` del location state o Home; no history.back.
 * @author Frontend Team
 * @since v6.1.0
 */

import { normalizeTrackingDateKey } from "./athleteProgressUtils";

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

/** Destino de Volver: `state.from` interno o `/dashboard`. */
export function athleteProgressBackPath(locationState: unknown): string {
    if (!isRecord(locationState)) return "/dashboard";
    const from = locationState.from;
    if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
        return from;
    }
    return "/dashboard";
}

export type AthleteExerciseProgressEntry = "progress" | "record";

export interface AthleteExerciseProgressLocationState {
    exerciseName?: string;
    highlightDate?: string;
    entry?: AthleteExerciseProgressEntry;
}

export function athleteExerciseProgressPath(
    exerciseId: number,
    state?: AthleteExerciseProgressLocationState
): { pathname: string; search?: string; state?: AthleteExerciseProgressLocationState } {
    const params = new URLSearchParams();
    if (state?.highlightDate) {
        params.set("highlight", normalizeTrackingDateKey(state.highlightDate));
    }
    if (state?.entry === "record") {
        params.set("from", "record");
    }
    const search = params.toString();

    return {
        pathname: `/dashboard/progress/exercise/${exerciseId}`,
        ...(search ? { search: `?${search}` } : {}),
        state,
    };
}

/** Sesión completada: preview con cargas (no celebración summary). */
export function athleteCompletedSessionPath(sessionId: number): string {
    return `/dashboard/sessions/${sessionId}`;
}

/**
 * athleteProgressNavigation.ts — Rutas y estado de navegación V10/V11.
 */

import { normalizeTrackingDateKey } from "./athleteProgressUtils";

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

/**
 * trainerHomeLiveQuery.ts — frescura de hechos en vivo en /dashboard del entrenador.
 *
 * Actividad reciente ya sondeaba; Hoy (check-in) era un GET de un disparo.
 * B-27: el lote wellbeing-check-ins devolvía 200 con datos y el chip seguía
 * «Sin check-in» porque RTK conservaba el lote vacío del montaje.
 */

export const TRAINER_HOME_POLL_MS = 60_000;

export const trainerHomeLiveQueryOptions = {
    pollingInterval: TRAINER_HOME_POLL_MS,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
} as const;

export function buildTodayWellbeingQueryOptions(sessionIds: readonly number[]): {
    skip: boolean;
    pollingInterval: number;
    refetchOnFocus: true;
    refetchOnMountOrArgChange: true;
} {
    return {
        skip: sessionIds.length === 0,
        ...trainerHomeLiveQueryOptions,
    };
}

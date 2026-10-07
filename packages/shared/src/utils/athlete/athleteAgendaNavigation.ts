/**
 * athleteAgendaNavigation.ts — Destino al abrir sesión (agenda, lista, Home).
 * Paridad FE-9: exploración → V04; registro tardío → ?mode=log. V06 no es entrada de exploración.
 */

import type { AthleteRunSessionRegistrationMetaRow } from "../../types/athleteRunProgress";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    resolveAthleteSessionListRegistrationCue,
    shouldOpenSessionInLogMode,
} from "./athleteSessionRegistrationPolicy";

export const ATHLETE_SESSION_NAV_FROM_AGENDA = "agenda" as const;

export type AthleteSessionNavFrom = typeof ATHLETE_SESSION_NAV_FROM_AGENDA;

/** Ruta al tocar una sesión (lista, agenda, hero preview/log). */
export function resolveAthleteSessionOpenPath(
    session: TrainingSession,
    registrationMeta?: AthleteRunSessionRegistrationMetaRow
): string {
    const cue = resolveAthleteSessionListRegistrationCue(session, registrationMeta);
    if (shouldOpenSessionInLogMode(cue)) {
        return `/dashboard/sessions/${session.id}?mode=log`;
    }
    return `/dashboard/sessions/${session.id}`;
}

/** @deprecated Alias — usar resolveAthleteSessionOpenPath */
export function resolveAthleteAgendaSessionPath(
    session: TrainingSession,
    registrationMeta?: AthleteRunSessionRegistrationMetaRow
): string {
    return resolveAthleteSessionOpenPath(session, registrationMeta);
}

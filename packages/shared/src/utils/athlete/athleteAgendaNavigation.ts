/**
 * athleteAgendaNavigation.ts — Destino al tocar entreno en agenda (paridad lista sesiones).
 */

import type { AthleteRunSessionRegistrationMetaRow } from "../../types/athleteRunProgress";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    resolveAthleteSessionListRegistrationCue,
    shouldOpenSessionInLogMode,
} from "./athleteSessionRegistrationPolicy";

export function resolveAthleteAgendaSessionPath(
    session: TrainingSession,
    registrationMeta?: AthleteRunSessionRegistrationMetaRow
): string {
    if (session.status === "completed") {
        return `/dashboard/sessions/${session.id}/summary`;
    }
    const cue = resolveAthleteSessionListRegistrationCue(session, registrationMeta);
    if (shouldOpenSessionInLogMode(cue)) {
        return `/dashboard/sessions/${session.id}?mode=log`;
    }
    return `/dashboard/sessions/${session.id}`;
}

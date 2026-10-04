/**
 * FE-9 / D5 — Registration edit window (paridad backend athlete_session_registration.py).
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type { AthleteRunSessionRegistrationMetaRow } from "../../types/athleteRunProgress";
import { parseSessionDateLocal, toLocalDateKey } from "./athleteSessionUtils";

export const ATHLETE_REGISTRATION_EDIT_DAYS = 7;

export function daysAfterSessionDate(sessionDate: string, today = new Date()): number {
    const sessionDay = parseSessionDateLocal(sessionDate);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    sessionDay.setHours(0, 0, 0, 0);
    return Math.round((todayStart.getTime() - sessionDay.getTime()) / (24 * 60 * 60 * 1000));
}

export function isAthleteSessionRegistrationEditable(
    sessionDate: string | null | undefined,
    today = new Date()
): boolean {
    if (!sessionDate) return true;
    return daysAfterSessionDate(sessionDate, today) <= ATHLETE_REGISTRATION_EDIT_DAYS;
}

export function isPastSessionDate(
    sessionDate: string | null | undefined,
    today = new Date()
): boolean {
    if (!sessionDate) return false;
    return daysAfterSessionDate(sessionDate, today) > 0;
}

export type AthleteSessionListRegistrationCue =
    | "none"
    | "register_now"
    | "complete_registration"
    | "registration_closed";

export function resolveAthleteSessionListRegistrationCue(
    session: TrainingSession,
    meta: AthleteRunSessionRegistrationMetaRow | undefined,
    today = new Date()
): AthleteSessionListRegistrationCue {
    if (session.status === "completed" || session.status === "skipped") {
        return "none";
    }

    const editable =
        meta?.registration_editable ??
        isAthleteSessionRegistrationEditable(session.session_date, today);

    if (!editable) {
        return isPastSessionDate(session.session_date, today)
            ? "registration_closed"
            : "none";
    }

    if (!isPastSessionDate(session.session_date, today)) {
        return "none";
    }

    const registered = meta?.registered_count ?? 0;
    const pending = meta?.pending_count ?? 0;

    if (registered === 0 && pending > 0) {
        return "register_now";
    }
    if (registered > 0 && pending > 0) {
        return "complete_registration";
    }
    return "none";
}

export function athleteSessionListRegistrationLabel(
    cue: AthleteSessionListRegistrationCue
): string | null {
    switch (cue) {
        case "register_now":
            return "Sin registrar · Registrar ahora";
        case "complete_registration":
            return "Completar registro";
        case "registration_closed":
            return "Plazo de registro cerrado";
        default:
            return null;
    }
}

export function shouldOpenSessionInLogMode(cue: AthleteSessionListRegistrationCue): boolean {
    return cue === "register_now" || cue === "complete_registration";
}

/**
 * sessionPrescriptionLock.ts — B-33: hide prescription edit when the athlete already executed.
 *
 * Contexto: espejo del predicado backend `session_prescription_is_locked`.
 * No copia isSessionDeletable: cancelled/skipped/modified sin actual_* ni
 * hasExecutions siguen editables. Completada / en curso / actual_* / series
 * bloquean. El listado puede no traer has_executions; el 409 del servidor cubre
 * planned + registros.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

const EXECUTION_STATUSES = new Set(["completed", "finished", "in_progress"]);

export interface SessionPrescriptionLockInput {
    status: string;
    actual_duration?: number | null;
    actual_volume?: number | null;
    actual_intensity?: number | null;
    hasExecutions?: boolean;
}

export function isSessionPrescriptionLocked(
    session: SessionPrescriptionLockInput,
): boolean {
    const status = (session.status ?? "").trim().toLowerCase();
    if (EXECUTION_STATUSES.has(status)) {
        return true;
    }
    if (session.actual_duration != null) {
        return true;
    }
    if (session.actual_volume != null) {
        return true;
    }
    if (session.actual_intensity != null) {
        return true;
    }
    return session.hasExecutions === true;
}

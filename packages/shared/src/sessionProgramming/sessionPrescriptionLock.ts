/**
 * sessionPrescriptionLock.ts — B-33: hide prescription edit when the athlete already executed.
 *
 * Contexto: espejo del predicado backend `session_prescription_is_locked`.
 * No copia isSessionDeletable: cancelled/skipped/modified sin actual_* ni
 * registros siguen editables. Completada / en curso / actual_* / registros del
 * atleta bloquean. hasAthleteRecords sale de execution-summary
 * `has_athlete_records`, nunca de `has_executions` ni de las filas pending del
 * resumen (son la prescripción pintada, no ejecución). El listado no trae el
 * resumen; el 409 del servidor cubre planned + registros.
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
    hasAthleteRecords?: boolean;
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
    return session.hasAthleteRecords === true;
}

export interface StandaloneExerciseExecutionFields {
    actual_sets?: number | null;
    actual_reps?: number | null;
    actual_weight?: number | null;
    actual_duration?: number | null;
    actual_distance?: number | null;
    actual_rest?: number | null;
}

export function standaloneExercisesHaveExecutions(
    exercises: StandaloneExerciseExecutionFields[] | undefined,
): boolean {
    if (!exercises?.length) {
        return false;
    }
    return exercises.some(
        (line) =>
            line.actual_sets != null ||
            line.actual_reps != null ||
            line.actual_weight != null ||
            line.actual_duration != null ||
            line.actual_distance != null ||
            line.actual_rest != null,
    );
}

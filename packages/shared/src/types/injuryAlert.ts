/**
 * injuryAlert.ts — Contrato POST /injuries/check-alert (OpenAPI verificado).
 */

import type { ExerciseSafetyStatus, ExerciseUnverifiableReason } from "./engineSafety";
import type { InjuryWithDetails } from "./injuries";

/** Valores emitidos por BE: pain_level < 4 → warning; ≥ 4 → danger */
export type InjuryAlertSeverity = "warning" | "danger";

export interface InjuryAlertCheck {
    client_id: number;
    exercise_id: number;
}

export interface InjuryAlert {
    has_conflict: boolean;
    /** H4: not_verifiable = sin conflicto conocido, pero no se pudo comprobar. */
    status: ExerciseSafetyStatus;
    unverifiable_reason?: ExerciseUnverifiableReason | null;
    severity?: InjuryAlertSeverity | null;
    message?: string | null;
    injury_details?: InjuryWithDetails | null;
    conflicting_movement?: string | null;
    /** Presente en schema; no usar en UI atleta (F3 §1b). */
    suggested_alternatives?: Record<string, unknown>[] | null;
}

export interface SessionExerciseRef {
    exerciseId: number;
    exerciseName: string;
}

export interface ExerciseInjuryConflict {
    exerciseId: number;
    exerciseName: string;
    alert: InjuryAlert;
}

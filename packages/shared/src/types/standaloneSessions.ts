/**
 * standaloneSessions.ts — Tipos para StandaloneSession (sesiones sin plan)
 *
 * Contexto:
 * - Alineado con backend app/schemas/sessions.py (StandaloneSessionCreate, StandaloneSessionOut, etc.)
 * - Usado cuando el cliente no tiene plan activo en la fecha seleccionada (P2)
 * - API: POST/GET /standalone-sessions, POST /standalone-sessions/{id}/exercises
 *
 * @author Frontend Team
 * @since P2 — Plan integración flujo planificación UX
 */

import type { TrainingSession } from "./training";

/** StandaloneSessionCreate — POST /standalone-sessions */
export interface StandaloneSessionCreate {
    trainer_id: number;
    client_id: number;
    session_date: string; // YYYY-MM-DD
    session_name: string;
    session_type: string;
    planned_duration?: number | null;
    actual_duration?: number | null;
    status?: string;
    notes?: string | null;
}

/** StandaloneSessionOut — Response de GET/POST/PUT */
export interface StandaloneSessionOut {
    id: number;
    trainer_id: number;
    client_id: number;
    session_date: string;
    session_name: string;
    session_type: string;
    planned_duration: number | null;
    actual_duration: number | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

/**
 * SessionListItem — Tipo union para listado unificado (TrainingSession + StandaloneSession)
 * Usado en ClientSessionsTab para merge de ambas fuentes.
 * Discriminador session_kind para distinguir en runtime.
 */
export type SessionListItem =
    | (TrainingSession & { session_kind: "training" })
    | (StandaloneSessionOut & { session_kind: "standalone" });

/** StandaloneSessionExerciseOut — Response de GET /standalone-sessions/{id}/exercises */
export interface StandaloneSessionExerciseOut {
    id: number;
    standalone_session_id: number;
    exercise_id: number;
    order_in_session: number;
    planned_sets: number | null;
    planned_reps: number | null;
    planned_weight: number | null;
    planned_duration: number | null;
    planned_distance: number | null;
    planned_rest: number | null;
    actual_sets: number | null;
    actual_reps: number | null;
    actual_weight: number | null;
    actual_duration: number | null;
    actual_distance: number | null;
    actual_rest: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

/** StandaloneSessionExerciseCreate — POST /standalone-sessions/{id}/exercises */
export interface StandaloneSessionExerciseCreate {
    standalone_session_id: number;
    exercise_id: number;
    order_in_session: number;
    planned_sets?: number | null;
    planned_reps?: number | null;
    planned_weight?: number | null;
    planned_duration?: number | null;
    planned_distance?: number | null;
    planned_rest?: number | null;
    actual_sets?: number | null;
    actual_reps?: number | null;
    actual_weight?: number | null;
    actual_duration?: number | null;
    actual_distance?: number | null;
    actual_rest?: number | null;
    notes?: string | null;
}

/**
 * Tipos para el listado unificado de sesiones (training + standalone).
 * Backend: GET /api/v1/sessions
 * VISTA_LISTADO_SESIONES Fase 1.
 */

/** Tipo de sesión para listado (enum backend) */
export type SessionListType = "strength" | "cardio" | "technique" | "assessment";

/** Estado de sesión para listado (enum backend) */
export type SessionListStatus = "planned" | "completed" | "cancelled";

/** Origen de la sesión */
export type SessionKind = "training" | "standalone";

/** Ítem de sesión unificado (training o standalone) */
export interface SessionOut {
    id: number;
    session_name: string;
    client_id: number;
    client_name: string;
    client_initials: string;
    session_date: string | null;
    session_time: string | null; // "HH:MM" o "HH:MM:SS"
    session_type: string;
    status: string;
    planned_duration: number | null;
    exercises_count: number;
    session_kind: SessionKind;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

/** Parámetros para GET /sessions */
export interface GetSessionsParams {
    trainerId: number;
    skip?: number;
    limit?: number;
    status?: string;
    sessionType?: string;
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string; // YYYY-MM-DD
    search?: string;
    orderBy?: "session_date" | "session_name";
    order?: "asc" | "desc";
}

/** Respuesta paginada del listado de sesiones */
export interface SessionListResponse {
    items: SessionOut[];
    total: number;
}

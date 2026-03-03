/**
 * scheduling.ts — Tipos para sistema de agendamiento de sesiones
 *
 * Contexto:
 * - Alineado 100% con backend schemas
 * - ScheduledSession, ConflictCheck, AvailableSlots
 * - Usado por página ScheduleSession
 *
 * Endpoints:
 * - POST /api/v1/scheduling/sessions
 * - GET /api/v1/scheduling/sessions
 * - POST /api/v1/scheduling/check-conflict
 * - POST /api/v1/scheduling/available-slots
 *
 * @author Frontend Team
 * @since v5.1.0
 */

// ========================================
// ENUMS
// ========================================

export const SCHEDULED_SESSION_TYPE = {
    TRAINING: "training",
    CONSULTATION: "consultation",
    ASSESSMENT: "assessment",
} as const;

export type ScheduledSessionType = (typeof SCHEDULED_SESSION_TYPE)[keyof typeof SCHEDULED_SESSION_TYPE];

export const SESSION_STATUS = {
    SCHEDULED: "scheduled",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const SESSION_LOCATION = {
    GYM: "gym",
    ONLINE: "online",
    CLIENT_HOME: "client_home",
    OTHER: "other",
} as const;

export type SessionLocation = (typeof SESSION_LOCATION)[keyof typeof SESSION_LOCATION];

// ========================================
// ENTITY TYPES
// ========================================

export interface ScheduledSession {
    id: number;
    trainer_id: number;
    client_id: number;
    scheduled_date: string; // ISO date
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    duration_minutes: number;
    session_type: ScheduledSessionType;
    status: SessionStatus;
    notes: string | null;
    location: string | null;
    meeting_link: string | null;
    reminder_sent: boolean;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface ScheduledSessionCreate {
    trainer_id: number;
    client_id: number;
    scheduled_date: string; // ISO date
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    duration_minutes: number;
    session_type: ScheduledSessionType;
    notes?: string | null;
    location?: string | null;
    meeting_link?: string | null;
}

export interface ScheduledSessionUpdate {
    scheduled_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    duration_minutes?: number | null;
    session_type?: ScheduledSessionType | null;
    status?: SessionStatus | null;
    notes?: string | null;
    location?: string | null;
    meeting_link?: string | null;
}

export interface ConflictCheckRequest {
    trainer_id: number;
    scheduled_date: string; // ISO date
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    exclude_session_id?: number | null;
}

export interface ConflictCheckResponse {
    has_conflict: boolean;
    conflicts: ScheduledSession[];
    available: boolean;
}

export interface AvailableSlotsRequest {
    trainer_id: number;
    date: string; // ISO date
}

export interface AvailableSlot {
    start_time: string; // HH:mm format
    end_time: string; // HH:mm format
    duration_minutes: number;
}

export interface AvailableSlotsResponse {
    date: string; // ISO date
    available_slots: AvailableSlot[];
}

// ========================================
// UI TYPES
// ========================================

/** Estado mostrado tras verificar disponibilidad (conflicto o disponible). */
export interface ConflictCheckState {
    hasConflict: boolean;
    message: string;
}

/** Errores de validación por campo (nombre de campo → mensaje). */
export type FormFieldErrors = Record<string, string>;

export interface ScheduleSessionFormData {
    trainerId: number;
    clientId: number;
    scheduledDate: string; // ISO date
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    durationMinutes: number;
    sessionType: ScheduledSessionType;
    notes?: string | null;
    location?: string | null;
    meetingLink?: string | null;
}

export interface ScheduledSessionsFilters {
    trainer_id?: number | null;
    client_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    skip?: number;
    limit?: number;
}

// ========================================
// TRAINER AVAILABILITY (Backend: scheduling/availability)
// ========================================/** POST /scheduling/availability — Backend: TrainerAvailabilityCreate */
export interface TrainerAvailabilityCreate {
    trainer_id: number;
    day_of_week: number; // 0=Monday, ..., 6=Sunday
    start_time: string; // HH:mm
    end_time: string; // HH:mm
    is_recurring: boolean;
    specific_date?: string | null; // ISO date when not recurring
}

/** PUT /scheduling/availability/{id} — Backend: TrainerAvailabilityUpdate */
export interface TrainerAvailabilityUpdate {
    day_of_week?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    is_recurring?: boolean | null;
    specific_date?: string | null;
    is_active?: boolean | null;
}/** Response: TrainerAvailabilityOut */
export interface TrainerAvailabilityOut {
    id: number;
    trainer_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    specific_date: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}/** Query params for GET /scheduling/availability */
export interface TrainerAvailabilityFilters {
    trainer_id: number;
    skip?: number;
    limit?: number;
}

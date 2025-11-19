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


/**
 * calendar.ts — Global calendar events (AG-0 / AG-2).
 * Contrato: GET /api/v1/calendar/events (OpenAPI dev).
 */

export type CalendarEventKind = "personal_workout" | "appointment" | "group_class";

export interface CalendarEvent {
    id: number;
    trainer_id: number;
    client_id: number | null;
    event_kind: CalendarEventKind;
    starts_at: string;
    ends_at: string | null;
    has_explicit_time: boolean;
    status: string;
    title: string | null;
    location: string | null;
    meeting_link: string | null;
    notes: string | null;
    metadata: Record<string, unknown> | null;
    timezone: string;
    training_session_id: number | null;
    scheduled_session_id: number | null;
    migration_source: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CalendarEventListResponse {
    items: CalendarEvent[];
    total: number;
}

export interface CalendarEventsQueryArgs {
    clientId?: number;
    trainerId?: number;
    from?: string;
    to?: string;
    eventKind?: CalendarEventKind;
    skip?: number;
    limit?: number;
}

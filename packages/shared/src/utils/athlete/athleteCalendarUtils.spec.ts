import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../types/calendar";
import {
    calendarEventDateKeyMadrid,
    filterHomeTodayAppointments,
    formatCalendarEventClockMadrid,
    normalizeSessionTimeForApi,
} from "./athleteCalendarUtils";

function baseEvent(partial: Partial<CalendarEvent>): CalendarEvent {
    return {
        id: 1,
        trainer_id: 1,
        client_id: 1,
        event_kind: "appointment",
        starts_at: "2026-10-27T08:00:00+01:00",
        ends_at: null,
        has_explicit_time: true,
        status: "scheduled",
        title: "Consultation",
        location: null,
        meeting_link: null,
        notes: null,
        metadata: null,
        timezone: "Europe/Madrid",
        training_session_id: null,
        scheduled_session_id: 1,
        migration_source: null,
        is_active: true,
        created_at: "",
        updated_at: "",
        ...partial,
    };
}

describe("athleteCalendarUtils Madrid", () => {
    it("formatea hora civil en Europe/Madrid", () => {
        expect(formatCalendarEventClockMadrid("2026-10-27T08:00:00+01:00", true)).toBe("08:00");
    });

    it("extrae date key en Madrid", () => {
        expect(calendarEventDateKeyMadrid("2026-10-27T08:00:00+01:00")).toBe("2026-10-27");
    });

    it("filtra citas de hoy sin entrenos personal_workout", () => {
        const today = new Date(2026, 9, 27);
        const items = filterHomeTodayAppointments(
            [
                baseEvent({ id: 1, event_kind: "appointment" }),
                baseEvent({
                    id: 2,
                    event_kind: "personal_workout",
                    training_session_id: 9,
                }),
            ],
            today
        );
        expect(items).toHaveLength(1);
        expect(items[0].event_kind).toBe("appointment");
    });
});

describe("normalizeSessionTimeForApi", () => {
    it("convierte HH:MM a HH:MM:SS", () => {
        expect(normalizeSessionTimeForApi("9:30")).toBe("09:30:00");
    });
    it("vacío → null", () => {
        expect(normalizeSessionTimeForApi("")).toBeNull();
    });
});

import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../../types/calendar";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    athleteCalendarHasPartialFailure,
    calendarEventDateKeyMadrid,
    filterHomeTodayAppointments,
    formatCalendarEventClockMadrid,
    groupCalendarEventsByDayMadrid,
    madridCivilTimeIssue,
    madridDayEndIso,
    madridDayStartIso,
    madridTodayDateKey,
    madridTrainerTimeError,
    mergeAthleteAgendaDaysByMadrid,
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
        const today = new Date("2026-10-27T12:00:00+01:00");
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

    it("I6: Hoy usa la fecha civil de Madrid, no la del dispositivo", () => {
        const utcEvening = new Date("2026-10-06T22:30:00Z");
        expect(madridTodayDateKey(utcEvening)).toBe("2026-10-07");
        const items = filterHomeTodayAppointments(
            [
                baseEvent({
                    starts_at: "2026-10-07T00:30:00+02:00",
                    ends_at: null,
                }),
            ],
            utcEvening
        );
        expect(items).toHaveLength(1);
    });

    it("I5: los límites de día llevan offset de Madrid, no naive", () => {
        expect(madridDayStartIso("2026-10-07")).toBe("2026-10-06T22:00:00.000Z");
        expect(madridDayEndIso("2026-10-07")).toBe("2026-10-07T21:59:59.000Z");
    });

    it("I17: rechaza hora inexistente o ambigua en Madrid", () => {
        expect(madridCivilTimeIssue("2026-03-29", "02:30")).toBe("nonexistent");
        expect(madridCivilTimeIssue("2026-10-25", "02:30")).toBe("ambiguous");
        expect(madridTrainerTimeError("2026-03-29", "02:30")).toMatch(/no existe/);
        expect(madridTrainerTimeError("2026-10-25", "02:30")).toMatch(/dos veces/);
        expect(madridCivilTimeIssue("2026-10-27", "08:00")).toBeNull();
    });

    it("I21: ordena por instante, no por texto ISO, durante el fold DST", () => {
        const grouped = groupCalendarEventsByDayMadrid([
            baseEvent({
                id: 2,
                starts_at: "2026-10-25T02:15:00+01:00",
            }),
            baseEvent({
                id: 1,
                starts_at: "2026-10-25T02:30:00+02:00",
            }),
        ]);
        expect(grouped[0].events.map((e) => e.id)).toEqual([1, 2]);
    });

    it("I11: un fallo parcial de agenda o sesiones es error", () => {
        expect(athleteCalendarHasPartialFailure(true, false)).toBe(true);
        expect(athleteCalendarHasPartialFailure(false, true)).toBe(true);
        expect(athleteCalendarHasPartialFailure(false, false)).toBe(false);
    });
});

function baseSession(partial: Partial<TrainingSession> = {}): TrainingSession {
    return {
        id: 100,
        session_name: "Hipertrofia",
        session_date: "2026-10-08",
        session_time: null,
        status: "planned",
        is_active: true,
        planned_volume: 8,
        planned_intensity: 8,
        ...partial,
    } as TrainingSession;
}

describe("mergeAthleteAgendaDaysByMadrid (AG-2.1)", () => {
    it("incluye sesión sin evento de calendario", () => {
        const merged = mergeAthleteAgendaDaysByMadrid(
            [],
            [baseSession({ id: 50, session_date: "2026-10-08" })]
        );
        expect(merged).toHaveLength(1);
        expect(merged[0].rows).toHaveLength(1);
        expect(merged[0].rows[0].kind).toBe("training_session");
    });

    it("no duplica cuando hay evento enlazado", () => {
        const merged = mergeAthleteAgendaDaysByMadrid(
            [
                baseEvent({
                    id: 9,
                    event_kind: "personal_workout",
                    training_session_id: 50,
                    starts_at: "2026-10-08T10:00:00+02:00",
                }),
            ],
            [baseSession({ id: 50, session_date: "2026-10-08" })]
        );
        const day = merged.find((d) => d.dateKey === "2026-10-08");
        expect(day?.rows).toHaveLength(1);
        expect(day?.rows[0].kind).toBe("calendar_event");
    });

    it("ordena entreno sin hora antes de cita con hora", () => {
        const merged = mergeAthleteAgendaDaysByMadrid(
            [
                baseEvent({
                    id: 2,
                    event_kind: "appointment",
                    starts_at: "2026-10-08T16:00:00+02:00",
                }),
            ],
            [baseSession({ id: 50, session_date: "2026-10-08" })]
        );
        expect(merged[0].rows.map((r) => r.kind)).toEqual([
            "training_session",
            "calendar_event",
        ]);
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

import { describe, expect, it } from "vitest";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    filterAgendaWeekSectionsForView,
    groupAgendaDaysByWeek,
    type AgendaWeekSection,
} from "./athleteAgendaViewUtils";

const trainingDay = (dateKey: string, id: number): AgendaWeekSection["days"][number] => ({
    dateKey,
    rows: [
        {
            kind: "training_session",
            session: {
                id,
                session_date: dateKey,
                status: "planned",
            } as TrainingSession,
        },
    ],
});

const appointmentDay = (dateKey: string): AgendaWeekSection["days"][number] => ({
    dateKey,
    rows: [
        {
            kind: "calendar_event",
            event: {
                id: 1,
                event_kind: "appointment",
                starts_at: `${dateKey}T16:00:00+02:00`,
                has_explicit_time: true,
                title: "Consulta",
                is_active: true,
                status: "scheduled",
            },
        },
    ],
});

describe("filterAgendaWeekSectionsForView", () => {
    it("omite semanas sin días visibles para el filtro Citas", () => {
        const sections = groupAgendaDaysByWeek([
            appointmentDay("2026-10-06"),
            trainingDay("2026-10-14", 2),
            trainingDay("2026-10-21", 3),
        ]);

        const filtered = filterAgendaWeekSectionsForView(sections, new Map(), "appointments");

        expect(filtered).toHaveLength(1);
        expect(filtered[0].label).toBe("ESTA SEMANA");
        expect(filtered[0].days.map((d) => d.dateKey)).toEqual(["2026-10-06"]);
    });

    it("omite semanas solo con citas cuando el filtro es Entrenos", () => {
        const sections = groupAgendaDaysByWeek([
            appointmentDay("2026-10-06"),
            trainingDay("2026-10-14", 2),
        ]);

        const filtered = filterAgendaWeekSectionsForView(sections, new Map(), "training");

        expect(filtered).toHaveLength(1);
        expect(filtered[0].days[0].dateKey).toBe("2026-10-14");
    });
});

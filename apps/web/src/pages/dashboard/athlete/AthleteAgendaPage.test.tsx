import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AthleteAgendaPage } from "./AthleteAgendaPage";
import { aggregateDayLoadFromSessions } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 7, isLoading: false, isError: false }),
}));

vi.mock("@/hooks/athlete/useAthleteCalendarEvents", () => ({
    useAthleteCalendarEvents: () => ({
        groupedDays: [
            {
                dateKey: "2026-10-07",
                events: [
                    {
                        id: 1,
                        event_kind: "personal_workout",
                        starts_at: "2026-10-07T08:00:00+02:00",
                        has_explicit_time: true,
                        title: "Fuerza",
                        location: null,
                    },
                    {
                        id: 2,
                        event_kind: "appointment",
                        starts_at: "2026-10-07T10:00:00+02:00",
                        has_explicit_time: true,
                        title: "Consulta",
                        location: null,
                    },
                ],
            },
        ],
        loadModelForDate: () =>
            aggregateDayLoadFromSessions([
                { planned_volume: 8, planned_intensity: 3 },
            ]),
        isLoading: false,
        isError: false,
        refetchEvents: vi.fn(),
    }),
}));

describe("AthleteAgendaPage CARGA-1 (I8)", () => {
    it("muestra un solo indicador de carga en la cabecera del día", () => {
        render(<AthleteAgendaPage />);
        const loadButtons = screen.getAllByRole("button", {
            name: /Carga alta, intensidad baja/i,
        });
        expect(loadButtons).toHaveLength(1);
        expect(screen.getByText("Fuerza")).toBeInTheDocument();
        expect(screen.getByText("Consulta")).toBeInTheDocument();
    });
});

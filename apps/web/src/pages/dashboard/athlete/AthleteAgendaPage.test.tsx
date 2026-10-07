import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AthleteAgendaPage } from "./AthleteAgendaPage";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => navigate };
});

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 7, isLoading: false, isError: false }),
}));

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteSessionsRegistrationMetaQuery: () => ({ data: [] }),
}));

const trainingSession = {
    id: 99,
    session_date: "2026-10-07",
    planned_volume: 8,
    planned_intensity: 3,
    planned_duration: 60,
    agenda_quality_label: "Fuerza máxima",
    agenda_muscle_groups: ["Pecho", "Tríceps"],
    status: "planned",
};

vi.mock("@/hooks/athlete/useAthleteCalendarEvents", () => ({
    useAthleteCalendarEvents: () => ({
        groupedDays: [
            {
                dateKey: "2026-10-07",
                rows: [
                    {
                        kind: "training_session",
                        session: trainingSession,
                    },
                    {
                        kind: "calendar_event",
                        event: {
                            id: 2,
                            event_kind: "appointment",
                            starts_at: "2026-10-07T10:00:00+02:00",
                            has_explicit_time: true,
                            title: "Consulta",
                            location: "Online",
                            meeting_link: null,
                            is_active: true,
                            status: "scheduled",
                        },
                    },
                ],
            },
        ],
        sessionsById: new Map([[99, trainingSession]]),
        isLoading: false,
        isError: false,
        refetchEvents: vi.fn(),
        refetchSessions: vi.fn(),
    }),
}));

describe("AthleteAgendaPage", () => {
    it("muestra cualidad, filtro y filas clicables sin círculo CARGA-1", async () => {
        const user = userEvent.setup();
        render(<AthleteAgendaPage />);
        expect(screen.getByRole("heading", { name: /Mi agenda/i })).toBeInTheDocument();
        expect(screen.getByText("Fuerza máxima")).toBeInTheDocument();
        expect(screen.getByText(/Pecho · Tríceps/)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Carga alta/i })).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: /Entrenos/i }));
        expect(screen.queryByText("Consulta")).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {
                name: /Fuerza máxima, Pecho · Tríceps/i,
            })
        );
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions/99");
    });
});

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

vi.mock("@nexia/shared/utils/athlete/athleteCalendarUtils", async (importOriginal) => {
    const actual = await importOriginal<
        typeof import("@nexia/shared/utils/athlete/athleteCalendarUtils")
    >();
    return {
        ...actual,
        madridTodayDateKey: () => "2026-10-07",
    };
});

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

const groupedDaysFixture = [
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
    {
        dateKey: "2026-10-14",
        rows: [
            {
                kind: "training_session",
                session: { ...trainingSession, id: 100, session_date: "2026-10-14" },
            },
        ],
    },
];

vi.mock("@/hooks/athlete/useAthleteCalendarEvents", () => ({
    useAthleteCalendarEvents: () => ({
        groupedDays: groupedDaysFixture,
        sessionsById: new Map([
            [99, trainingSession],
            [100, { ...trainingSession, id: 100, session_date: "2026-10-14" }],
        ]),
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
        expect(screen.getAllByText("Fuerza máxima").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Pecho · Tríceps/).length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByRole("button", { name: /Carga alta/i })).not.toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: /Entrenos/i }));
        expect(screen.queryByText("Consulta")).not.toBeInTheDocument();

        const trainingRows = screen.getAllByRole("button", {
            name: /Fuerza máxima, Pecho · Tríceps/i,
        });
        await user.click(trainingRows[0]);
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions/99", {
            state: { from: "agenda" },
        });

        await user.click(screen.getByRole("tab", { name: /Citas/i }));
        expect(screen.queryByRole("heading", { name: /PRÓXIMA SEMANA/i })).not.toBeInTheDocument();
    });
});

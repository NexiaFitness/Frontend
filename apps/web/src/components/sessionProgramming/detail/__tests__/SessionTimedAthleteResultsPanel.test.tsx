/**
 * SessionTimedAthleteResultsPanel.test.tsx — Registro timed + nota EMOM del atleta (FE-3).
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { SessionTimedAthleteResultsPanel } from "../SessionTimedAthleteResultsPanel";

const mockQuery = vi.fn();

vi.mock("@nexia/shared/api/clientsApi", () => ({
    useGetClientTimedBlockResultsQuery: (...args: unknown[]) => mockQuery(...args),
}));

describe("SessionTimedAthleteResultsPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("muestra Nota del atleta solo en filas EMOM con detail tipado", () => {
        mockQuery.mockReturnValue({
            isLoading: false,
            data: {
                items: [
                    {
                        id: 1,
                        training_session_id: 4440,
                        timed_mode: "emom",
                        total_seconds: null,
                        rounds_completed: null,
                        emom_completed_count: 4,
                        emom_failed_count: 2,
                        partial_total: null,
                        detail: {
                            kind: "emom",
                            interval_total: 6,
                            as_planned: false,
                            athlete_note: "Nota teclado QA-1C D2",
                        },
                    },
                    {
                        id: 2,
                        training_session_id: 4440,
                        timed_mode: "amrap",
                        total_seconds: null,
                        rounds_completed: 3,
                        emom_completed_count: null,
                        emom_failed_count: null,
                        partial_total: 19,
                        detail: { kind: "amrap", partial_total: 19, partial_by_slot: {} },
                    },
                ],
            },
        });

        render(
            <SessionTimedAthleteResultsPanel clientId={346} sessionId={4440} enabled />
        );

        expect(screen.getByRole("heading", { name: "Registro del atleta" })).toBeInTheDocument();
        expect(screen.getByText("Nota del atleta")).toBeInTheDocument();
        expect(screen.getByText("Nota teclado QA-1C D2")).toBeInTheDocument();
        expect(screen.getByText("EMOM no completado")).toBeInTheDocument();
        expect(screen.getByText("3 rondas + 19 reps")).toBeInTheDocument();
    });

    it("no muestra bloque de nota si EMOM sin athlete_note en detail", () => {
        mockQuery.mockReturnValue({
            isLoading: false,
            data: {
                items: [
                    {
                        id: 3,
                        training_session_id: 99,
                        timed_mode: "emom",
                        total_seconds: null,
                        rounds_completed: null,
                        emom_completed_count: 6,
                        emom_failed_count: 0,
                        partial_total: null,
                        detail: { kind: "emom", interval_total: 6, as_planned: true },
                    },
                ],
            },
        });

        render(
            <SessionTimedAthleteResultsPanel clientId={1} sessionId={99} enabled />
        );

        expect(screen.queryByText("Nota del atleta")).not.toBeInTheDocument();
        expect(screen.getByText("6/6 intervalos")).toBeInTheDocument();
    });
});

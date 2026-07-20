/**
 * ClientOverviewTab Test Suite — UX-OVERVIEW v2 F0.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { ClientOverviewTab } from "../ClientOverviewTab";
import { server } from "@/test-utils/utils/msw";
import {
    getClientCoherenceHandler,
    getClientCoherenceErrorHandler,
} from "@/test-utils/mocks/handlers/clients/coherence";
import {
    getClientProgressHistoryHandler,
    getProgressAnalyticsHandler,
    getClientProgressHistoryErrorHandler,
} from "@/test-utils/mocks/handlers/clients/progress";
import {
    getClientFatigueAnalysisHandler,
    getClientFatigueAnalysisErrorHandler,
} from "@/test-utils/mocks/handlers/clients/fatigue";
import {
    getClientTrainingSessionsHandler,
    getClientTrainingSessionsEmptyHandler,
} from "@/test-utils/mocks/handlers/clients/sessions";
import {
    getClientTestResultsHandler,
    getClientTestResultsEmptyHandler,
} from "@/test-utils/mocks/handlers/clients/tests";
import { getClientFeedbackHandler } from "@/test-utils/mocks/handlers/clients/feedback";
import { getActivePlanByClientWithPlanHandler } from "@/test-utils/mocks/handlers/planning";
import {
    mockNavigate,
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import {
    createMockClient,
    createMockTrainingSession,
} from "@/test-utils/fixtures/clients";
import { GENDER_ENUM } from "@nexia/shared/types/client";
import {
    createMockTrainingPlanRecommendationsComplete,
    createMockTrainingPlanRecommendationsIncomplete,
} from "@/test-utils/fixtures/trainingRecommendations";

describe("ClientOverviewTab", () => {
    const mockClient = createMockClient({
        id: 1,
        nombre: "Juan",
        apellidos: "Pérez",
        mail: "juan@test.com",
        telefono: "+34612345678",
        sexo: GENDER_ENUM.MASCULINO,
        id_passport: "12345678X",
        peso: 80,
        altura: 180,
        imc: 24.7,
        fecha_alta: "2025-01-01",
    });

    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);

        server.use(
            getClientCoherenceHandler,
            getClientProgressHistoryHandler,
            getProgressAnalyticsHandler,
            getClientFatigueAnalysisHandler,
            getClientTrainingSessionsHandler,
            getClientTestResultsHandler,
            getClientFeedbackHandler,
            http.get("*/habits/clients/:clientId/insights", () =>
                HttpResponse.json(
                    {
                        average_completion: 80,
                        best_streak: 7,
                        active_habits: 0,
                        most_skipped: null,
                        completion_by_category: {},
                        streak_by_habit: {},
                    },
                    { status: 200 },
                ),
            ),
            http.get("*/clients/:clientId/ratings", () => HttpResponse.json([], { status: 200 })),
            http.get("*/clients/:clientId/injuries", () => HttpResponse.json([], { status: 200 })),
            http.get("*/training-plans/recommendations/:clientId", () =>
                HttpResponse.json(createMockTrainingPlanRecommendationsIncomplete(), {
                    status: 200,
                }),
            ),
            http.get("*/clients/:clientId/load-insights", () =>
                HttpResponse.json(
                    {
                        client_id: 1,
                        completed_sessions_count: 0,
                        has_sufficient_data: false,
                        signals: [],
                        recent_loads: [],
                    },
                    { status: 200 },
                ),
            ),
            http.get("*/training-plans/active-by-client/:clientId", () =>
                HttpResponse.json(null, { status: 200 }),
            ),
        );
    });

    it("renders loading state initially", () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);
        expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
    });

    it("renders invalid client id message", () => {
        render(<ClientOverviewTab client={mockClient} clientId={0} />);
        expect(screen.getByText(/id de cliente inválido/i)).toBeInTheDocument();
    });

    it("renders F0 zones after loading", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });

        expect(screen.getByTestId("client-overview-top-section")).toBeInTheDocument();
        expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
    });

    it("renders KPI section before action section in DOM order", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });

        const kpiSection = screen.getByTestId("client-overview-kpi-section");
        const topSection = screen.getByTestId("client-overview-top-section");
        expect(
            kpiSection.compareDocumentPosition(topSection) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("does not show visible page subtitle", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });

        expect(
            screen.queryByText(/relación, acción y contexto del atleta/i),
        ).not.toBeInTheDocument();
    });

    it("shows aligned badge on plan card when recommendations are complete", async () => {
        server.use(
            getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Maraton" }),
            http.get("*/training-plans/recommendations/:clientId", () =>
                HttpResponse.json(createMockTrainingPlanRecommendationsComplete(), {
                    status: 200,
                }),
            ),
        );

        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText(/alineado con objetivo/i)).toBeInTheDocument();
        });

        expect(
            screen.queryByText(/plan alineado con el objetivo del cliente/i),
        ).not.toBeInTheDocument();
    });

    it("shows metric cards with adherence and weight", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText(/adherencia/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/último peso/i)).toBeInTheDocument();
    });

    it("shows athlete feedback card with response form when feedback exists", async () => {
        server.use(
            http.get("*/training-sessions/feedback/client/:clientId", () =>
                HttpResponse.json(
                    [
                        {
                            id: 42,
                            training_session_id: 99,
                            client_id: 1,
                            feedback_date: "2026-06-21T10:00:00Z",
                            perceived_effort: 8,
                            fatigue_level: 7,
                            pain_or_discomfort: "Rodilla en zancada",
                            notes: null,
                            trainer_response: null,
                        },
                    ],
                    { status: 200 },
                ),
            ),
            http.get("*/training-sessions/", () =>
                HttpResponse.json(
                    [
                        createMockTrainingSession({
                            id: 99,
                            client_id: 1,
                            session_name: "Strength A",
                        }),
                    ],
                    { status: 200 },
                ),
            ),
        );

        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(
            () => {
                expect(screen.getByText(/feedback del atleta/i)).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
        expect(screen.getByText(/strength a/i)).toBeInTheDocument();
        expect(screen.getByText(/rodilla en zancada/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/responder al atleta/i)).toBeInTheDocument();
    });

    it("shows feedback empty state when no feedback", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(
            () => {
                expect(
                    screen.getByText(/aún no hay feedback post-sesión/i),
                ).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it("does not render ClientStatusSection (v2)", async () => {
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });

        expect(screen.queryByText(/estado del cliente/i)).not.toBeInTheDocument();
    });

    it("displays last session in activity when completed session exists", async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        server.use(
            http.get("*/training-sessions/", () =>
                HttpResponse.json(
                    [
                        createMockTrainingSession({
                            client_id: 1,
                            session_date: yesterday.toISOString().split("T")[0],
                            status: "completed",
                        }),
                    ],
                    { status: 200 },
                ),
            ),
        );

        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(
            () => {
                expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
        await waitFor(
            () => {
                expect(screen.getByText(/última sesión/i)).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    });

    it("navigates to session detail from activity card", async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        server.use(
            http.get("*/training-sessions/", () =>
                HttpResponse.json(
                    [
                        createMockTrainingSession({
                            id: 99,
                            client_id: 1,
                            session_date: yesterday.toISOString().split("T")[0],
                            status: "completed",
                        }),
                    ],
                    { status: 200 },
                ),
            ),
        );

        const user = userEvent.setup();
        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        const link = await screen.findByRole("button", { name: /última sesión/i });
        await user.click(link);
        expect(mockNavigate).toHaveBeenCalledWith(
            "/dashboard/session-programming/sessions/99",
            { state: { from: "/" } },
        );
    });

    it("shows sin programar in metric card when no upcoming sessions", async () => {
        server.use(
            getClientTrainingSessionsEmptyHandler,
            getClientTestResultsEmptyHandler,
            http.get("*/progress/", () => HttpResponse.json([], { status: 200 })),
        );

        render(<ClientOverviewTab client={mockClient} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText(/sin programar/i)).toBeInTheDocument();
        });
    });

    it("handles coherence API error gracefully", async () => {
        server.use(getClientCoherenceErrorHandler);
        render(<ClientOverviewTab client={mockClient} clientId={1} />);
        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });
    });

    it("handles progress API error gracefully", async () => {
        server.use(getClientProgressHistoryErrorHandler);
        render(<ClientOverviewTab client={mockClient} clientId={1} />);
        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });
    });

    it("handles fatigue API error gracefully", async () => {
        server.use(getClientFatigueAnalysisErrorHandler);
        render(<ClientOverviewTab client={mockClient} clientId={1} />);
        await waitFor(() => {
            expect(screen.getByTestId("client-overview-kpi-section")).toBeInTheDocument();
        });
    });
});

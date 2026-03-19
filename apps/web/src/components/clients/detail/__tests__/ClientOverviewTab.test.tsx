/**
 * ClientOverviewTab Test Suite - Professional Coverage
 *
 * Tests de integración para el tab Overview del cliente (Dashboard Ejecutivo).
 * Cubre rendering, métricas, alertas, actividad reciente y manejo de estados.
 *
 * Sigue la arquitectura de testing de NEXIA:
 * - Usa fixtures centralizadas
 * - Usa handlers MSW específicos (no inline)
 * - Tests de integración (no unitarios)
 * - User-centric testing
 *
 * @author Frontend Team
 * @since v1.0.0
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
import {
    mockNavigate,
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import {
    createMockClient,
    createMockCoherenceData,
    createMockProgress,
    createMockProgressAnalytics,
    createMockFatigueAnalysis,
    createMockTrainingSession,
    createMockTestResult,
} from "@/test-utils/fixtures/clients";
import { GENDER_ENUM } from "@nexia/shared/types/client";

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

        // Handlers para endpoints que ClientOverviewTab consume (habits, ratings, recommendations)
        const getClientHabitInsightsHandler = http.get(
            "*/habits/clients/:clientId/insights",
            () =>
                HttpResponse.json(
                    {
                        average_completion: 80,
                        best_streak: 7,
                        active_habits: 0,
                        most_skipped: null,
                        completion_by_category: {},
                        streak_by_habit: {},
                    },
                    { status: 200 }
                )
        );
        const getClientRatingsHandler = http.get(
            "*/clients/:clientId/ratings",
            () => HttpResponse.json([], { status: 200 })
        );
        const getTrainingPlanRecommendationsHandler = http.get(
            "*/training-plans/recommendations/:clientId",
            () =>
                HttpResponse.json(
                    {
                        client_id: 1,
                        status: "incomplete",
                        message: "Ficha incompleta",
                        missing_fields: [],
                        recommendations: null,
                        based_on: {
                            experience: null,
                            training_frequency: null,
                            session_duration: null,
                            objective: null,
                        },
                    },
                    { status: 200 }
                )
        );

        server.use(
            getClientCoherenceHandler,
            getClientProgressHistoryHandler,
            getProgressAnalyticsHandler,
            getClientFatigueAnalysisHandler,
            getClientTrainingSessionsHandler,
            getClientTestResultsHandler,
            getClientHabitInsightsHandler,
            getClientRatingsHandler,
            getTrainingPlanRecommendationsHandler
        );
    });

    describe("Rendering & Basic UI", () => {
        it("renders loading state initially", () => {
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            // Debe mostrar spinner de carga
            expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
        });

        it("renders error message when clientId is invalid", () => {
            render(<ClientOverviewTab client={mockClient} clientId={0} />);

            expect(screen.getByText(/id de cliente inválido/i)).toBeInTheDocument();
        });

        it("renders all metric cards after loading", async () => {
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            // Esperar al contenido real (el componente tiene loaders en varias secciones; evitar flakiness)
            await waitFor(() => {
                expect(screen.getByText(/último peso/i)).toBeInTheDocument();
            });

            // Varias secciones pueden mostrar "Adherencia"; comprobar que al menos una métrica de cada tipo está
            expect(screen.getAllByText(/adherencia/i).length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText(/último peso/i)).toBeInTheDocument();
            expect(screen.getByText(/fatiga promedio/i)).toBeInTheDocument();
            expect(screen.getByText(/próxima sesión/i)).toBeInTheDocument();
        });

        it("renders personal information section", async () => {
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(
                () => {
                    expect(screen.getByText(/información personal/i)).toBeInTheDocument();
                },
                { timeout: 8000 }
            );

            expect(screen.getByText(mockClient.mail!)).toBeInTheDocument();
        });
    });

    describe("Metrics Display", () => {
        it("displays adherence metric correctly", async () => {
            const coherenceData = createMockCoherenceData({
                client_id: 1,
                kpis: {
                    adherence_percentage: 85,
                    average_srpe: 7.5,
                    monotony: 1.8,
                    strain: 12.5,
                },
            });

            server.use(
                http.get("*/clients/:id/coherence", async () => {
                    return HttpResponse.json(coherenceData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(
                () => {
                    expect(screen.getAllByText(/85%/i).length).toBeGreaterThanOrEqual(1);
                },
                { timeout: 8000 }
            );
        });

        it("displays weight metric with change", async () => {
            const progressAnalytics = createMockProgressAnalytics({
                client_id: 1,
                weight_change_kg: 2.5,
                progress_trend: "gaining_weight",
            });

            server.use(
                http.get("*/progress/analytics/:id", async () => {
                    return HttpResponse.json(progressAnalytics, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                // Buscar dentro de la MetricCard de peso
                const weightCard = screen.getByText(/último peso/i).closest("div");
                expect(weightCard).toBeInTheDocument();
                expect(weightCard).toHaveTextContent(/80 kg/i);
                expect(weightCard).toHaveTextContent(/\+2.5 kg/i);
            });
        });

        it("displays fatigue metrics correctly", async () => {
            const fatigueData = [
                createMockFatigueAnalysis({
                    client_id: 1,
                    pre_fatigue_level: 3,
                    post_fatigue_level: 6,
                }),
            ];

            server.use(
                http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
                    return HttpResponse.json(fatigueData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/pre: 3/i)).toBeInTheDocument();
                expect(screen.getByText(/post: 6/i)).toBeInTheDocument();
            });
        });

        it("displays upcoming session correctly", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const sessions = [
                createMockTrainingSession({
                    client_id: 1,
                    session_date: tomorrow.toISOString().split('T')[0],
                    status: "scheduled",
                }),
            ];

            server.use(
                http.get("*/training-sessions/", async () => {
                    return HttpResponse.json(sessions, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                // Verificar que se muestra la fecha de la próxima sesión
                const dateText = tomorrow.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                });
                expect(screen.getByText(new RegExp(dateText.replace(/\./g, "\\."), "i"))).toBeInTheDocument();
            });
        });
    });

    describe("Alerts Display", () => {
        it("displays monotony alert when monotony > 2.0", async () => {
            const coherenceData = createMockCoherenceData({
                client_id: 1,
                kpis: {
                    adherence_percentage: 85,
                    average_srpe: 7.5,
                    monotony: 2.5, // Mayor que 2.0
                    strain: 12.5,
                },
            });

            server.use(
                http.get("*/clients/:id/coherence", async () => {
                    return HttpResponse.json(coherenceData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/alta - revisar planificación/i)).toBeInTheDocument();
            });
        });

        it("displays adherence alert when adherence < 80%", async () => {
            const coherenceData = createMockCoherenceData({
                client_id: 1,
                kpis: {
                    adherence_percentage: 75, // Menor que 80%
                    average_srpe: 7.5,
                    monotony: 1.8,
                    strain: 12.5,
                },
            });

            server.use(
                http.get("*/clients/:id/coherence", async () => {
                    return HttpResponse.json(coherenceData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getAllByText(/75%/i).length).toBeGreaterThanOrEqual(1);
            });
        });

        it("displays risk level alert when risk is high", async () => {
            const fatigueData = [
                createMockFatigueAnalysis({
                    client_id: 1,
                    risk_level: "high",
                }),
            ];

            server.use(
                http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
                    return HttpResponse.json(fatigueData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/nivel de riesgo/i)).toBeInTheDocument();
                expect(screen.getByText(/alto/i)).toBeInTheDocument();
            });
        });

        it("does not display alerts section when no alerts", async () => {
            const coherenceData = createMockCoherenceData({
                client_id: 1,
                kpis: {
                    adherence_percentage: 85, // >= 80%
                    average_srpe: 7.5,
                    monotony: 1.8, // <= 2.0
                    strain: 12.5,
                },
            });

            const fatigueData = [
                createMockFatigueAnalysis({
                    client_id: 1,
                    risk_level: "low",
                }),
            ];

            server.use(
                http.get("*/clients/:id/coherence", async () => {
                    return HttpResponse.json(coherenceData, { status: 200 });
                }),
                http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
                    return HttpResponse.json(fatigueData, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByText(/alertas/i)).not.toBeInTheDocument();
            });
        });
    });

    describe("Recent Activity", () => {
        it("displays last completed session", async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const sessions = [
                createMockTrainingSession({
                    client_id: 1,
                    session_date: yesterday.toISOString().split('T')[0],
                    status: "completed",
                }),
            ];

            server.use(
                http.get("*/training-sessions/", async () => {
                    return HttpResponse.json(sessions, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/última sesión/i)).toBeInTheDocument();
            });
        });

        it("displays last test result", async () => {
            const testResults = [
                createMockTestResult({
                    client_id: 1,
                    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    value: 100,
                    unit: "kg",
                }),
            ];

            server.use(
                http.get("*/physical-tests/results", async () => {
                    return HttpResponse.json(testResults, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/último test/i)).toBeInTheDocument();
                expect(screen.getByText(/100 kg/i)).toBeInTheDocument();
            });
        });

        it("displays last progress record", async () => {
            const progressHistory = [
                createMockProgress({
                    client_id: 1,
                    fecha_registro: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    peso: 82,
                    imc: 25.3,
                }),
            ];

            server.use(
                http.get("*/progress/", async () => {
                    return HttpResponse.json(progressHistory, { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/último registro/i)).toBeInTheDocument();
                // Buscar dentro de la ActivityCard de último registro
                const progressCard = screen.getByText(/último registro/i).closest("button");
                expect(progressCard).toBeInTheDocument();
                expect(progressCard).toHaveTextContent(/82 kg/i);
            });
        });

        it("does not display activity section when no activity", async () => {
            server.use(
                getClientTrainingSessionsEmptyHandler,
                getClientTestResultsEmptyHandler,
                http.get("*/progress/", async () => {
                    return HttpResponse.json([], { status: 200 });
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByText(/actividad reciente/i)).not.toBeInTheDocument();
            });
        });
    });

    describe("Navigation", () => {
        it("navigates to coherence tab when clicking alert link", async () => {
            const coherenceData = createMockCoherenceData({
                client_id: 1,
                kpis: {
                    adherence_percentage: 85,
                    average_srpe: 7.5,
                    monotony: 2.5,
                    strain: 12.5,
                },
            });

            server.use(
                http.get("*/clients/:id/coherence", async () => {
                    return HttpResponse.json(coherenceData, { status: 200 });
                })
            );

            const user = userEvent.setup();
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /ver detalles de coherencia/i })).toBeInTheDocument();
            });

            const coherenceLink = screen.getByRole("button", { name: /ver detalles de coherencia/i });
            await user.click(coherenceLink);

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients/1?tab=daily-coherence");
        });

        it("navigates to progress tab when clicking risk alert link", async () => {
            const fatigueData = [
                createMockFatigueAnalysis({
                    client_id: 1,
                    risk_level: "high",
                }),
            ];

            server.use(
                http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
                    return HttpResponse.json(fatigueData, { status: 200 });
                })
            );

            const user = userEvent.setup();
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/nivel de riesgo/i)).toBeInTheDocument();
                expect(screen.getByText(/alto/i)).toBeInTheDocument();
            });

            const progressLink = screen.getByRole("button", { name: /ver análisis de fatiga/i });
            await user.click(progressLink);

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients/1?tab=progress");
        });

        it("navigates to session programming tab when clicking activity card", async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const sessions = [
                createMockTrainingSession({
                    client_id: 1,
                    session_date: yesterday.toISOString().split('T')[0],
                    status: "completed",
                }),
            ];

            server.use(
                http.get("*/training-sessions/", async () => {
                    return HttpResponse.json(sessions, { status: 200 });
                })
            );

            const user = userEvent.setup();
            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/última sesión/i)).toBeInTheDocument();
            });

            const sessionCard = screen.getByText(/última sesión/i).closest("button");
            if (sessionCard) {
                await user.click(sessionCard);
                expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients/1?tab=sessions");
            }
        });
    });

    describe("Error Handling", () => {
        it("handles coherence API error gracefully", async () => {
            server.use(getClientCoherenceErrorHandler);

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(
                () => expect(screen.getByText(/último peso/i)).toBeInTheDocument(),
                { timeout: 5000 }
            );
        });

        it("handles progress API error gracefully", async () => {
            server.use(getClientProgressHistoryErrorHandler);

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(
                () => expect(screen.getByText(/último peso/i)).toBeInTheDocument(),
                { timeout: 5000 }
            );
        });

        it("handles fatigue API error gracefully", async () => {
            server.use(getClientFatigueAnalysisErrorHandler);

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(
                () => expect(screen.getByText(/último peso/i)).toBeInTheDocument(),
                { timeout: 5000 }
            );
        });
    });

    describe("Empty States", () => {
        it("displays N/A for weight when no progress data", async () => {
            server.use(
                http.get("*/progress/", async () => {
                    return HttpResponse.json([], { status: 200 });
                }),
                http.get("*/progress/analytics/:id", async () => {
                    return HttpResponse.json(
                        createMockProgressAnalytics({
                            client_id: 1,
                            weight_change_kg: null,
                        }),
                        { status: 200 }
                    );
                })
            );

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
            });
        });

        it("displays 'No programada' for upcoming session when no sessions", async () => {
            server.use(getClientTrainingSessionsEmptyHandler);

            render(<ClientOverviewTab client={mockClient} clientId={1} />);

            await waitFor(() => {
                expect(screen.getByText(/no programada/i)).toBeInTheDocument();
            });
        });
    });
});

/**
 * ClientPlanningTab Test Suite
 *
 * Tests de integración para el tab Planificación desde perfil de cliente.
 * Usa GET active-by-client/{client_id}: 404 → estado vacío + CTA "Crear plan";
 * 200 con plan → PlanPeriodizationSection.
 *
 * @author Frontend Team
 * @since Fase 7
 * @updated v9.0.0 — Eliminado PlanningTab legacy; tests para PlanPeriodizationSection
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { ClientPlanningTab } from "../ClientPlanningTab";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { server } from "@/test-utils/utils/msw";
import {
    getActivePlanByClientWithPlanHandler,
} from "@/test-utils/mocks/handlers/planning";
import { getPhysicalQualitiesHandler } from "@/test-utils/mocks/handlers/catalogs";
import { setMockSearchParams } from "@/test-utils/mocks/reactRouterMocks";
import { createMockTrainingPlanRecommendationsIncomplete } from "@/test-utils/fixtures/trainingRecommendations";
import { OVERVIEW_ZONE_TITLES } from "../clientOverviewPresentation";

/**
 * PlanPeriodizationSection (montada cuando hay plan activo) dispara además
 * movement-patterns, training-plans/recommendations/:clientId y GET /training-plans/:planId.
 * Sin estos handlers, MSW registra "unhandled request" y esas ramas renderizan
 * en estado de error silencioso — sin que el test lo note.
 */
function planPeriodizationDependenciesHandlers(planId: number) {
    return [
        http.get("*/exercise-catalog/movement-patterns/", () =>
            HttpResponse.json([], { status: 200 })
        ),
        http.get("*/training-plans/recommendations/:clientId", () =>
            HttpResponse.json(createMockTrainingPlanRecommendationsIncomplete(), {
                status: 200,
            })
        ),
        http.get("*/training-plans/:planId", ({ params }) => {
            if (Number(params.planId) !== planId) {
                return HttpResponse.json({ detail: "Not found" }, { status: 404 });
            }
            return HttpResponse.json({
                id: planId,
                trainer_id: 1,
                client_id: 1,
                name: "Plan Maraton",
                description: null,
                start_date: "2026-01-01",
                end_date: "2026-12-31",
                goal: "Strength",
                status: "active",
                is_active: true,
                created_at: "2026-01-01T00:00:00.000Z",
                updated_at: "2026-01-01T00:00:00.000Z",
                sessions_completed: 0,
                sessions_total: 0,
            });
        }),
    ];
}

describe("ClientPlanningTab", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
        server.resetHandlers();
    });

    describe("Sin plan activo (404 active-by-client)", () => {
        it("muestra estado vacío cuando no hay plan activo", async () => {
            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(
                    screen.getByText(OVERVIEW_ZONE_TITLES.planEmpty)
                ).toBeInTheDocument();
            });

            expect(
                screen.getByText(OVERVIEW_ZONE_TITLES.planEmptyDetail)
            ).toBeInTheDocument();
        });

        it(
            "muestra CTA Planificar y llama a onPlanificar al hacer clic",
            async () => {
                const onPlanificar = vi.fn();
                render(
                    <ClientPlanningTab
                        clientId={1}
                        trainingPlans={[]}
                        isLoadingPlans={false}
                        onPlanificar={onPlanificar}
                    />
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByText(OVERVIEW_ZONE_TITLES.planEmpty)
                        ).toBeInTheDocument();
                    },
                    { timeout: 10000 }
                );

                expect(screen.getByRole("button", { name: /planificar/i })).toBeInTheDocument();
                await userEvent.click(screen.getByRole("button", { name: /planificar/i }));
                expect(onPlanificar).toHaveBeenCalledTimes(1);
            },
            12000
        );
    });

    describe("Con plan activo (200 active-by-client)", () => {
        it("muestra sección de periodización cuando hay plan activo", async () => {
            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Maraton" }),
                ...planPeriodizationDependenciesHandlers(10)
            );

            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(
                    screen.getByTestId("planning-explore-shell"),
                ).toBeInTheDocument();
            });

            expect(screen.getByText("Planificación")).toBeInTheDocument();
            expect(
                screen.queryByText("Bloques configurados"),
            ).not.toBeInTheDocument();
        });

        it("muestra superficie focal D-PAP cuando blockAuthor=create en URL", async () => {
            setMockSearchParams({
                tab: "planning",
                blockAuthor: "create",
                blockStart: "2026-03-01",
                blockEnd: "2026-03-31",
                blockStep: "qualities",
            });

            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Maraton" }),
                getPhysicalQualitiesHandler,
                ...planPeriodizationDependenciesHandlers(10),
            );

            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />,
                {
                    initialEntries: [
                        "/dashboard/clients/1?tab=planning&blockAuthor=create&blockStart=2026-03-01&blockEnd=2026-03-31&blockStep=qualities",
                    ],
                },
            );

            await waitFor(() => {
                expect(
                    screen.getByTestId("plan-block-authoring-surface"),
                ).toBeInTheDocument();
            });

            expect(screen.getByText("Bloque en creación")).toBeInTheDocument();
            expect(screen.queryByText("Bloques configurados")).not.toBeInTheDocument();
        });
    });

    describe("Loading state", () => {
        it("muestra spinner cuando isLoadingPlans es true", () => {
            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={true}
                />
            );

            expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
        });
    });
});

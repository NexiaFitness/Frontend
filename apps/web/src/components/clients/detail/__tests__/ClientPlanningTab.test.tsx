/**
 * ClientPlanningTab Test Suite - Fase 1 U3
 *
 * Tests de integración para el tab Planificación desde perfil de cliente.
 * Usa GET active-by-client/{client_id}: 404 → estado vacío + CTA "Crear plan";
 * 200 con plan → PlanningTab (sin selector de modo).
 * Estado en URL: month/week leídos y escritos por ClientPlanningTab; PlanningTab recibe props.
 * MSW: getActivePlanByClientHandler (404 por defecto), getActivePlanByClientWithPlanHandler para "con plan".
 *
 * @author Frontend Team
 * @since Fase 7
 * @updated Fase 1 U3 — plan activo vía API + estado month/week en URL
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ClientPlanningTab } from "../ClientPlanningTab";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { server } from "@/test-utils/utils/msw";
import {
    getActivePlanByClientWithPlanHandler,
} from "@/test-utils/mocks/handlers/planning";

describe("ClientPlanningTab", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
        server.resetHandlers();
    });

    describe("Sin plan activo (404 active-by-client)", () => {
        it("muestra estado vacío cuando no hay plan activo (sin selector de modo)", async () => {
            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Sin plan activo")).toBeInTheDocument();
            });

            expect(
                screen.getByText(/Este cliente no tiene un plan de entrenamiento activo/)
            ).toBeInTheDocument();
            expect(screen.queryByText("Modo de planificación")).not.toBeInTheDocument();
        });

        it(
            "muestra CTA Crear plan y llama a onOpenCreatePlan al hacer clic cuando se pasa",
            async () => {
                const onOpenCreatePlan = vi.fn();
                render(
                    <ClientPlanningTab
                        clientId={1}
                        trainingPlans={[]}
                        isLoadingPlans={false}
                        onOpenCreatePlan={onOpenCreatePlan}
                    />
                );

                await waitFor(
                    () => {
                        expect(screen.getByText("Sin plan activo")).toBeInTheDocument();
                    },
                    { timeout: 10000 }
                );

                expect(screen.getByRole("button", { name: /crear plan/i })).toBeInTheDocument();
                await userEvent.click(screen.getByRole("button", { name: /crear plan/i }));
                expect(onOpenCreatePlan).toHaveBeenCalledTimes(1);
            },
            12000
        );
    });

    describe("Con plan activo (200 active-by-client)", () => {
        it("muestra PlanningTab (Nuevo baseline, Coherencia) sin selector de modo", async () => {
            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Maraton" })
            );

            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
            });

            expect(screen.getByText("Coherencia del plan")).toBeInTheDocument();
            expect(screen.queryByText("Modo de planificación")).not.toBeInTheDocument();
        });

        it(
            "con plan activo renderiza PlanningTab con contenido de plan",
            async () => {
                server.use(
                    getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Fuerza" })
                );

                render(
                    <ClientPlanningTab
                        clientId={1}
                        trainingPlans={[]}
                        isLoadingPlans={false}
                    />
                );

                await waitFor(
                    () => {
                        expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
                    },
                    { timeout: 10000 }
                );

                expect(screen.getByText("Coherencia del plan")).toBeInTheDocument();
            },
            12000
        );
    });

    describe("Estado en URL (month/week)", () => {
        it("muestra selector de semana con opciones 1-4 cuando hay plan activo", async () => {
            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Test" })
            );

            render(
                <ClientPlanningTab clientId={1} trainingPlans={[]} isLoadingPlans={false} />,
                {
                    initialEntries: [
                        "/clients/1?tab=planning&month=2025-03&week=1",
                    ],
                }
            );

            await waitFor(
                () => {
                    expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
                },
                { timeout: 10000 }
            );

            const weekSelect = screen.getByRole("combobox", { name: /semana del mes/i });
            expect(weekSelect).toBeInTheDocument();
            expect(["1", "2", "3", "4"]).toContain((weekSelect as HTMLSelectElement).value);
            expect(weekSelect.querySelectorAll("option")).toHaveLength(4);
        }, 15000);
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

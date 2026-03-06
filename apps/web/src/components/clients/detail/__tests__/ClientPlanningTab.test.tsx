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

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { render } from "@/test-utils/render";
import { render as renderWithRouter } from "@testing-library/react";
import { ClientPlanningTab } from "../ClientPlanningTab";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { server } from "@/test-utils/utils/msw";
import { createTestStore } from "@/test-utils/utils/store";
import { Provider } from "react-redux";
import { ToastProvider } from "@/components/ui/feedback";
import {
    getActivePlanByClientWithPlanHandler,
} from "@/test-utils/mocks/handlers/planning";

function renderWithPlanningUrl(
    ui: React.ReactElement,
    initialEntries: string[] = ["/dashboard/clients/1?tab=planning"]
) {
    const store = createTestStore();
    return renderWithRouter(ui, {
        wrapper: ({ children }) => (
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                    <ToastProvider>{children}</ToastProvider>
                </MemoryRouter>
            </Provider>
        ),
    });
}

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

        it("muestra CTA Crear plan y llama a onOpenCreatePlan al hacer clic cuando se pasa", async () => {
            const onOpenCreatePlan = vi.fn();
            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                    onOpenCreatePlan={onOpenCreatePlan}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Sin plan activo")).toBeInTheDocument();
            });

            expect(screen.getByRole("button", { name: /crear plan/i })).toBeInTheDocument();
            await userEvent.click(screen.getByRole("button", { name: /crear plan/i }));
            expect(onOpenCreatePlan).toHaveBeenCalledTimes(1);
        });
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

        it("con plan activo renderiza PlanningTab con contenido de plan", async () => {
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

            await waitFor(() => {
                expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
            });

            expect(screen.getByText("Coherencia del plan")).toBeInTheDocument();
        });
    });

    describe("Estado en URL (month/week)", () => {
        it("mount con month y week en URL muestra semana seleccionada", async () => {
            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Test" })
            );

            renderWithPlanningUrl(
                <ClientPlanningTab clientId={1} trainingPlans={[]} isLoadingPlans={false} />,
                ["/dashboard/clients/1?tab=planning&month=2026-05&week=3"]
            );

            await waitFor(() => {
                expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
            });

            const weekSelect = screen.getByRole("combobox", { name: /semana del mes/i });
            expect(weekSelect).toHaveValue("3");
        });

        it("cambio de semana actualiza el selector (URL drive state)", async () => {
            server.use(
                getActivePlanByClientWithPlanHandler({ id: 10, name: "Plan Test" })
            );

            renderWithPlanningUrl(
                <ClientPlanningTab clientId={1} trainingPlans={[]} isLoadingPlans={false} />,
                ["/dashboard/clients/1?tab=planning&month=2026-05&week=3"]
            );

            await waitFor(() => {
                expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
            });

            const weekSelect = screen.getByRole("combobox", { name: /semana del mes/i });
            await userEvent.selectOptions(weekSelect, "2");

            await waitFor(() => {
                expect(weekSelect).toHaveValue("2");
            });
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

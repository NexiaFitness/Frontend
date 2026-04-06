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
        it("muestra estado vacío cuando no hay plan activo", async () => {
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
        });

        it(
            "muestra CTA Crear plan y llama a onOpenCreatePlan al hacer clic",
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
        it("muestra sección de periodización cuando hay plan activo", async () => {
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
                expect(screen.getByText("Bloques configurados")).toBeInTheDocument();
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

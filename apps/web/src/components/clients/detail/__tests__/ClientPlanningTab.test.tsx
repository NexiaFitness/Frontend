/**
 * ClientPlanningTab Test Suite - Fase 7
 *
 * Tests de integracion para el tab Planificacion desde perfil de cliente.
 * Cubre modo client-only (sin planes) y modo plan (con planes).
 * Usa MSW handlers de planning; sin backend real.
 *
 * Sigue la arquitectura de testing de NEXIA:
 * - Fixtures centralizadas
 * - MSW handlers de planning
 * - Tests de integracion
 *
 * @author Frontend Team
 * @since Fase 7
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ClientPlanningTab } from "../ClientPlanningTab";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { createMockTrainingPlan } from "@/test-utils/fixtures/training";

describe("ClientPlanningTab", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
    });

    describe("Modo client-only (sin planes)", () => {
        it("muestra contenido de planificacion sin selector de modo cuando trainingPlans esta vacio", async () => {
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

            expect(screen.getByText("Calendario de planificación")).toBeInTheDocument();
            expect(
                screen.getByText(/sin plan asociado/)
            ).toBeInTheDocument();
            expect(screen.queryByText("Modo de planificación")).not.toBeInTheDocument();
        });

        it("muestra formulario de crear baseline con mes y cualidades", async () => {
            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Mes (YYYY-MM)")).toBeInTheDocument();
            });

            expect(
                screen.getByPlaceholderText("Fuerza: 60, Resistencia: 40")
            ).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Crear/ })).toBeInTheDocument();
        });
    });

    describe("Modo con planes", () => {
        it("muestra selector de modo cuando hay planes", async () => {
            const mockPlan = createMockTrainingPlan({
                id: 10,
                name: "Plan Maraton",
            });

            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[mockPlan]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Modo de planificación")).toBeInTheDocument();
            });

            expect(
                screen.getByRole("option", { name: "Solo cliente (sin plan asociado)" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("option", { name: "Plan: Plan Maraton" })
            ).toBeInTheDocument();
        });

        it("con plan seleccionado renderiza PlanningTab con Nuevo baseline mensual", async () => {
            const mockPlan = createMockTrainingPlan({
                id: 10,
                name: "Plan Fuerza",
            });

            render(
                <ClientPlanningTab
                    clientId={1}
                    trainingPlans={[mockPlan]}
                    isLoadingPlans={false}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Modo de planificación")).toBeInTheDocument();
            });

            const comboboxes = screen.getAllByRole("combobox");
            const modeSelect = comboboxes.find(
                (el) => el.querySelector('option[value="__client_only__"]')
            ) ?? comboboxes[0];
            await userEvent.selectOptions(modeSelect, "10");

            await waitFor(() => {
                expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
            });

            expect(screen.getByText("Coherencia del plan")).toBeInTheDocument();
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

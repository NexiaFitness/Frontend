/**
 * PlanningTab Test Suite — Fase 7.2
 *
 * Tests RTL para el tab Planificación (baseline mensual, calendario, resolve-day).
 * Usa MSW handlers de planning; sin backend real. Tipos estrictos, sin any/ts-ignore.
 */

import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { PlanningTab } from "../PlanningTab";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";

describe("PlanningTab", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
    });

    it("renderiza y carga baseline mensual con MSW", async () => {
        render(<PlanningTab planId={1} />);

        await waitFor(() => {
            expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
        });

        expect(screen.getByText("Mes (YYYY-MM)")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Fuerza: 60, Resistencia: 40")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Crear/ })).toBeInTheDocument();
    });

    it("con clientId muestra calendario de planificación tras cargar", async () => {
        render(<PlanningTab planId={1} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText("Calendario de planificación")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText("Nuevo baseline mensual")).toBeInTheDocument();
        });
    });
});

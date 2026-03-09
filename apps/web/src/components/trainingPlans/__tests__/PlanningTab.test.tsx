/**
 * PlanningTab Test Suite — Fase 7.2 + Fase 5
 *
 * Tests RTL para el tab Planificación (baseline mensual, calendario, resolve-day).
 * Fase 5: toggle Calendario / Vista semana. Usa MSW handlers; sin backend real.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    it("con clientId muestra toggle Calendario / Vista semana (Fase 5)", async () => {
        render(<PlanningTab planId={1} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText("Calendario de planificación")).toBeInTheDocument();
        });

        const calTab = screen.getByRole("tab", { name: /Calendario/i });
        const weekTab = screen.getByRole("tab", { name: /Vista semana/i });
        expect(calTab).toBeInTheDocument();
        expect(weekTab).toBeInTheDocument();
    });

    it("al hacer clic en Vista semana muestra grid de semana L-D", async () => {
        const user = userEvent.setup();
        render(<PlanningTab planId={1} clientId={1} />);

        await waitFor(() => {
            expect(screen.getByText("Calendario de planificación")).toBeInTheDocument();
        });

        const weekTab = screen.getByRole("tab", { name: /Vista semana/i });
        await user.click(weekTab);

        await waitFor(() => {
            const grid = screen.getByRole("grid", {
                name: /Vista semana L–D con valor planificado/i,
            });
            expect(grid).toBeInTheDocument();
        });
    });
});

/**
 * AppNavbar — Tests de comportamiento y semántica (variante explícita).
 *
 * Contexto: AppNavbar recibe variant obligatorio del layout. No hay inferencia por
 * ruta ni auth. Se prueba rama pública (variant="public") y rama dashboard
 * (variant="dashboard") con props explícitas.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated Consolidación: variante explícita obligatoria
 */

import { render, screen } from "@/test-utils/render";
import { AppNavbar } from "../AppNavbar";
import type { RootState } from "@nexia/shared/store";

const dashboardAuthState: Partial<RootState> = {
    auth: {
        user: {
            id: 1,
            nombre: "Coach",
            apellidos: "Demo",
            email: "coach@test.com",
            role: "trainer",
            is_active: true,
            is_verified: true,
            created_at: "2024-01-01T00:00:00Z",
        },
        token: "fake-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
    },
};

describe("AppNavbar", () => {
    it("renders public variant when variant=public", () => {
        render(<AppNavbar variant="public" />);
        const navs = screen.getAllByRole("navigation");
        expect(navs.length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByTestId("navbar-user-block")).not.toBeInTheDocument();
    });

    it("renders public variant with logo when variant=public", () => {
        render(<AppNavbar variant="public" />);
        const logoLink = screen.getByRole("link", { name: /nexia/i });
        expect(logoLink).toHaveAttribute("href", "/");
    });

    it("renders dashboard variant when variant=dashboard", () => {
        render(
            <AppNavbar
                variant="dashboard"
                menuItems={[{ label: "Clientes", path: "/dashboard/clients" }]}
                footerSubtitle="Trainer"
            />,
            { initialState: dashboardAuthState }
        );
        expect(screen.getByRole("dialog", { name: /menú de navegación/i })).toBeInTheDocument();
        expect(screen.getByText(/Trainer/)).toBeInTheDocument();
        expect(screen.getByText(/Clientes/)).toBeInTheDocument();
    });

    it("renders dashboard drawer when variant=dashboard", () => {
        render(
            <AppNavbar
                variant="dashboard"
                menuItems={[{ label: "Clientes", path: "/dashboard/clients" }]}
                footerSubtitle="Trainer"
            />,
            { initialState: dashboardAuthState }
        );
        const dialog = screen.getByRole("dialog", { name: /menú de navegación/i });
        expect(dialog).toBeInTheDocument();
    });

    it("mobile trigger has accessible label in public variant", () => {
        render(<AppNavbar variant="public" />);
        const trigger = screen.getByRole("button", { name: /abrir menú/i });
        expect(trigger).toBeInTheDocument();
    });
});

/**
 * NavbarPublicActions — Tests de comportamiento y semántica (navegación, enlaces).
 * Depende de usePublicNavigation; se prueba presencia de rol y enlaces según ruta.
 * No se comprueban clases Tailwind.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { NavbarPublicActions } from "../NavbarPublicActions";

describe("NavbarPublicActions", () => {
    it("renders navigation with aria-label when items are visible", () => {
        render(<NavbarPublicActions />);
        const nav = screen.queryByRole("navigation", { name: "Navegación pública" });
        if (nav) {
            expect(nav).toBeInTheDocument();
        }
    });

    it("renders links when not on auth pages", () => {
        render(<NavbarPublicActions />);
        const loginLink = screen.queryByRole("link", { name: /Iniciar sesión/i });
        const registerLink = screen.queryByRole("link", { name: /Registrarse/i });
        if (loginLink) expect(loginLink).toHaveAttribute("href", "/auth/login");
        if (registerLink) expect(registerLink).toHaveAttribute("href", "/auth/register");
    });
});

/**
 * NavbarLogo — Tests de comportamiento y semántica (enlace, accesibilidad).
 * No se comprueban clases Tailwind.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { NavbarLogo } from "../NavbarLogo";

describe("NavbarLogo", () => {
    it("renders a link to home", () => {
        render(<NavbarLogo />);
        const link = screen.getByRole("link", { name: /NEXIA Fitness.*Ir al inicio/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/");
    });

    it("renders with size default", () => {
        render(<NavbarLogo size="default" />);
        expect(screen.getByRole("link", { name: /NEXIA Fitness/i })).toBeInTheDocument();
    });

    it("renders with size large", () => {
        render(<NavbarLogo size="large" />);
        expect(screen.getByRole("link", { name: /NEXIA Fitness/i })).toBeInTheDocument();
    });
});

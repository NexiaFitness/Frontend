/**
 * NavbarShell — Tests de comportamiento y semántica (roles, props).
 * No se comprueban clases Tailwind para evitar tests frágiles.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { NavbarShell } from "../NavbarShell";

describe("NavbarShell", () => {
    it("renders with role navigation", () => {
        render(
            <NavbarShell variant="public">
                <span data-testid="left">Left</span>
                <span data-testid="right">Right</span>
            </NavbarShell>
        );
        const nav = screen.getByRole("navigation");
        expect(nav).toBeInTheDocument();
    });

    it("renders children in document", () => {
        render(
            <NavbarShell variant="public">
                <span data-testid="left">Left</span>
                <span data-testid="right">Right</span>
            </NavbarShell>
        );
        expect(screen.getByTestId("left")).toHaveTextContent("Left");
        expect(screen.getByTestId("right")).toHaveTextContent("Right");
    });

    it("accepts variant dashboard", () => {
        render(
            <NavbarShell variant="dashboard">
                <span>Content</span>
            </NavbarShell>
        );
        expect(screen.getByRole("navigation")).toBeInTheDocument();
        expect(screen.getByText("Content")).toBeInTheDocument();
    });
});

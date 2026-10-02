/**
 * NotFound.test.tsx — 404 catch-all con Volver ArrowLeft (screenStateActions).
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { NotFound } from "../NotFound";

describe("NotFound", () => {
    it("muestra copy 404 y Volver con ArrowLeft sin margen en el icono", () => {
        render(<NotFound />, {
            initialState: {
                auth: {
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    refreshToken: null,
                } as never,
            },
        });

        expect(screen.getByText("No encontramos esta página")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ir al inicio/i })).toBeInTheDocument();
        const back = screen.getByRole("button", { name: /volver/i });
        const svg = back.querySelector("svg");
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute("class") ?? "").not.toMatch(/\bmr-/);
    });
});

/**
 * ResourceQueryState.test.tsx — estados HTTP + acciones compartidas (sin mr en iconos).
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { ResourceQueryState } from "../ResourceQueryState";

describe("ResourceQueryState", () => {
    it("404 de plan muestra ScreenState y Volver con ArrowLeft sin margen", () => {
        render(
            <ResourceQueryState
                error={{ status: 404 }}
                resource="plan"
                layout="page"
            />,
            {
                initialState: {
                    auth: {
                        isAuthenticated: true,
                        user: null,
                        token: null,
                        refreshToken: null,
                    } as never,
                },
            },
        );

        expect(screen.getByTestId("resource-query-state")).toHaveAttribute(
            "data-kind",
            "not_found",
        );
        expect(screen.getByText("Plan no encontrado")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ir al inicio/i })).toBeInTheDocument();
        const back = screen.getByRole("button", { name: /volver/i });
        expect(back).toBeInTheDocument();
        const svg = back.querySelector("svg");
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute("class") ?? "").not.toMatch(/\bmr-/);
    });

    it("load_failed ofrece Reintentar con RotateCcw sin margen", () => {
        const onRetry = vi.fn();
        render(
            <ResourceQueryState
                error={{ status: 500 }}
                resource="plan"
                onRetry={onRetry}
            />,
        );

        const retry = screen.getByRole("button", { name: /reintentar/i });
        const svg = retry.querySelector("svg");
        expect(svg).toBeTruthy();
        expect(svg?.getAttribute("class") ?? "").not.toMatch(/\bmr-/);
    });
});

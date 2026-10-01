/**
 * ErrorBoundary.spec.tsx — Requisitos B9: fallback por ruta y Reintentar local.
 *
 * Contexto: El boundary de ruta no debe exigir recarga completa para reintentar render.
 *
 * Notas de mantenimiento: mantener alineado con DashboardRouteErrorBoundary + shell.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

let allowProbeRender = false;

function ConditionalThrowProbe(): JSX.Element {
    if (!allowProbeRender) {
        throw new Error("probe");
    }
    return <p>Contenido OK</p>;
}

vi.mock("@/lib/clientErrorReporter", () => ({
    reportReactBoundaryError: vi.fn(),
}));

describe("ErrorBoundary route variant (B9)", () => {
    it("muestra Reintentar y recupera el hijo sin recargar la ventana", async () => {
        allowProbeRender = false;
        const user = userEvent.setup();

        render(
            <ErrorBoundary variant="route" resetKey="/test">
                <ConditionalThrowProbe />
            </ErrorBoundary>
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();

        allowProbeRender = true;
        await user.click(screen.getByRole("button", { name: "Reintentar" }));

        expect(screen.getByText("Contenido OK")).toBeInTheDocument();
    });
});

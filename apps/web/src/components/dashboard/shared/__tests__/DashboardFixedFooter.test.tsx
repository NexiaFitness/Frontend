/**
 * DashboardFixedFooter.test.tsx — Contrato pointer-events del footer fijo (UX-FOOT-01).
 *
 * Contexto: el shell no debe interceptar clics fuera de botones/enlaces hijos.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { render, screen } from "@testing-library/react";
import { DashboardFixedFooter } from "../DashboardFixedFooter";

describe("DashboardFixedFooter", () => {
    it("shell pointer-events-none; solo hijos interactivos capturan clics", () => {
        render(
            <DashboardFixedFooter>
                <button type="button">Guardar</button>
            </DashboardFixedFooter>,
        );

        const shell = screen.getByTestId("dashboard-fixed-footer");
        expect(shell.className).toContain("pointer-events-none");

        const actionWrap = shell.firstElementChild;
        expect(actionWrap).not.toBeNull();
        expect(actionWrap?.className).toContain("pointer-events-none");
        expect(actionWrap?.className).toContain("[&_button]:pointer-events-auto");

        expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
    });
});

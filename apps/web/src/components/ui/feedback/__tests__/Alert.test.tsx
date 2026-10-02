/**
 * Alert.test.tsx — Regresión: reenvío de atributos HTML al root (`data-testid`, etc.).
 *
 * Causa raíz cubierta: `Alert` extendía props propias sin `...rest` en el `<div>`,
 * por lo que `data-testid` se perdía (QA Parte 3 / session-day-structure-gap).
 *
 * @see DESIGN_PREMIUM.md §5.2
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { Alert } from "../Alert";

describe("Alert attribute forwarding", () => {
    it("reenvía data-testid al contenedor role=alert", () => {
        render(
            <Alert variant="warning" data-testid="session-day-structure-gap">
                <p>Hueco de estructura</p>
            </Alert>,
        );

        const el = screen.getByTestId("session-day-structure-gap");
        expect(el).toHaveAttribute("role", "alert");
        expect(el).toHaveTextContent("Hueco de estructura");
    });

    it("reenvía aria-label y className sin romper el role", () => {
        render(
            <Alert
                variant="info"
                data-testid="alert-attrs"
                aria-label="Aviso informativo"
                className="mt-2"
            >
                Info
            </Alert>,
        );

        const el = screen.getByTestId("alert-attrs");
        expect(el).toHaveAttribute("role", "alert");
        expect(el).toHaveAttribute("aria-label", "Aviso informativo");
        expect(el.className).toMatch(/mt-2/);
    });
});

/**
 * Alert.test.tsx — API unificada, ARIA por variante y reenvío de atributos.
 *
 * Contexto: A0 feedback unificado. error → role=alert; warning|info|success → status.
 *
 * @see DESIGN_PREMIUM.md §5.2
 * @author Frontend Team
 * @since v9.2.0
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { Alert } from "../Alert";
import { alertAriaLive, alertAriaRole } from "../alertContract";

describe("alertContract ARIA", () => {
    it("mapea error a alert/assertive y el resto a status/polite", () => {
        expect(alertAriaRole("error")).toBe("alert");
        expect(alertAriaLive("error")).toBe("assertive");
        for (const v of ["warning", "info", "success"] as const) {
            expect(alertAriaRole(v)).toBe("status");
            expect(alertAriaLive(v)).toBe("polite");
        }
    });
});

describe("Alert attribute forwarding", () => {
    it("reenvía data-testid al contenedor con role según variante", () => {
        render(
            <Alert variant="warning" data-testid="session-day-structure-gap">
                <p>Hueco de estructura</p>
            </Alert>,
        );

        const el = screen.getByTestId("session-day-structure-gap");
        expect(el).toHaveAttribute("role", "status");
        expect(el).toHaveAttribute("aria-live", "polite");
        expect(el).toHaveTextContent("Hueco de estructura");
    });

    it("usa role=alert y aria-live assertive en error", () => {
        render(
            <Alert variant="error" data-testid="alert-error">
                Fallo
            </Alert>,
        );

        const el = screen.getByTestId("alert-error");
        expect(el).toHaveAttribute("role", "alert");
        expect(el).toHaveAttribute("aria-live", "assertive");
        expect(screen.getByRole("alert")).toBe(el);
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
        expect(el).toHaveAttribute("role", "status");
        expect(el).toHaveAttribute("aria-label", "Aviso informativo");
        expect(el.className).toMatch(/mt-2/);
    });
});

describe("Alert API title/description/action/icon", () => {
    it("renderiza title y description", () => {
        render(
            <Alert
                variant="error"
                title="No se pudo cargar"
                description="Inténtalo de nuevo."
            />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar");
        expect(screen.getByRole("alert")).toHaveTextContent("Inténtalo de nuevo.");
    });

    it("renderiza action y onDismiss", async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();
        const onRetry = vi.fn();

        render(
            <Alert
                variant="error"
                title="Error"
                onDismiss={onDismiss}
                action={
                    <button type="button" onClick={onRetry}>
                        Reintentar
                    </button>
                }
            />,
        );

        await user.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(onRetry).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "Cerrar alerta" }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("oculta el icono semántico cuando icon=false", () => {
        const { container } = render(
            <Alert variant="warning" icon={false} title="Sin icono" />,
        );

        expect(container.querySelector("svg")).toBeNull();
        expect(screen.getByRole("status")).toHaveTextContent("Sin icono");
    });
});

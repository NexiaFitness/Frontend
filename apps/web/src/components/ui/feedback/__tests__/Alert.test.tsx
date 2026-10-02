/**
 * Alert.test.tsx — API unificada, ARIA, iconos, dismiss y matriz de combinaciones.
 *
 * Contexto: A0b feedback (DESIGN_PREMIUM.md §5.2). error → role=alert;
 * warning|info|success → status. Error icon = CircleAlert (no X).
 *
 * @author Frontend Team
 * @since v9.2.0
 * @updated v9.2.1 — matriz variantes × title/action/dismiss × líneas
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { Alert } from "../Alert";
import { alertAriaLive, alertAriaRole, type AlertVariant } from "../alertContract";
import { ALERT_ACTION_BUTTON_VARIANT } from "../alertPresentation";

const VARIANTS: AlertVariant[] = ["info", "success", "warning", "error"];

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

describe("Alert iconografía §5.2", () => {
    it("error usa CircleAlert (data-tone=error), no X como icono semántico", () => {
        render(<Alert variant="error" title="Error de login" onDismiss={() => undefined} />);

        const icon = screen
            .getByTestId("alert-icon-slot")
            .querySelector("[data-nexia-semantic-tone='error']");
        expect(icon).not.toBeNull();
        expect(icon?.tagName.toLowerCase()).toBe("svg");

        const dismiss = screen.getByRole("button", { name: "Cerrar aviso" });
        expect(dismiss.querySelector("svg")).not.toBeNull();
        // Icono semántico ≠ botón cerrar (no doble X de mismo glyph)
        expect(
            screen.getByTestId("alert-icon-slot").querySelector("svg"),
        ).not.toBe(dismiss.querySelector("svg"));
    });

    it("warning/info/success conservan tones semánticos", () => {
        const { rerender } = render(<Alert variant="warning" title="W" />);
        expect(
            screen
                .getByTestId("alert-icon-slot")
                .querySelector("[data-nexia-semantic-tone='warning']"),
        ).not.toBeNull();

        rerender(<Alert variant="info" title="I" />);
        expect(
            screen
                .getByTestId("alert-icon-slot")
                .querySelector("[data-nexia-semantic-tone='info']"),
        ).not.toBeNull();

        rerender(<Alert variant="success" title="S" />);
        expect(
            screen
                .getByTestId("alert-icon-slot")
                .querySelector("[data-nexia-semantic-tone='success']"),
        ).not.toBeNull();
    });

    it("documenta variante de acción ghost-primary", () => {
        expect(ALERT_ACTION_BUTTON_VARIANT).toBe("ghost-primary");
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

    it("renderiza action y onDismiss con aria-label Cerrar aviso", async () => {
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

        await user.click(screen.getByRole("button", { name: "Cerrar aviso" }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("oculta el icono semántico cuando icon=false", () => {
        const { container } = render(
            <Alert variant="warning" icon={false} title="Sin icono" />,
        );

        expect(container.querySelector("[data-nexia-semantic-tone]")).toBeNull();
        expect(screen.getByRole("status")).toHaveTextContent("Sin icono");
    });

    it("modo compact mantiene role=status en warning", () => {
        render(<Alert variant="warning" compact title="Callout compacto" />);

        const el = screen.getByRole("status");
        expect(el).toHaveAttribute("aria-live", "polite");
        expect(el.className).toMatch(/px-3/);
        expect(el).toHaveTextContent("Callout compacto");
    });
});

describe("Alert matriz variantes × title/action/dismiss × líneas", () => {
    it.each(VARIANTS)(
        "%s: sin título, sin acción, sin dismiss (una línea)",
        (variant) => {
            render(
                <Alert variant={variant} data-testid={`m-${variant}-bare`}>
                    Mensaje corto
                </Alert>,
            );
            const el = screen.getByTestId(`m-${variant}-bare`);
            expect(el).toHaveAttribute("role", alertAriaRole(variant));
            expect(el).toHaveTextContent("Mensaje corto");
            expect(screen.queryByRole("button", { name: "Cerrar aviso" })).toBeNull();
        },
    );

    it.each(VARIANTS)("%s: con título + descripción multilínea + acción + dismiss", (variant) => {
        render(
            <Alert
                variant={variant}
                data-testid={`m-${variant}-full`}
                title="Título del aviso"
                description={
                    <>
                        Primera línea de detalle.
                        <br />
                        Segunda línea de detalle para alinear icono a la primera.
                    </>
                }
                onDismiss={() => undefined}
                action={
                    <button type="button">Acción única</button>
                }
            />,
        );

        const el = screen.getByTestId(`m-${variant}-full`);
        expect(el).toHaveAttribute("role", alertAriaRole(variant));
        expect(el).toHaveTextContent("Título del aviso");
        expect(el).toHaveTextContent("Segunda línea de detalle");
        expect(screen.getByRole("button", { name: "Acción única" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cerrar aviso" })).toBeInTheDocument();
        expect(screen.getByTestId("alert-icon-slot")).toBeInTheDocument();
        expect(screen.getByTestId("alert-dismiss-slot")).toBeInTheDocument();
    });

    it.each(VARIANTS)("%s: solo título + dismiss, sin acción", (variant) => {
        render(
            <Alert
                variant={variant}
                title="Solo título"
                onDismiss={() => undefined}
                data-testid={`m-${variant}-title-dismiss`}
            />,
        );
        expect(screen.getByTestId(`m-${variant}-title-dismiss`)).toHaveTextContent("Solo título");
        expect(screen.getByRole("button", { name: "Cerrar aviso" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Acción única" })).toBeNull();
    });

    it.each(VARIANTS)("%s: sin título, con acción, sin dismiss", (variant) => {
        render(
            <Alert
                variant={variant}
                data-testid={`m-${variant}-action`}
                action={<button type="button">Ir</button>}
            >
                Cuerpo sin título
            </Alert>,
        );
        expect(screen.getByTestId(`m-${variant}-action`)).toHaveTextContent("Cuerpo sin título");
        expect(screen.getByRole("button", { name: "Ir" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Cerrar aviso" })).toBeNull();
    });
});

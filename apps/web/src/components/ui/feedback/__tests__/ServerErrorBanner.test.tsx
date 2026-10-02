/**
 * ServerErrorBanner.test.tsx — Wrapper sobre Alert error (A3).
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v9.2.0 — ARIA alert/assertive; sin bg-red-50
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ServerErrorBanner } from "../ServerErrorBanner";

describe("ServerErrorBanner", () => {
    it("no renderiza con error null o vacío", () => {
        const { container: c1 } = render(<ServerErrorBanner error={null} />);
        expect(c1.querySelector("[data-testid=server-error-banner]")).toBeNull();

        const { container: c2 } = render(<ServerErrorBanner error="" />);
        expect(c2.querySelector("[data-testid=server-error-banner]")).toBeNull();

        const { container: c3 } = render(<ServerErrorBanner error="   " />);
        expect(c3.querySelector("[data-testid=server-error-banner]")).toBeNull();
    });

    it("muestra el mensaje con role=alert y aria-live assertive", () => {
        render(<ServerErrorBanner error="Something went wrong" />);

        const el = screen.getByTestId("server-error-banner");
        expect(el).toHaveAttribute("role", "alert");
        expect(el).toHaveAttribute("aria-live", "assertive");
        expect(el).toHaveTextContent("Something went wrong");
        expect(screen.getByRole("alert")).toBe(el);
    });

    it("llama onDismiss al cerrar", async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();
        render(
            <ServerErrorBanner error="Dismissible error" onDismiss={onDismiss} />,
        );

        await user.click(screen.getByRole("button", { name: "Cerrar alerta" }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("no muestra botón de cierre sin onDismiss", () => {
        render(<ServerErrorBanner error="Non-dismissible error" />);
        expect(
            screen.queryByRole("button", { name: "Cerrar alerta" }),
        ).not.toBeInTheDocument();
    });
});

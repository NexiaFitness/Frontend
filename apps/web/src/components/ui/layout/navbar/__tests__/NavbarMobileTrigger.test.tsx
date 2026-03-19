/**
 * NavbarMobileTrigger — Tests de comportamiento (click, aria, estado).
 * No se comprueban clases Tailwind.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { NavbarMobileTrigger } from "../NavbarMobileTrigger";

describe("NavbarMobileTrigger", () => {
    it("renders a button with aria-label", () => {
        render(
            <NavbarMobileTrigger
                onClick={() => {}}
                isOpen={false}
                aria-label="Abrir menú"
            />
        );
        const button = screen.getByRole("button", { name: "Abrir menú" });
        expect(button).toBeInTheDocument();
    });

    it("sets aria-expanded to false when closed", () => {
        render(
            <NavbarMobileTrigger
                onClick={() => {}}
                isOpen={false}
                aria-label="Abrir menú"
            />
        );
        expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    });

    it("sets aria-expanded to true when open", () => {
        render(
            <NavbarMobileTrigger
                onClick={() => {}}
                isOpen={true}
                aria-label="Cerrar menú"
            />
        );
        expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    it("calls onClick when clicked", async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(
            <NavbarMobileTrigger
                onClick={onClick}
                isOpen={false}
                aria-label="Abrir menú"
            />
        );
        await user.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});

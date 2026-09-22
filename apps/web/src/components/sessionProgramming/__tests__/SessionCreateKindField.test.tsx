/**
 * SessionCreateKindField — variantes D2 (segmented vs none).
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionCreateKindField } from "../SessionCreateKindField";

describe("SessionCreateKindField", () => {
    it("none — no renderiza nada", () => {
        const { container } = render(
            <SessionCreateKindField
                ui={{ variant: "none" }}
                value="program"
                onChange={vi.fn()}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("segmented — tabs Programa y Sesión suelta", () => {
        render(
            <SessionCreateKindField
                ui={{ variant: "segmented" }}
                value="program"
                onChange={vi.fn()}
            />,
        );
        expect(screen.getByRole("tab", { name: "Programa" })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: "Sesión suelta" })).toBeInTheDocument();
    });

    it("implicit_standalone — volver a programa", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <SessionCreateKindField
                ui={{ variant: "implicit_standalone", showProgramSwitch: true }}
                value="standalone"
                onChange={onChange}
            />,
        );
        await user.click(screen.getByRole("button", { name: /Volver a programa/i }));
        expect(onChange).toHaveBeenCalledWith("program");
    });
});

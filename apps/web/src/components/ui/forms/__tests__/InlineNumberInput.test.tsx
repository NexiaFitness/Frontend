/**
 * InlineNumberInput Component Test Suite
 *
 * Tests para el input numérico compacto usado en constructores.
 * Cubre renderizado, edición libre, filtrado de caracteres no numéricos,
 * botones stepper, clamp en blur, disabled y forwardRef.
 *
 * @since v8.2.0
 */

import React, { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { InlineNumberInput } from "../InlineNumberInput";

function ControlledInlineNumberInput(
    props: Omit<React.ComponentProps<typeof InlineNumberInput>, "value" | "onChange"> & {
        initialValue?: string | number;
    }
) {
    const { initialValue = "", ...rest } = props;
    const [value, setValue] = useState<string | number>(initialValue);
    return <InlineNumberInput {...rest} value={value} onChange={(e) => setValue(e.target.value)} />;
}

describe("InlineNumberInput", () => {
    it("renders as a text input with numeric entry mode", () => {
        render(<ControlledInlineNumberInput aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        expect(input).toHaveAttribute("type", "text");
        expect(input).toHaveAttribute("inputMode", "numeric");
        expect(input).toHaveAttribute("pattern", "[0-9]*");
    });

    it("renders the provided numeric value", () => {
        render(<ControlledInlineNumberInput initialValue={10} aria-label="Valor" />);

        expect(screen.getByLabelText("Valor")).toHaveValue("10");
    });

    it("allows typing digits freely", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.type(input, "25");

        expect(input).toHaveValue("25");
    });

    it("filters out non-numeric characters", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.type(input, "a1b2c");

        expect(input).toHaveValue("12");
    });

    it("strips leading zeros while keeping a single zero", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.type(input, "007");

        expect(input).toHaveValue("7");
    });

    it("allows clearing the value to empty string", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput initialValue="10" aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.clear(input);

        expect(input).toHaveValue("");
    });

    it("increments value with the up button", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput initialValue="10" min={1} max={20} aria-label="Valor" />);

        const upButton = screen.getByRole("button", { name: /incrementar/i });
        await user.click(upButton);

        expect(screen.getByLabelText("Valor")).toHaveValue("11");
    });

    it("decrements value with the down button respecting min", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput initialValue="1" min={1} max={20} aria-label="Valor" />);

        const downButton = screen.getByRole("button", { name: /decrementar/i });
        await user.click(downButton);

        expect(screen.getByLabelText("Valor")).toHaveValue("1");
    });

    it("clamps value to max on blur", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput min={1} max={10} aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.type(input, "25");
        await user.tab();

        expect(input).toHaveValue("10");
    });

    it("clamps value to min on blur", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput min={5} max={10} aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.type(input, "2");
        await user.tab();

        expect(input).toHaveValue("5");
    });

    it("does not clamp empty value on blur", async () => {
        const user = userEvent.setup();
        render(<ControlledInlineNumberInput initialValue="10" min={5} max={10} aria-label="Valor" />);

        const input = screen.getByLabelText("Valor");
        await user.clear(input);
        await user.tab();

        expect(input).toHaveValue("");
    });

    it("disables buttons and input when disabled", () => {
        render(<ControlledInlineNumberInput initialValue="10" disabled aria-label="Valor" />);

        expect(screen.getByLabelText("Valor")).toBeDisabled();
        expect(screen.getByRole("button", { name: /incrementar/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /decrementar/i })).toBeDisabled();
    });

    it("forwards ref correctly", () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<InlineNumberInput ref={ref} value="10" onChange={() => {}} aria-label="Valor" />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toHaveValue("10");
    });
});

/**
 * AddPill — contrato visual y variantes premium/compact.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddPill, AddPillGrid } from "@/components/ui/chips";

describe("AddPill", () => {
    it("renderiza label con prefijo + y dispara onClick", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <AddPill label="Hipertrofia" onClick={onClick} variant="premium" />,
        );

        const pill = screen.getByRole("button", { name: /\+ hipertrofia/i });
        expect(pill).toBeInTheDocument();
        await user.click(pill);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("AddPillGrid premium inline usa flex wrap (MDS)", () => {
        const { container } = render(
            <AddPillGrid variant="premium">
                <AddPill label="Potencia" onClick={vi.fn()} />
            </AddPillGrid>,
        );

        expect(container.firstChild).toHaveClass("flex");
        expect(container.firstChild).toHaveClass("flex-wrap");
    });

    it("AddPillGrid premium layout grid opcional", () => {
        const { container } = render(
            <AddPillGrid variant="premium" layout="grid">
                <AddPill label="Potencia" onClick={vi.fn()} fullWidth />
            </AddPillGrid>,
        );

        expect(container.firstChild).toHaveClass("grid");
    });
});

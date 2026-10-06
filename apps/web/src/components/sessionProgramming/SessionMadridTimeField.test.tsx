import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionMadridTimeField } from "./SessionMadridTimeField";

describe("SessionMadridTimeField I17", () => {
    it("explica hora inexistente de Madrid al entrenador", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const { rerender } = render(
            <SessionMadridTimeField dateKey="2026-03-29" value="" onChange={onChange} />
        );
        await user.click(screen.getByRole("button", { name: "Hora de la sesión" }));
        await user.click(screen.getByRole("option", { name: "02:30" }));
        expect(onChange).toHaveBeenCalledWith("02:30");
        rerender(
            <SessionMadridTimeField dateKey="2026-03-29" value="02:30" onChange={onChange} />
        );
        expect(screen.getByRole("alert")).toHaveTextContent(/no existe en Madrid/i);
    });

    it("explica hora ambigua de Madrid al entrenador", () => {
        render(
            <SessionMadridTimeField dateKey="2026-10-25" value="02:30" onChange={vi.fn()} />
        );
        expect(screen.getByRole("alert")).toHaveTextContent(/dos veces/i);
    });
});

/**
 * WeekAccordionHeader.test.tsx — Restaurar es botón hermano, no anidado.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render } from "@/test-utils/render";
import { WeekAccordionHeader } from "../WeekAccordionHeader";

describe("WeekAccordionHeader", () => {
    it("Restaurar es un botón hermano, no anidado dentro del de expandir", async () => {
        const onRestore = vi.fn();
        const { container } = render(
            <WeekAccordionHeader
                weekOrdinal={2}
                weekRange="10–16 nov"
                configured={1}
                total={3}
                isExpanded
                weekKind="personalizada"
                showRestore
                onToggle={vi.fn()}
                onRestore={onRestore}
            />,
        );

        const restore = screen.getByRole("button", {
            name: /restaurar semana tipo de la semana 2/i,
        });

        expect(restore.closest("button")).toBe(restore);
        expect(container.querySelector("button button")).toBeNull();

        await userEvent.click(restore);
        expect(onRestore).toHaveBeenCalledTimes(1);
    });
});

/**
 * BlockCalendarRangeHint.test.tsx
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render } from "@/test-utils/render";
import { BlockCalendarRangeHint } from "../BlockCalendarRangeHint";

describe("BlockCalendarRangeHint", () => {
    it("muestra instrucción en idle", () => {
        render(
            <BlockCalendarRangeHint formPhase="idle" startDate={null} />,
        );

        expect(
            screen.getByText(/haz clic en un día del calendario/i),
        ).toBeInTheDocument();
    });

    it("muestra inicio en rangeStart sin botón cancelar", () => {
        render(
            <BlockCalendarRangeHint
                formPhase="rangeStart"
                startDate="2026-09-01"
            />,
        );

        expect(screen.getByText(/^Inicio$/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /cancelar/i })).not.toBeInTheDocument();
    });

    it("muestra continuar en rangeComplete", async () => {
        const onContinue = vi.fn();
        render(
            <BlockCalendarRangeHint
                formPhase="rangeComplete"
                startDate="2026-09-01"
                endDate="2026-09-14"
                onContinue={onContinue}
            />,
        );

        expect(
            screen.getByText(/haz clic en cualquier día del calendario/i),
        ).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
        expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("deshabilita continuar cuando el rango no es válido", () => {
        render(
            <BlockCalendarRangeHint
                formPhase="rangeComplete"
                startDate="2026-09-01"
                endDate="2026-09-14"
                onContinue={vi.fn()}
                canContinue={false}
                continueDisabledReason="El rango se solapa con otro bloque."
            />,
        );

        expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
        expect(screen.getByText(/se solapa con otro bloque/i)).toBeInTheDocument();
    });
});

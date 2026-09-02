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
            screen.getByText(/haz clic en una fecha del calendario/i),
        ).toBeInTheDocument();
    });

    it("muestra inicio y cancelar en rangeStart", async () => {
        const onCancel = vi.fn();
        render(
            <BlockCalendarRangeHint
                formPhase="rangeStart"
                startDate="2026-09-01"
                onCancel={onCancel}
            />,
        );

        expect(screen.getByText(/inicio:/i)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});

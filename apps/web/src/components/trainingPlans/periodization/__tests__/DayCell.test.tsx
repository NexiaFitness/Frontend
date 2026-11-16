/**
 * DayCell.test.tsx — Fila de día del gestor de semanas con fecha legible (B-19).
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import { render, screen } from "@testing-library/react";

import { DayCell } from "../DayCell";

describe("DayCell", () => {
    it("muestra el día con el formato común, no la fecha ISO", () => {
        render(
            <DayCell
                layout="row"
                pickerPlacement="inline"
                weekOrdinal={1}
                dayOfWeek={2}
                dateISO="2026-11-10"
                dayName="Martes"
                assignedPatterns={[]}
                catalog={[]}
                isPopoverOpen={false}
                onOpenPopover={vi.fn()}
                onClosePopover={vi.fn()}
                onToggle={vi.fn()}
            />,
        );

        expect(screen.getByText("10 nov 2026")).toBeInTheDocument();
        expect(screen.queryByText("2026-11-10")).not.toBeInTheDocument();
    });
});

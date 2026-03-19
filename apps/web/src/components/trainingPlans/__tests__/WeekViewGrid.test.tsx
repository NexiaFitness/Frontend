/**
 * WeekViewGrid Test Suite — Fase 5
 *
 * Tests para la vista semana L-D: loading, empty, 7 columnas con datos mock.
 * Sin sesiones en días para evitar llamadas a coherence API en tests básicos.
 *
 * @author Frontend Team
 * @since Fase 5 — Vista semana L-D
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { WeekViewGrid } from "../WeekViewGrid";
import type { WeekDayData } from "@nexia/shared/hooks/training/useWeekPlanningData";

function createMockDay(overrides: Partial<WeekDayData> = {}): WeekDayData {
    return {
        date: "2026-01-05",
        dayLabel: "L",
        planned: { volume: 8, intensity: 7 },
        programmed: null,
        session: null,
        coherencePct: null,
        hasPlanSession: false,
        ...overrides,
    };
}

describe("WeekViewGrid", () => {
    it("muestra loading cuando isLoading es true", () => {
        render(<WeekViewGrid days={[]} isLoading />);
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });

    it("muestra mensaje vacío cuando days está vacío y no loading", () => {
        render(<WeekViewGrid days={[]} isLoading={false} />);
        expect(screen.getByText("No hay datos para esta semana.")).toBeInTheDocument();
    });

    it("renderiza 7 celdas con etiquetas L-D cuando hay datos", () => {
        const labels = ["L", "M", "X", "J", "V", "S", "D"];
        const dates = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11"];
        const days: WeekDayData[] = dates.map((date, idx) =>
            createMockDay({
                date,
                dayLabel: labels[idx],
                planned: { volume: 8, intensity: 7 },
            })
        );

        render(<WeekViewGrid days={days} isLoading={false} />);

        const grid = screen.getByRole("grid", {
            name: /Vista semana L–D con valor planificado/i,
        });
        expect(grid).toBeInTheDocument();

        expect(screen.getByText("L 05")).toBeInTheDocument();
        expect(screen.getByText("M 06")).toBeInTheDocument();
        expect(screen.getByText("D 11")).toBeInTheDocument();
        expect(screen.getAllByText(/Plan:/).length).toBe(7);
    });

    it("muestra Plan y Prog con valores cuando hay datos planificados y programados", () => {
        const days: WeekDayData[] = [
            createMockDay({
                date: "2026-01-05",
                dayLabel: "L",
                planned: { volume: 8, intensity: 7 },
                programmed: { volume: 8, intensity: 6 },
                hasPlanSession: false,
            }),
            ...Array(6)
                .fill(null)
                .map((_, i) =>
                    createMockDay({
                        date: `2026-01-0${6 + i}`,
                        dayLabel: ["M", "X", "J", "V", "S", "D"][i],
                    })
                ),
        ];

        render(<WeekViewGrid days={days} isLoading={false} />);

        expect(screen.getAllByText("V 8 / I 7").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("V 8 / I 6")).toBeInTheDocument();
    });
});

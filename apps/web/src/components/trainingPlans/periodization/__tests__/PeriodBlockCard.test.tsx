/**
 * PeriodBlockCard — lectura sin barras (chips + franja carga textual).
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type {
    PlanPeriodBlock,
    PhysicalQuality,
} from "@nexia/shared/types/planningCargas";

import { PeriodBlockCard } from "../PeriodBlockCard";

const catalog: PhysicalQuality[] = [
    {
        id: 1,
        name: "Hipertrofia",
        slug: "hipertrofia",
        modality: "strength",
        has_volume: true,
        display_order: 1,
    },
    {
        id: 2,
        name: "Fuerza máxima",
        slug: "fuerza_maxima",
        modality: "strength",
        has_volume: true,
        display_order: 2,
    },
];

const block: PlanPeriodBlock = {
    id: 42,
    training_plan_id: 10,
    name: null,
    goal: null,
    start_date: "2026-09-16",
    end_date: "2026-10-31",
    volume_level: 7,
    intensity_level: 7,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: true,
    qualities: [
        {
            id: 1,
            physical_quality_id: 1,
            percentage: 50,
            physical_quality_name: "Hipertrofia",
            physical_quality_slug: "hipertrofia",
            evaluation_binding: null,
        },
        {
            id: 2,
            physical_quality_id: 2,
            percentage: 50,
            physical_quality_name: "Fuerza máxima",
            physical_quality_slug: "fuerza_maxima",
            evaluation_binding: null,
        },
    ],
};

function renderCard(overrides: Partial<PlanPeriodBlock> = {}) {
    return render(
        <MemoryRouter>
            <PeriodBlockCard
                block={{ ...block, ...overrides }}
                catalog={catalog}
                onDelete={vi.fn()}
            />
        </MemoryRouter>,
    );
}

describe("PeriodBlockCard", () => {
    it("muestra chips de cualidad con porcentaje y sin progressbar", () => {
        const { container } = renderCard();

        expect(screen.getByText("Hipertrofia")).toBeInTheDocument();
        expect(screen.getByText("Fuerza máxima")).toBeInTheDocument();
        expect(screen.getAllByText("50%")).toHaveLength(2);
        expect(container.querySelector('[role="progressbar"]')).toBeNull();
        expect(container.querySelector('input[type="range"]')).toBeNull();
    });

    it("muestra franja de carga con valores 7/10 y etiquetas cualitativas", () => {
        renderCard();

        const strip = screen.getByTestId("period-block-card-load-strip");
        expect(strip).toBeInTheDocument();
        expect(strip).toHaveTextContent("Volumen");
        expect(strip).toHaveTextContent("Intensidad");
        expect(strip).toHaveTextContent("7");
        expect(strip).toHaveTextContent("/10");
        expect(strip).toHaveTextContent("Medio-alto");
    });

    it('muestra "Sin cualidades" cuando el bloque no tiene cualidades', () => {
        renderCard({ qualities: [] });
        expect(screen.getByText("Sin cualidades")).toBeInTheDocument();
    });
});

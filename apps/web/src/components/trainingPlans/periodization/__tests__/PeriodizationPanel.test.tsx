/**
 * PeriodizationPanel.test.tsx — Tests de navegación y avisos del constructor.
 *
 * Contexto:
 * - El panel del constructor de bloques es un wizard unidireccional.
 * - Estos tests cubren las mejoras de UX añadidas para el feedback #02:
 *   botón "Volver" y banner informativo cuando faltan días con patrones.
 *
 * @author Frontend Team
 * @since v2.6.1
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render } from "@/test-utils/render";

import type { PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import type { PeriodBlockFormState } from "../usePeriodBlockForm";

import { PeriodizationPanel } from "../PeriodizationPanel";

const mockCatalog: PhysicalQuality[] = [
    {
        id: 1,
        name: "Fuerza",
        slug: "fuerza",
        modality: "strength",
        has_volume: true,
        display_order: 1,
    },
];

const mockPatterns: MovementPattern[] = [
    {
        id: 1,
        name_en: "Push",
        name_es: "Empuje",
        description: null,
        ui_bucket: "UPPER",
        is_active: true,
        created_at: "2026-01-01T00:00:00",
        updated_at: "2026-01-01T00:00:00",
    },
];

const baseFormState: PeriodBlockFormState = {
    phase: "rangeComplete",
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    qualities: [],
    volumeLevel: 5,
    intensityLevel: 5,
    weeklyStructure: [],
    constructorStep: "weeklyStructure",
    completedSteps: ["range", "qualities"],
};

function renderPanel(
    overrides: Partial<Parameters<typeof PeriodizationPanel>[0]> = {},
    formOverrides: Partial<PeriodBlockFormState> = {},
) {
    const formState: PeriodBlockFormState = { ...baseFormState, ...formOverrides };

    return render(
        <PeriodizationPanel
            formState={formState}
            catalog={mockCatalog}
            qualitiesSum={0}
            overlapDetected={false}
            outsidePlanBounds={false}
            canSubmit={false}
            onAddQuality={vi.fn()}
            onRemoveQuality={vi.fn()}
            onUpdateQualityPct={vi.fn()}
            onVolumeChange={vi.fn()}
            onIntensityChange={vi.fn()}
            onSubmit={vi.fn()}
            onReset={vi.fn()}
            onAdvanceStep={vi.fn()}
            onSetConstructorStep={vi.fn()}
            trainingDays={["Monday", "Wednesday", "Friday"]}
            patternsCatalog={mockPatterns}
            onWeeklyStructureChange={vi.fn()}
            {...overrides}
        />,
    );
}

describe("PeriodizationPanel", () => {
    it("muestra el botón Volver cuando no está en el primer paso", () => {
        renderPanel(undefined, { constructorStep: "qualities" });

        expect(screen.getByRole("button", { name: /volver/i })).toBeInTheDocument();
    });

    it("no muestra el botón Volver en el primer paso (range)", () => {
        renderPanel(undefined, { constructorStep: "range" });

        expect(screen.queryByRole("button", { name: /volver/i })).not.toBeInTheDocument();
    });

    it("al pulsar Volver navega al paso anterior", async () => {
        const user = userEvent.setup();
        const onSetConstructorStep = vi.fn();

        renderPanel(
            { onSetConstructorStep },
            { constructorStep: "qualities" },
        );

        const backButton = screen.getByRole("button", { name: /volver/i });
        await user.click(backButton);

        expect(onSetConstructorStep).toHaveBeenCalledTimes(1);
        expect(onSetConstructorStep).toHaveBeenCalledWith("range");
    });

    it("muestra banner informativo cuando faltan días con patrones", () => {
        renderPanel();

        const banner = screen.getByRole("alert");
        expect(banner).toHaveTextContent(/tienes 3 días sin patrones asignados/i);
    });

    it("el banner informativo se cierra al pulsar la X", async () => {
        const user = userEvent.setup();
        renderPanel();

        const banner = screen.getByRole("alert");
        expect(banner).toBeInTheDocument();

        const dismissButton = screen.getByRole("button", { name: /cerrar alerta/i });
        await user.click(dismissButton);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("no muestra el banner cuando todos los días entrenables tienen patrón", () => {
        const weeklyStructure: WeeklyStructureWeekCreate[] = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    { day_of_week: 1, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                    { day_of_week: 3, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                    { day_of_week: 5, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                ],
            },
        ];

        renderPanel(undefined, { weeklyStructure });

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});

/**
 * PeriodizationWeeklyStructureModal.test.tsx — Tests críticos del modal.
 *
 * Spec: docs/specs/estructura-semanal/04_TESTS_CRITICOS.md (T-2 y T-3).
 *
 * Cubrimos:
 * - T-2: cerrar el modal (ESC / boton "Listo") no resetea el draft (no llama onChange).
 * - T-3: el toggle de un patron en una celda propaga el draft a onChange con
 *   `week_ordinal`, `day_of_week` y `movement_pattern_id` correctos.
 *
 * No testeamos: backdrop (cubierto por BaseModal), styling, scroll, responsive,
 * cierre del popover por click fuera (cubierto por el draft inline existente).
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render } from "@/test-utils/render";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import { PeriodizationWeeklyStructureModal } from "../PeriodizationWeeklyStructureModal";

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
    {
        id: 2,
        name_en: "Pull",
        name_es: "Tirón",
        description: null,
        ui_bucket: "UPPER",
        is_active: true,
        created_at: "2026-01-01T00:00:00",
        updated_at: "2026-01-01T00:00:00",
    },
];

describe("PeriodizationWeeklyStructureModal", () => {
    it("T-2: no resetea el draft al cerrarse (ESC ni boton Listo llaman onChange)", async () => {
        const user = userEvent.setup();
        const initialDraft: WeeklyStructureWeekCreate[] = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    {
                        day_of_week: 1,
                        patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
                    },
                ],
            },
        ];
        const onChange = vi.fn();
        const onClose = vi.fn();

        render(
            <PeriodizationWeeklyStructureModal
                isOpen
                onClose={onClose}
                startDate="2026-05-04"
                endDate="2026-05-17"
                trainingDays={["Monday", "Wednesday"]}
                patternsCatalog={mockPatterns}
                value={initialDraft}
                onChange={onChange}
            />,
        );

        await user.keyboard("{Escape}");
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();

        onClose.mockClear();
        // El boton "Listo" del modal vive dentro del propio modal (sigue montado en RTL).
        const listoButton = screen.getByRole("button", { name: /listo/i });
        await user.click(listoButton);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("T-3: el toggle de un patron en una celda propaga el draft con el patron añadido", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <PeriodizationWeeklyStructureModal
                isOpen
                onClose={() => {}}
                startDate="2026-05-04"
                endDate="2026-05-10"
                trainingDays={["Monday"]}
                patternsCatalog={mockPatterns}
                value={[]}
                onChange={onChange}
            />,
        );

        // El modal es un acordeon exclusivo: solo la primera semana esta
        // expandida por defecto, asi que solo hay un boton "Añadir patrones a
        // Lunes" visible (el de la semana 1, que es la unica del rango aqui).
        const addButton = screen.getByRole("button", {
            name: /añadir patrones a lunes/i,
        });
        await user.click(addButton);

        // El popover renderiza el catalogo entero como botones PatternBadge.
        const empujeButton = await screen.findByRole("button", { name: /empuje/i });
        await user.click(empujeButton);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({
                week_ordinal: 1,
                days: [
                    expect.objectContaining({
                        day_of_week: 1,
                        patterns: [
                            expect.objectContaining({ movement_pattern_id: 1 }),
                        ],
                    }),
                ],
            }),
        ]);
    });
});

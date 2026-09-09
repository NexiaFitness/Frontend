/**
 * periodBlockPersistence.test.ts — Contratos de persistencia incremental de bloque (F2).
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { describe, expect, it } from "vitest";

import { resolveCreateStructurePlan, toBlockCreateWithStructurePayload } from "../periodBlockPersistence";

describe("resolveCreateStructurePlan", () => {
    const templateWeek = {
        week_ordinal: 1,
        label: null,
        days: [
            { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
        ],
    };

    it("aplica template cuando el bloque tiene más de una semana calendario", () => {
        const plan = resolveCreateStructurePlan(
            "2026-09-15",
            "2026-09-28",
            [templateWeek],
        );
        expect(plan.templateWeek).toEqual(templateWeek);
        expect(plan.shouldApplyTemplate).toBe(true);
    });

    it("no aplica template en bloques de una sola semana calendario", () => {
        const plan = resolveCreateStructurePlan(
            "2026-09-08",
            "2026-09-12",
            [templateWeek],
        );
        expect(plan.shouldApplyTemplate).toBe(false);
    });

    it("ignora semanas parciales del draft distintas de la semana tipo", () => {
        const plan = resolveCreateStructurePlan(
            "2026-09-15",
            "2026-09-28",
            [
                templateWeek,
                {
                    week_ordinal: 2,
                    label: null,
                    days: [
                        { day_of_week: 4, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] },
                    ],
                },
            ],
        );
        expect(plan.templateWeek?.week_ordinal).toBe(1);
        expect(plan.shouldApplyTemplate).toBe(true);
    });
});

describe("toBlockCreateWithStructurePayload", () => {
    const baseForm = {
        startDate: "2026-09-15",
        endDate: "2026-09-28",
        volumeLevel: 5,
        intensityLevel: 6,
        qualities: [{ physical_quality_id: 1, percentage: 100 }],
    };

    it("incluye template_week y apply_template en bloques multi-semana", () => {
        const payload = toBlockCreateWithStructurePayload(baseForm, [
            {
                week_ordinal: 1,
                days: [{ day_of_week: 1, patterns: [{ movement_pattern_id: 3 }] }],
            },
        ]);
        expect(payload.template_week?.week_ordinal).toBe(1);
        expect(payload.apply_template_to_remaining_weeks).toBe(true);
        expect(payload.volume_level).toBe(5);
    });

    it("envía template_week null si no hay días", () => {
        const payload = toBlockCreateWithStructurePayload(baseForm, [
            { week_ordinal: 1, days: [] },
        ]);
        expect(payload.template_week).toBeNull();
        expect(payload.apply_template_to_remaining_weeks).toBe(false);
    });
});

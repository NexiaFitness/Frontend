/**
 * periodizationWeeklyStructureUtils.test.ts — Utilidades de estructura semanal (F2).
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { describe, expect, it } from "vitest";

import {
    countConfiguredTrainableDays,
    restoreWeekFromTemplate,
} from "../periodizationWeeklyStructureUtils";

describe("periodizationWeeklyStructureUtils", () => {
    it("countConfiguredTrainableDays no duplica días", () => {
        const value = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                    { day_of_week: 4, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] },
                    { day_of_week: 6, patterns: [{ movement_pattern_id: 3, sub_pattern: null }] },
                ],
            },
            {
                week_ordinal: 2,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                    { day_of_week: 4, patterns: [{ movement_pattern_id: 2, sub_pattern: null }] },
                    { day_of_week: 6, patterns: [{ movement_pattern_id: 3, sub_pattern: null }] },
                ],
            },
        ];
        const { totalTrainable, withPatterns } = countConfiguredTrainableDays(
            "2026-09-01",
            "2026-09-14",
            ["Tuesday", "Thursday", "Saturday"],
            value,
        );
        expect(totalTrainable).toBe(6);
        expect(withPatterns).toBe(6);
    });

    it("restoreWeekFromTemplate copia semana 1 sobre destino", () => {
        const draft = [
            {
                week_ordinal: 1,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
                ],
            },
            {
                week_ordinal: 2,
                label: null,
                days: [
                    { day_of_week: 2, patterns: [{ movement_pattern_id: 99, sub_pattern: null }] },
                ],
            },
        ];
        const restored = restoreWeekFromTemplate(draft, 2);
        const w2 = restored.find((w) => w.week_ordinal === 2);
        expect(w2?.days[0].patterns[0].movement_pattern_id).toBe(1);
    });
});

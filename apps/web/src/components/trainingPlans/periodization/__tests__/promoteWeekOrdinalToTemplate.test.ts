/**
 * promoteWeekOrdinalToTemplate.test.ts — Recuperación semana tipo desde ordinal huérfano.
 */

import { describe, expect, it } from "vitest";

import { promoteWeekOrdinalToTemplate } from "../periodizationWeeklyStructureUtils";

describe("promoteWeekOrdinalToTemplate", () => {
    it("clona semana 2 como semana 1 cuando falta la tipo", () => {
        const draft = [
            {
                week_ordinal: 2,
                label: null,
                days: [
                    {
                        day_of_week: 6,
                        patterns: [{ movement_pattern_id: 10, sub_pattern: null }],
                    },
                ],
            },
        ];
        const next = promoteWeekOrdinalToTemplate(draft, 2);
        const week1 = next.find((w) => w.week_ordinal === 1);
        expect(week1?.days[0].patterns[0].movement_pattern_id).toBe(10);
        expect(next.some((w) => w.week_ordinal === 2)).toBe(true);
    });
});

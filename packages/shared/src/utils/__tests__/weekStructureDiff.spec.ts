import { describe, expect, it } from "vitest";

import {
    classifyWeeksByTemplate,
    classifyWeeksWithBaseline,
    isWeeklyStructureDirty,
    propagateTemplateWeekEdit,
    weeksStructureEqual,
} from "../weekStructureDiff";

describe("weekStructureDiff", () => {
    const template = {
        week_ordinal: 1,
        label: null,
        days: [
            { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
        ],
    };

    const copy = {
        week_ordinal: 2,
        label: null,
        days: [
            { day_of_week: 2, patterns: [{ movement_pattern_id: 1, sub_pattern: null }] },
        ],
    };

    const different = {
        week_ordinal: 2,
        label: null,
        days: [
            { day_of_week: 2, patterns: [{ movement_pattern_id: 99, sub_pattern: null }] },
        ],
    };

    it("isWeeklyStructureDirty: baseline vacío confirmado vs draft con semanas", () => {
        expect(isWeeklyStructureDirty([], [])).toBe(false);
        expect(isWeeklyStructureDirty([template], [])).toBe(true);
    });

    it("weeksStructureEqual ignora week_ordinal", () => {
        expect(weeksStructureEqual(template, copy)).toBe(true);
        expect(weeksStructureEqual(template, different)).toBe(false);
    });

    it("classifyWeeksByTemplate marca heredada/personalizada", () => {
        const inherited = classifyWeeksByTemplate([template, copy]);
        expect(inherited[1]).toBe("heredada");
        expect(inherited[2]).toBe("heredada");

        const mixed = classifyWeeksByTemplate([template, different]);
        expect(mixed[2]).toBe("personalizada");
    });

    it("classifyWeeksWithBaseline usa baseline persistido (F5 / setActiveDays)", () => {
        const baseline = [template, different];
        const draft = [template, copy];
        const fromDraftOnly = classifyWeeksByTemplate(draft, 1);
        expect(fromDraftOnly[2]).toBe("heredada");

        // Baseline congela personalización del servidor para propagación.
        const unified = classifyWeeksWithBaseline(draft, baseline, 1);
        expect(unified[2]).toBe("personalizada");
    });

    describe("propagateTemplateWeekEdit (D-ST, APB-03)", () => {
        const week = (ordinal: number, patternId: number) => ({
            week_ordinal: ordinal,
            label: null,
            days: [
                {
                    day_of_week: 2,
                    patterns: [{ movement_pattern_id: patternId, sub_pattern: null }],
                },
            ],
        });

        it("propaga la semana tipo nueva a las semanas que la seguían", () => {
            const previous = [week(1, 1), week(2, 1), week(3, 99)];
            const next = [week(1, 7), week(2, 1), week(3, 99)];
            const result = propagateTemplateWeekEdit(previous, next);
            expect(result.find((w) => w.week_ordinal === 2)).toEqual(week(2, 7));
            // Personalizada: no se toca.
            expect(result.find((w) => w.week_ordinal === 3)).toEqual(week(3, 99));
        });

        it("no cambia nada si la semana tipo no cambió", () => {
            const previous = [week(1, 1), week(2, 1)];
            const next = [week(1, 1), week(2, 5)];
            expect(propagateTemplateWeekEdit(previous, next)).toEqual(next);
        });

        it("no crea semanas que no existían en el draft", () => {
            const result = propagateTemplateWeekEdit([week(1, 1)], [week(1, 2)]);
            expect(result).toEqual([week(1, 2)]);
        });
    });
});

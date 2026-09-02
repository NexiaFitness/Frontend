import { describe, expect, it } from "vitest";

import {
    classifyWeeksByTemplate,
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
});

import { describe, it, expect } from "vitest";
import type { WeeklyStructureWeek } from "../../types/weeklyStructure";
import { suggestNextSessionDateAfter } from "./suggestSessionDate";

const LUN_MIE_VIE_WEEK: WeeklyStructureWeek[] = [
    {
        week_ordinal: 1,
        label: null,
        days: [
            { day_of_week: 1, patterns: [{ movement_pattern_id: 1 }] },
            { day_of_week: 3, patterns: [{ movement_pattern_id: 2 }] },
            { day_of_week: 5, patterns: [{ movement_pattern_id: 3 }] },
        ],
    },
];

describe("suggestNextSessionDateAfter", () => {
    it("B13 case 4351: after Monday session → next pattern day Wednesday", () => {
        const date = suggestNextSessionDateAfter(
            "2026-06-22",
            "2026-06-22",
            "2026-07-15",
            LUN_MIE_VIE_WEEK,
            [{ session_date: "2026-06-22" }],
        );
        expect(date).toBe("2026-06-24");
    });

    it("skips to Friday when Wednesday is occupied", () => {
        const date = suggestNextSessionDateAfter(
            "2026-06-22",
            "2026-06-22",
            "2026-07-15",
            LUN_MIE_VIE_WEEK,
            [
                { session_date: "2026-06-22" },
                { session_date: "2026-06-24" },
            ],
        );
        expect(date).toBe("2026-06-26");
    });

    it("does not return Tuesday when only lun/mié/vie have patterns", () => {
        const date = suggestNextSessionDateAfter(
            "2026-06-22",
            "2026-06-22",
            "2026-06-28",
            LUN_MIE_VIE_WEEK,
            [{ session_date: "2026-06-22" }],
        );
        expect(date).not.toBe("2026-06-23");
        expect(date).toBe("2026-06-24");
    });

    it("falls back to first free day when structure has no pattern days", () => {
        const emptyWeeks: WeeklyStructureWeek[] = [
            {
                week_ordinal: 1,
                label: null,
                days: [{ day_of_week: 1, patterns: [] }],
            },
        ];
        const date = suggestNextSessionDateAfter(
            "2026-06-22",
            "2026-06-22",
            "2026-06-28",
            emptyWeeks,
            [{ session_date: "2026-06-22" }],
        );
        expect(date).toBe("2026-06-23");
    });

    it("returns null when no slot remains after afterDate", () => {
        const date = suggestNextSessionDateAfter(
            "2026-06-26",
            "2026-06-22",
            "2026-06-26",
            LUN_MIE_VIE_WEEK,
            [
                { session_date: "2026-06-22" },
                { session_date: "2026-06-24" },
                { session_date: "2026-06-26" },
            ],
        );
        expect(date).toBeNull();
    });
});

import { describe, expect, it } from "vitest";
import type { WeeklyStructureWeek } from "../types/weeklyStructure";
import {
    hasTrainingPatternsOnDate,
    listStructureDriftPlannedSessionIds,
} from "./weeklyStructureSessionDrift";

const WEEKS: WeeklyStructureWeek[] = [
    {
        id: 1,
        week_ordinal: 1,
        days: [
            { id: 1, day_of_week: 1, patterns: [{ movement_pattern_id: 1 }] },
            { id: 2, day_of_week: 3, patterns: [{ movement_pattern_id: 2 }] },
        ],
    },
];

describe("weeklyStructureSessionDrift", () => {
    it("detects planned future session on day without patterns", () => {
        // 2026-09-08 = martes (ISO 2); WEEKS solo define lun(1) y mié(3) → martes sin patrón
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 10,
                    session_date: "2026-09-08",
                    status: "planned",
                    period_block_id: 59,
                },
            ],
            { id: 59, start_date: "2026-09-08", end_date: "2026-09-30" },
            WEEKS,
            "2026-09-08",
        );
        expect(ids).toEqual([10]);
    });

    it("ignores completed sessions", () => {
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 11,
                    session_date: "2026-09-09",
                    status: "completed",
                    period_block_id: 59,
                },
            ],
            { id: 59, start_date: "2026-09-08", end_date: "2026-09-30" },
            WEEKS,
            "2026-09-08",
        );
        expect(ids).toEqual([]);
    });

    it("hasTrainingPatternsOnDate matches weekday with patterns", () => {
        // 2026-09-07 = lunes (ISO 1), definido en WEEKS
        expect(
            hasTrainingPatternsOnDate("2026-09-07", "2026-09-08", WEEKS),
        ).toBe(true);
        expect(
            hasTrainingPatternsOnDate("2026-09-08", "2026-09-08", WEEKS),
        ).toBe(false);
    });
});

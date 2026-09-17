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
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 10,
                    session_date: "2026-09-09",
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

    it("hasTrainingPatternsOnDate matches Monday with patterns", () => {
        expect(
            hasTrainingPatternsOnDate("2026-09-08", "2026-09-08", WEEKS),
        ).toBe(true);
    });
});

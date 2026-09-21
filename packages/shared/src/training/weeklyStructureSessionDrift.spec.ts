import { describe, expect, it } from "vitest";

import {
    buildStructureDriftSessionSummaries,
    isProgramSessionStatusEligibleForStructureDrift,
    listStructureDriftPlannedSessionIds,
} from "./weeklyStructureSessionDrift";
import type { WeeklyStructureWeek } from "../types/weeklyStructure";

const block = {
    id: 10,
    start_date: "2026-09-01",
    end_date: "2026-09-30",
};

const weekWithMondayPattern: WeeklyStructureWeek[] = [
    {
        id: 1,
        week_ordinal: 1,
        days: [
            {
                id: 1,
                day_of_week: 1,
                patterns: [{ movement_pattern_id: 1 }],
            },
        ],
    },
];

describe("weeklyStructureSessionDrift", () => {
    it("excludes completed and past sessions", () => {
        expect(isProgramSessionStatusEligibleForStructureDrift("completed")).toBe(false);
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 1,
                    session_date: "2026-08-15",
                    status: "planned",
                    period_block_id: 10,
                },
                {
                    id: 2,
                    session_date: "2026-09-22",
                    status: "completed",
                    period_block_id: 10,
                },
            ],
            block,
            weekWithMondayPattern,
            "2026-09-21",
        );
        expect(ids).toEqual([]);
    });

    it("flags planned future session on day without patterns", () => {
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 42,
                    session_date: "2026-09-22",
                    status: "planned",
                    period_block_id: 10,
                },
            ],
            block,
            weekWithMondayPattern,
            "2026-09-21",
        );
        expect(ids).toEqual([42]);
    });

    it("does not flag when patterns exist for session weekday", () => {
        const weekWithTuesday: WeeklyStructureWeek[] = [
            {
                id: 1,
                week_ordinal: 1,
                days: [
                    {
                        id: 1,
                        day_of_week: 2,
                        patterns: [{ movement_pattern_id: 1 }],
                    },
                ],
            },
        ];
        const ids = listStructureDriftPlannedSessionIds(
            [
                {
                    id: 43,
                    session_date: "2026-09-01",
                    status: "planned",
                    period_block_id: 10,
                },
            ],
            block,
            weekWithTuesday,
            "2026-08-01",
        );
        expect(ids).toEqual([]);
    });

    it("buildStructureDriftSessionSummaries preserves id and date", () => {
        const rows = buildStructureDriftSessionSummaries(
            [
                {
                    id: 99,
                    session_date: "2026-09-22",
                    status: "planned",
                    period_block_id: 10,
                },
            ],
            block,
            weekWithMondayPattern,
            "2026-09-21",
        );
        expect(rows).toEqual([
            { id: 99, session_date: "2026-09-22", session_name: null },
        ]);
    });
});

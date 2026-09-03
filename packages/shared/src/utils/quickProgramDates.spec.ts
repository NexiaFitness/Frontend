import { describe, expect, it } from "vitest";
import { getBlockCalendarWeekCount } from "./calendarWeekForBlock";
import {
    addDaysLocal,
    dayAfterLocal,
    deriveBlockEndFromWeekCount,
    isWeekCountCoherentWithRange,
    recalculatePhaseDates,
    resolveQuickProgramStartDate,
} from "./quickProgramDates";

describe("deriveBlockEndFromWeekCount", () => {
    it("matches BE case: 2026-01-06 + 3 weeks → 2026-01-25", () => {
        const start = "2026-01-06";
        const end = deriveBlockEndFromWeekCount(start, 3);
        expect(end).toBe("2026-01-25");
        expect(getBlockCalendarWeekCount(start, end)).toBe(3);
    });

    it("returns start when weekCount is 1 (single calendar week)", () => {
        const start = "2026-01-06";
        const end = deriveBlockEndFromWeekCount(start, 1);
        expect(getBlockCalendarWeekCount(start, end)).toBe(1);
    });
});

describe("recalculatePhaseDates", () => {
    it("produces two contiguous 4-week phases", () => {
        const ranges = recalculatePhaseDates("2026-01-06", [
            { sortOrder: 0, weekCount: 4 },
            { sortOrder: 1, weekCount: 4 },
        ]);

        expect(ranges).toHaveLength(2);
        expect(ranges[0].startDate).toBe("2026-01-06");
        expect(ranges[1].startDate).toBe(dayAfterLocal(ranges[0].endDate));
        expect(getBlockCalendarWeekCount(ranges[0].startDate, ranges[0].endDate)).toBe(4);
        expect(getBlockCalendarWeekCount(ranges[1].startDate, ranges[1].endDate)).toBe(4);
    });
});

describe("dayAfterLocal", () => {
    it("adds one day across month boundary", () => {
        expect(dayAfterLocal("2026-01-31")).toBe("2026-02-01");
    });

    it("addDaysLocal handles negative offset", () => {
        expect(addDaysLocal("2026-02-01", -1)).toBe("2026-01-31");
    });
});

describe("resolveQuickProgramStartDate", () => {
    it("starts after last persisted block when plan already has blocks", () => {
        expect(
            resolveQuickProgramStartDate("2026-08-31", [
                { id: 42, start_date: "2026-09-22", end_date: "2026-09-28" },
                { id: 43, start_date: "2026-10-06", end_date: "2026-10-19" },
            ]),
        ).toBe("2026-10-20");
    });

    it("uses plan start when no blocks exist", () => {
        expect(resolveQuickProgramStartDate("2026-08-31", [])).toBe("2026-08-31");
    });
});

describe("isWeekCountCoherentWithRange", () => {
    it("validates known 3-week range", () => {
        expect(
            isWeekCountCoherentWithRange("2026-01-06", "2026-01-25", 3),
        ).toBe(true);
        expect(
            isWeekCountCoherentWithRange("2026-01-06", "2026-01-25", 4),
        ).toBe(false);
    });
});

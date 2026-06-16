/**
 * periodBlockOverlap.test.ts — Tests para utilidades de rangos de bloques.
 *
 * @author Frontend Team
 * @since v2.6.1
 */

import { describe, it, expect } from "vitest";
import {
  hasOverlap,
  isDateInRange,
  countPlannedDays,
  toLocalISO,
  parseISODateLocal,
  findBlockContainingDate,
  findNextFreeDate,
  getBlockOverlapHint,
} from "../periodBlockOverlap";

import type { DateRange } from "../periodBlockOverlap";

describe("toLocalISO", () => {
  it("formats a Date as YYYY-MM-DD in local timezone", () => {
    const d = new Date(2026, 3, 5); // April 5, 2026 local
    expect(toLocalISO(d)).toBe("2026-04-05");
  });

  it("pads single-digit month and day", () => {
    const d = new Date(2026, 0, 3); // Jan 3
    expect(toLocalISO(d)).toBe("2026-01-03");
  });
});

describe("hasOverlap", () => {
  const blocks: DateRange[] = [
    { start_date: "2026-02-01", end_date: "2026-02-28", id: 1 },
    { start_date: "2026-04-01", end_date: "2026-04-30", id: 2 },
  ];

  it("returns true when new range fully overlaps existing", () => {
    expect(hasOverlap("2026-02-10", "2026-02-20", blocks)).toBe(true);
  });

  it("returns true when new range partially overlaps start", () => {
    expect(hasOverlap("2026-01-20", "2026-02-05", blocks)).toBe(true);
  });

  it("returns true when new range partially overlaps end", () => {
    expect(hasOverlap("2026-02-25", "2026-03-10", blocks)).toBe(true);
  });

  it("returns false when no overlap (gap between blocks)", () => {
    expect(hasOverlap("2026-03-01", "2026-03-31", blocks)).toBe(false);
  });

  it("returns true for exact same range", () => {
    expect(hasOverlap("2026-02-01", "2026-02-28", blocks)).toBe(true);
  });

  it("excludes a block by id", () => {
    expect(hasOverlap("2026-02-01", "2026-02-28", blocks, 1)).toBe(false);
  });

  it("returns true for single-day boundary overlap", () => {
    expect(hasOverlap("2026-02-28", "2026-03-01", blocks)).toBe(true);
  });
});

describe("isDateInRange", () => {
  it("returns true for date inside range", () => {
    expect(isDateInRange("2026-03-15", "2026-03-01", "2026-03-31")).toBe(true);
  });

  it("returns true for date at range start", () => {
    expect(isDateInRange("2026-03-01", "2026-03-01", "2026-03-31")).toBe(true);
  });

  it("returns true for date at range end", () => {
    expect(isDateInRange("2026-03-31", "2026-03-01", "2026-03-31")).toBe(true);
  });

  it("returns false for date before range", () => {
    expect(isDateInRange("2026-02-28", "2026-03-01", "2026-03-31")).toBe(false);
  });

  it("returns false for date after range", () => {
    expect(isDateInRange("2026-04-01", "2026-03-01", "2026-03-31")).toBe(false);
  });
});

describe("countPlannedDays", () => {
  it("counts days within a single block that fits the month", () => {
    const blocks = [{ start_date: "2026-03-10", end_date: "2026-03-20" }];
    const monthStart = new Date(2026, 2, 1);
    const monthEnd = new Date(2026, 2, 31);
    expect(countPlannedDays(blocks, monthStart, monthEnd)).toBe(11);
  });

  it("clips block that extends beyond month boundaries", () => {
    const blocks = [{ start_date: "2026-02-20", end_date: "2026-03-10" }];
    const monthStart = new Date(2026, 2, 1); // March
    const monthEnd = new Date(2026, 2, 31);
    expect(countPlannedDays(blocks, monthStart, monthEnd)).toBe(10);
  });

  it("returns 0 when block doesn't intersect month", () => {
    const blocks = [{ start_date: "2026-01-01", end_date: "2026-01-31" }];
    const monthStart = new Date(2026, 2, 1);
    const monthEnd = new Date(2026, 2, 31);
    expect(countPlannedDays(blocks, monthStart, monthEnd)).toBe(0);
  });

  it("de-duplicates overlapping blocks within same month", () => {
    const blocks = [
      { start_date: "2026-03-01", end_date: "2026-03-15" },
      { start_date: "2026-03-10", end_date: "2026-03-20" },
    ];
    const monthStart = new Date(2026, 2, 1);
    const monthEnd = new Date(2026, 2, 31);
    expect(countPlannedDays(blocks, monthStart, monthEnd)).toBe(20);
  });

  it("handles empty blocks array", () => {
    const monthStart = new Date(2026, 2, 1);
    const monthEnd = new Date(2026, 2, 31);
    expect(countPlannedDays([], monthStart, monthEnd)).toBe(0);
  });
});

describe("findBlockContainingDate", () => {
  const blocks: DateRange[] = [
    { start_date: "2026-05-20", end_date: "2026-05-31", id: 1, name: "Hipertrofia" },
    { start_date: "2026-06-15", end_date: "2026-06-20", id: 2 },
  ];

  it("returns the block that contains the date", () => {
    const result = findBlockContainingDate("2026-05-25", blocks);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
  });

  it("returns null when date is not inside any block", () => {
    const result = findBlockContainingDate("2026-06-01", blocks);
    expect(result).toBeNull();
  });

  it("excludes a block by id", () => {
    const result = findBlockContainingDate("2026-05-25", blocks, 1);
    expect(result).toBeNull();
  });
});

describe("findNextFreeDate", () => {
  it("returns the day after a single block", () => {
    const blocks: DateRange[] = [
      { start_date: "2026-05-20", end_date: "2026-05-31", id: 1 },
    ];
    expect(findNextFreeDate("2026-05-31", blocks)).toBe("2026-06-01");
  });

  it("skips contiguous blocks", () => {
    const blocks: DateRange[] = [
      { start_date: "2026-05-20", end_date: "2026-05-31", id: 1 },
      { start_date: "2026-06-01", end_date: "2026-06-07", id: 2 },
    ];
    expect(findNextFreeDate("2026-05-31", blocks)).toBe("2026-06-08");
  });

  it("skips overlapping blocks", () => {
    const blocks: DateRange[] = [
      { start_date: "2026-05-20", end_date: "2026-05-31", id: 1 },
      { start_date: "2026-05-28", end_date: "2026-06-05", id: 2 },
    ];
    expect(findNextFreeDate("2026-05-31", blocks)).toBe("2026-06-06");
  });

  it("excludes a block by id", () => {
    const blocks: DateRange[] = [
      { start_date: "2026-05-20", end_date: "2026-05-31", id: 1 },
    ];
    expect(findNextFreeDate("2026-05-31", blocks, 1)).toBe("2026-06-01");
  });
});

describe("parseISODateLocal", () => {
    it("returns a local date for a valid ISO string", () => {
        const result = parseISODateLocal("2026-06-01");
        expect(result).not.toBeNull();
        expect(result?.getFullYear()).toBe(2026);
        expect(result?.getMonth()).toBe(5); // June is 5
        expect(result?.getDate()).toBe(1);
    });

    it("returns null for an invalid ISO string", () => {
        expect(parseISODateLocal("not-a-date")).toBeNull();
    });

    it("returns null for an impossible date", () => {
        expect(parseISODateLocal("2026-02-30")).toBeNull();
    });

    it("returns null for an incomplete string", () => {
        expect(parseISODateLocal("2026-06")).toBeNull();
    });
});

describe("getBlockOverlapHint", () => {
  const blocks: DateRange[] = [
    { start_date: "2026-05-20", end_date: "2026-05-31", id: 1, name: "Hipertrofia" },
    { start_date: "2026-06-01", end_date: "2026-06-07", id: 2 },
  ];

  it("returns block and next free date when date is inside a block", () => {
    const result = getBlockOverlapHint("2026-05-25", blocks);
    expect(result).not.toBeNull();
    expect(result?.block.id).toBe(1);
    expect(result?.nextFreeDate).toBe("2026-06-08");
  });

  it("returns null when date is not inside any block", () => {
    const result = getBlockOverlapHint("2026-06-10", blocks);
    expect(result).toBeNull();
  });

  it("excludes a block by id", () => {
    const result = getBlockOverlapHint("2026-05-25", blocks, 1);
    expect(result).toBeNull();
  });
});

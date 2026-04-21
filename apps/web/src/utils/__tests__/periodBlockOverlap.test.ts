import { describe, it, expect } from "vitest";
import {
  hasOverlap,
  isDateInRange,
  countPlannedDays,
  toLocalISO,
} from "@nexia/shared/utils/periodBlockOverlap";

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
  const blocks = [
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

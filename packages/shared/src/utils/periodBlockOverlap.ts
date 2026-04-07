export interface DateRange {
  start_date: string;
  end_date: string;
  id?: number;
}

/** Local-timezone YYYY-MM-DD (avoids UTC shift from toISOString) */
export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as local date (not UTC) */
function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function hasOverlap(
  newStart: string,
  newEnd: string,
  existingBlocks: DateRange[],
  excludeId?: number
): boolean {
  const s = parseLocal(newStart).getTime();
  const e = parseLocal(newEnd).getTime();
  return existingBlocks.some((block) => {
    if (excludeId != null && block.id === excludeId) return false;
    const bs = parseLocal(block.start_date).getTime();
    const be = parseLocal(block.end_date).getTime();
    return s <= be && e >= bs;
  });
}

export function isDateInRange(
  date: string,
  start: string,
  end: string
): boolean {
  const d = parseLocal(date).getTime();
  return d >= parseLocal(start).getTime() && d <= parseLocal(end).getTime();
}

/** True when block [blockStart, blockEnd] ⊆ plan [planStart, planEnd] (inclusive). */
export function isWithinPlanBounds(
  blockStart: string,
  blockEnd: string,
  planStart: string | null | undefined,
  planEnd: string | null | undefined,
): boolean {
  if (!planStart || !planEnd) return true;
  const bs = parseLocal(blockStart).getTime();
  const be = parseLocal(blockEnd).getTime();
  const ps = parseLocal(planStart).getTime();
  const pe = parseLocal(planEnd).getTime();
  return bs >= ps && be <= pe;
}

export function countPlannedDays(
  blocks: DateRange[],
  monthStart: Date,
  monthEnd: Date
): number {
  const planned = new Set<string>();
  for (const block of blocks) {
    const bs = parseLocal(block.start_date);
    const be = parseLocal(block.end_date);
    const start = bs > monthStart ? bs : new Date(monthStart);
    const end = be < monthEnd ? be : new Date(monthEnd);
    const cur = new Date(start);
    while (cur <= end) {
      planned.add(toLocalISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return planned.size;
}

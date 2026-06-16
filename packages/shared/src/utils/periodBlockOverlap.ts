/**
 * periodBlockOverlap.ts — Utilidades puras para rangos de bloques de periodización.
 *
 * Incluye detección de solapamientos, pertenencia de fechas a bloques,
 * y cálculo del siguiente día libre después de un bloque.
 *
 * @author Frontend Team
 * @since v2.6.1
 */

export interface DateRange {
  start_date: string;
  end_date: string;
  id?: number;
  name?: string | null;
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

/**
 * Parse a YYYY-MM-DD string as a local date.
 * Returns null if the string is not a valid ISO date.
 */
export function parseISODateLocal(dateStr: string): Date | null {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
        return null;
    }
    const date = new Date(y, m - 1, d);
    if (
        date.getFullYear() !== y ||
        date.getMonth() !== m - 1 ||
        date.getDate() !== d
    ) {
        return null;
    }
    return date;
}

/** Add days to a YYYY-MM-DD string and return a new YYYY-MM-DD string. */
function addDays(dateStr: string, days: number): string {
  const d = parseLocal(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
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

/**
 * Find the existing block that contains the given date.
 * Returns null if the date is not inside any block.
 */
export function findBlockContainingDate<T extends DateRange>(
  date: string,
  existingBlocks: T[],
  excludeId?: number,
): T | null {
  return (
    existingBlocks.find((block) => {
      if (excludeId != null && block.id === excludeId) return false;
      return isDateInRange(date, block.start_date, block.end_date);
    }) ?? null
  );
}

/**
 * Find the first date after `afterDate` that is not covered by any block.
 * Blocks are treated as inclusive ranges.
 */
export function findNextFreeDate(
  afterDate: string,
  existingBlocks: DateRange[],
  excludeId?: number,
): string {
  const sorted = [...existingBlocks]
    .filter((block) => excludeId == null || block.id !== excludeId)
    .sort((a, b) => parseLocal(a.start_date).getTime() - parseLocal(b.start_date).getTime());

  let candidate = addDays(afterDate, 1);
  let changed = true;

  while (changed) {
    changed = false;
    for (const block of sorted) {
      if (isDateInRange(candidate, block.start_date, block.end_date)) {
        candidate = addDays(block.end_date, 1);
        changed = true;
        break;
      }
    }
  }

  return candidate;
}

/**
 * If `date` falls inside an existing block, return that block and the first
 * free date immediately after it (skipping any contiguous blocks).
 */
export function getBlockOverlapHint<T extends DateRange>(
  date: string,
  existingBlocks: T[],
  excludeId?: number,
): { block: T; nextFreeDate: string } | null {
  const block = findBlockContainingDate(date, existingBlocks, excludeId);
  if (!block) return null;
  const nextFreeDate = findNextFreeDate(block.end_date, existingBlocks, excludeId);
  return { block, nextFreeDate };
}

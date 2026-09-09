/**
 * planningShellUtils.ts — Helpers de dominio para shell F5 (explore · createWhen).
 */

import { getBlockCalendarWeekCount } from "@nexia/shared";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { isDateInRange } from "@nexia/shared/utils/periodBlockOverlap";

export function findBlockContainingDate(
    blocks: PlanPeriodBlock[],
    dateStr: string,
): PlanPeriodBlock | undefined {
    return blocks.find((block) =>
        isDateInRange(dateStr, block.start_date, block.end_date),
    );
}

export function formatPhaseChipLabel(
    block: PlanPeriodBlock,
    index: number,
): string {
    const weeks = getBlockCalendarWeekCount(block.start_date, block.end_date);
    const name = block.name?.trim();
    if (name) {
        return `${name} · ${weeks} sem`;
    }
    return `Fase ${index + 1} · ${weeks} sem`;
}

function parseLocal(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function formatProgramDurationLabel(start: string, end: string): string {
    const ms = parseLocal(end).getTime() - parseLocal(start).getTime();
    const weeks = Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
    if (weeks < 4) {
        return `${weeks} sem`;
    }
    const months = Math.floor(weeks / 4);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
}

export function resolveInitialSelectedBlockId(
    blocks: PlanPeriodBlock[],
): number | null {
    if (blocks.length === 0) {
        return null;
    }
    const today = new Date().toISOString().slice(0, 10);
    const containing = findBlockContainingDate(blocks, today);
    return containing?.id ?? blocks[0].id;
}

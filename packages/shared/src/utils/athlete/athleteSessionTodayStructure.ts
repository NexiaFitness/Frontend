/** FE-8: copy for Home «Hoy» — blocks + estimated duration only. */

import type { SessionSummary } from "../../types/sessionProgramming";

export function formatSessionTodayStructureLine(
    summary: SessionSummary | undefined,
    plannedDurationMinutes: number | null | undefined,
    blocksOverride?: number | null
): string | null {
    const blocks =
        summary?.blocks && summary.blocks > 0
            ? summary.blocks
            : blocksOverride && blocksOverride > 0
              ? blocksOverride
              : null;
    const duration =
        summary?.estimated_duration && summary.estimated_duration > 0
            ? summary.estimated_duration
            : plannedDurationMinutes && plannedDurationMinutes > 0
              ? plannedDurationMinutes
              : null;

    const parts: string[] = [];
    if (blocks != null && blocks > 0) {
        parts.push(blocks === 1 ? "1 bloque" : `${blocks} bloques`);
    }
    if (duration != null) {
        parts.push(`${duration} min estimados`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
}

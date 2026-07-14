/**
 * formatTimedBlockResultDisplay — Etiquetas trainer para TimedBlockResult (F8b).
 */

import { formatAmrapResultSummary } from "../athlete/amrapResult";
import { formatForTimeDuration } from "../athlete/forTimeResult";
import type { ClientTimedBlockResultRow } from "../../types/trainerSetExecutions";

const MODE_LABELS: Record<string, string> = {
    amrap: "AMRAP",
    emom: "EMOM",
    for_time: "For Time",
};

export function formatTimedBlockModeLabel(timedMode: string): string {
    return MODE_LABELS[timedMode] ?? timedMode;
}

export function formatTimedBlockResultValue(row: ClientTimedBlockResultRow): string {
    if (row.timed_mode === "amrap") {
        return formatAmrapResultSummary(
            row.rounds_completed ?? 0,
            row.partial_total ?? 0,
        );
    }
    if (row.timed_mode === "for_time" && row.total_seconds != null) {
        return formatForTimeDuration(row.total_seconds);
    }
    if (row.timed_mode === "emom") {
        const completed = row.emom_completed_count ?? 0;
        const failed = row.emom_failed_count ?? 0;
        if (failed > 0) {
            return `${completed} ok · ${failed} fallidos`;
        }
        return `${completed} intervalos`;
    }
    return "—";
}

export function formatTimedBlockResultTitle(row: ClientTimedBlockResultRow): string {
    const mode = formatTimedBlockModeLabel(row.timed_mode);
    const group = row.group_id ? ` · ${row.group_id}` : "";
    return `${mode}${group}`;
}

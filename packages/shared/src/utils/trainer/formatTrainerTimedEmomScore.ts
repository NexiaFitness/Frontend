/**
 * EMOM score line for trainer timed-block-results (paridad GET progress / D6 / P1-7).
 */

import type { TimedBlockResultDetail } from "../../types/timedBlockResultDetail";

export function formatTrainerTimedEmomScore(
    emomCompleted: number | null,
    emomFailed: number | null,
    detail: TimedBlockResultDetail | null | undefined
): string {
    if (detail?.kind === "not_performed") {
        return "No realizado";
    }

    if (!detail || detail.kind !== "emom") {
        const done = emomCompleted ?? 0;
        const fail = emomFailed ?? 0;
        const total = done + fail;
        if (total <= 0) return "—";
        return `${done}/${total} intervalos`;
    }

    if (!detail.as_planned) {
        return "EMOM no completado";
    }

    const intervalTotal = detail.interval_total;

    if (detail.finished_early) {
        const completed =
            detail.completed_interval_count ?? emomCompleted ?? 0;
        return `${completed}/${intervalTotal} intervalos`;
    }

    if (emomCompleted != null) {
        return `${emomCompleted}/${intervalTotal} intervalos`;
    }

    return `${intervalTotal}/${intervalTotal} intervalos`;
}

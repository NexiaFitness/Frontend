/**
 * blockReplicationPresentation.ts — Copy D-REP-6 (weeks_skipped, sessions_skipped_past).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import type { WeeklyStructureWeekSkippedItem } from "../types/weeklyStructure";

const WEEK_SKIP_LABEL: Record<string, string> = {
    past_target_date: "Semana ya terminada: no se modifica.",
};

export function formatWeekSkippedReasonLabel(reason: string | undefined): string {
    if (reason && WEEK_SKIP_LABEL[reason]) {
        return WEEK_SKIP_LABEL[reason];
    }
    return "No se modificó: motivo no reconocido";
}

export function formatWeeksSkippedToast(
    items: readonly WeeklyStructureWeekSkippedItem[] | undefined,
): string | null {
    if (!items?.length) return null;
    const byReason = new Map<string, number[]>();
    for (const item of items) {
        const key = String(item.reason ?? "unknown");
        const list = byReason.get(key) ?? [];
        list.push(item.week_ordinal);
        byReason.set(key, list);
    }
    const parts: string[] = [];
    for (const [reason, ordinals] of byReason) {
        const label = formatWeekSkippedReasonLabel(reason);
        const weeks =
            ordinals.length === 1
                ? `Semana ${ordinals[0]}`
                : `Semanas ${ordinals.join(", ")}`;
        parts.push(`${weeks}: ${label}`);
    }
    return parts.join(" ");
}

export function formatSessionsSkippedPastMessage(
    count: number | undefined | null,
): string | null {
    if (count == null || count <= 0) return null;
    if (count === 1) {
        return "1 sesión no se creó por ser de fechas pasadas.";
    }
    return `${count} sesiones no se crearon por ser de fechas pasadas.`;
}

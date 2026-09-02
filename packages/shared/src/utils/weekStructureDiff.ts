/**
 * weekStructureDiff.ts — Diff derivado semana vs semana tipo (O5).
 *
 * Contexto: normaliza días/patrones ignorando ids de BD para comparar estructuras
 * en persistencia incremental y apply-template.
 *
 * Notas de mantenimiento: funciones puras; sin dependencias de UI.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import type {
    WeeklyStructureWeek,
    WeeklyStructureWeekCreate,
} from "../types/weeklyStructure";

export type WeekStructureKind = "heredada" | "personalizada";

type WeekLike = WeeklyStructureWeek | WeeklyStructureWeekCreate;

function normalizeWeek(week: WeekLike): string {
    const days = [...week.days].sort((a, b) => a.day_of_week - b.day_of_week);
    const snapshot = days.map((day) => {
        const patterns = [...day.patterns]
            .map((p) => `${p.movement_pattern_id}:${p.sub_pattern ?? ""}`)
            .sort();
        return `${day.day_of_week}=[${patterns.join(",")}]`;
    });
    return snapshot.join("|");
}

/** True when two weeks have identical day/pattern structure (ignores DB ids). */
export function weeksStructureEqual(
    left: WeekLike,
    right: WeekLike,
): boolean {
    return normalizeWeek(left) === normalizeWeek(right);
}

/** Resolve template week (default: week_ordinal = 1). */
export function findTemplateWeek(
    weeks: readonly WeekLike[],
    templateOrdinal = 1,
): WeekLike | null {
    return weeks.find((w) => w.week_ordinal === templateOrdinal) ?? null;
}

/** Classify each week vs template as heredada or personalizada. */
export function classifyWeeksByTemplate(
    weeks: readonly WeekLike[],
    templateOrdinal = 1,
): Record<number, WeekStructureKind> {
    const template = findTemplateWeek(weeks, templateOrdinal);
    if (!template) {
        return Object.fromEntries(
            weeks.map((w) => [w.week_ordinal, "personalizada" as const]),
        );
    }
    return Object.fromEntries(
        weeks.map((w) => [
            w.week_ordinal,
            weeksStructureEqual(w, template) ? "heredada" : "personalizada",
        ]),
    );
}

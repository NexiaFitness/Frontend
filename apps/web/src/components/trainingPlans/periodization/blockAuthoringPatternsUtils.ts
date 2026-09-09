/**
 * blockAuthoringPatternsUtils.ts — Patrones recurrentes por day_of_week (D-ST wizard).
 */

import { classifyWeeksByTemplate } from "@nexia/shared";
import type {
    WeeklyStructureDayPatternInput,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

function cloneWeek(week: WeeklyStructureWeekCreate): WeeklyStructureWeekCreate {
    return {
        week_ordinal: week.week_ordinal,
        label: week.label ?? null,
        days: week.days.map((d) => ({
            day_of_week: d.day_of_week,
            patterns: d.patterns.map((p) => ({
                movement_pattern_id: p.movement_pattern_id,
                sub_pattern: p.sub_pattern ?? null,
            })),
        })),
    };
}

export function getPatternsForDayFromWeek1(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    dayOfWeek: number,
): WeeklyStructureDayPatternInput[] {
    const week1 = weeklyStructure.find((w) => w.week_ordinal === 1);
    const day = week1?.days.find((d) => d.day_of_week === dayOfWeek);
    return (
        day?.patterns.map((p) => ({
            movement_pattern_id: p.movement_pattern_id,
            sub_pattern: p.sub_pattern ?? null,
        })) ?? []
    );
}

function togglePatternOnList(
    patterns: readonly WeeklyStructureDayPatternInput[],
    patternId: number,
): WeeklyStructureDayPatternInput[] {
    const exists = patterns.some((p) => p.movement_pattern_id === patternId);
    if (exists) {
        return patterns
            .filter((p) => p.movement_pattern_id !== patternId)
            .map((p) => ({
                movement_pattern_id: p.movement_pattern_id,
                sub_pattern: p.sub_pattern ?? null,
            }));
    }
    return [
        ...patterns.map((p) => ({
            movement_pattern_id: p.movement_pattern_id,
            sub_pattern: p.sub_pattern ?? null,
        })),
        { movement_pattern_id: patternId, sub_pattern: null },
    ];
}

function updateWeekDayPatterns(
    week: WeeklyStructureWeekCreate,
    dayOfWeek: number,
    nextPatterns: WeeklyStructureDayPatternInput[],
): WeeklyStructureWeekCreate {
    const hasDay = week.days.some((d) => d.day_of_week === dayOfWeek);
    if (!hasDay) return cloneWeek(week);
    return {
        ...week,
        days: week.days.map((d) =>
            d.day_of_week === dayOfWeek
                ? {
                      day_of_week: d.day_of_week,
                      patterns: nextPatterns.map((p) => ({
                          movement_pattern_id: p.movement_pattern_id,
                          sub_pattern: p.sub_pattern ?? null,
                      })),
                  }
                : {
                      day_of_week: d.day_of_week,
                      patterns: d.patterns.map((p) => ({
                          movement_pattern_id: p.movement_pattern_id,
                          sub_pattern: p.sub_pattern ?? null,
                      })),
                  },
        ),
    };
}

/** Toggle en semana tipo; propaga a semanas heredadas, respeta personalizadas. */
export function togglePatternOnRecurringDay(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    dayOfWeek: number,
    patternId: number,
): WeeklyStructureWeekCreate[] {
    const week1 = weeklyStructure.find((w) => w.week_ordinal === 1);
    if (!week1) return weeklyStructure.map(cloneWeek);

    const week1Day = week1.days.find((d) => d.day_of_week === dayOfWeek);
    if (!week1Day) return weeklyStructure.map(cloneWeek);

    const nextPatterns = togglePatternOnList(week1Day.patterns, patternId);
    const kinds = classifyWeeksByTemplate(weeklyStructure, 1);

    return weeklyStructure.map((week) => {
        if (week.week_ordinal !== 1 && kinds[week.week_ordinal] === "personalizada") {
            return cloneWeek(week);
        }
        return updateWeekDayPatterns(week, dayOfWeek, nextPatterns);
    });
}

export function countConfiguredPatternDays(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    activeDays: readonly number[],
): number {
    const activeSet = new Set(activeDays);
    const week1 = weeklyStructure.find((w) => w.week_ordinal === 1);
    if (!week1) return 0;
    return week1.days.filter(
        (d) => activeSet.has(d.day_of_week) && d.patterns.length > 0,
    ).length;
}

export function allActiveDaysHavePatterns(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    activeDays: readonly number[],
): boolean {
    if (activeDays.length === 0) return false;
    return (
        countConfiguredPatternDays(weeklyStructure, activeDays) ===
        activeDays.length
    );
}

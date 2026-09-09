/**
 * blockAuthoringDaysUtils.ts — Sincronía toggles L–D ↔ semana plantilla (week 1).
 */

import { parseHabitualTrainingDaySet } from "@nexia/shared";
import type { TrainingDayValue } from "@nexia/shared/types/client";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

const TRAINING_DAY_TO_ISO: Record<TrainingDayValue, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

export function trainingDaysToIsoSet(
    trainingDays: readonly string[] | null | undefined,
): number[] {
    const set = parseHabitualTrainingDaySet(trainingDays);
    return [...set]
        .map((d) => TRAINING_DAY_TO_ISO[d])
        .sort((a, b) => a - b);
}

export function getActiveDaysFromWeek1(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
): number[] {
    const week1 = weeklyStructure.find((w) => w.week_ordinal === 1);
    if (!week1) return [];
    return [...week1.days.map((d) => d.day_of_week)].sort((a, b) => a - b);
}

/** Aplica la regla recurrente de días a todas las semanas del bloque (D-PAP). */
export function setActiveDaysOnWeek1(
    activeDays: readonly number[],
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
): WeeklyStructureWeekCreate[] {
    const sortedDays = [...activeDays].sort((a, b) => a - b);

    if (weeklyStructure.length === 0) {
        return [
            {
                week_ordinal: 1,
                label: null,
                days: sortedDays.map((dayOfWeek) => ({
                    day_of_week: dayOfWeek,
                    patterns: [],
                })),
            },
        ];
    }

    return weeklyStructure.map((week) => {
        const patternByDay = new Map<
            number,
            WeeklyStructureWeekCreate["days"][0]["patterns"]
        >();
        for (const day of week.days) {
            patternByDay.set(day.day_of_week, day.patterns);
        }

        return {
            week_ordinal: week.week_ordinal,
            label: week.label ?? null,
            days: sortedDays.map((dayOfWeek) => ({
                day_of_week: dayOfWeek,
                patterns: patternByDay.get(dayOfWeek) ?? [],
            })),
        };
    });
}

export function ensureWeek1FromTrainingDays(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    trainingDays: readonly string[] | null | undefined,
): WeeklyStructureWeekCreate[] {
    if (getActiveDaysFromWeek1(weeklyStructure).length > 0) {
        return [...weeklyStructure];
    }
    const isoDays = trainingDaysToIsoSet(trainingDays);
    if (isoDays.length === 0) return [...weeklyStructure];
    return setActiveDaysOnWeek1(isoDays, weeklyStructure);
}

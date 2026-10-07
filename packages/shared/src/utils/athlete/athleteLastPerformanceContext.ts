/**
 * athleteLastPerformanceContext.ts — CTX-1: cuándo mostrar control de rendimiento en preview.
 */

import type { AthleteLastPerformance } from "../../types/athleteLastPerformance";
import { formatLastMarkLine, formatOneRmValue } from "./athleteExerciseOneRm";

/** True si el atleta vería datos útiles en el sheet (no empty / no aplica 1RM). */
export function hasUsefulAthleteLastPerformanceContext(
    perf: AthleteLastPerformance | undefined
): boolean {
    if (!perf?.applies_one_rm) return false;
    return formatOneRmValue(perf.one_rm_kg) != null || formatLastMarkLine(perf) != null;
}

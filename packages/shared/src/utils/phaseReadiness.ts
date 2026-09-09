/**
 * phaseReadiness.ts — Estado derivado de fase (D-VAL F2).
 *
 * Contexto: deriva borrador / incompleta / lista desde datos de bloque y estructura.
 * Consumido por PhaseSummaryPanel y usePeriodBlockForm.
 *
 * Notas de mantenimiento: no persiste enum local; solo funciones puras.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import type { PlanPeriodBlock } from "../types/planningCargas";
import type { WeeklyStructureWeekCreate } from "../types/weeklyStructure";
import { getTrainingDatesInRange } from "./weeklyStructure";

export type PhaseUxLabel = "borrador" | "incompleta" | "lista";

export interface PhaseReadinessInput {
    /** Block id when persisted; absent for pre-POST constructor. */
    blockId?: number | null;
    startDate: string | null;
    endDate: string | null;
    qualities: readonly { physical_quality_id: number; percentage: number }[];
    volumeLevel: number;
    intensityLevel: number;
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    trainingDays?: readonly string[] | null;
    /** True when local edits differ from last persisted snapshot. */
    isDirty?: boolean;
    overlapDetected?: boolean;
    outsidePlanBounds?: boolean;
}

export interface PhaseReadinessChecklist {
    datesValid: boolean;
    qualitiesComplete: boolean;
    loadValid: boolean;
    structureComplete: boolean;
}

function isLoadValid(volumeLevel: number, intensityLevel: number): boolean {
    return (
        Number.isFinite(volumeLevel) &&
        Number.isFinite(intensityLevel) &&
        volumeLevel >= 1 &&
        volumeLevel <= 10 &&
        intensityLevel >= 1 &&
        intensityLevel <= 10
    );
}

/** Semana plantilla (week 1) con patrón en cada día activo — regla recurrente D-PAP. */
function isTemplateWeekStructureComplete(
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
): boolean {
    const week1 = weeklyStructure.find((week) => week.week_ordinal === 1);
    if (!week1 || week1.days.length === 0) return false;
    return week1.days.every((day) => day.patterns.length > 0);
}

function isStructureComplete(
    startDate: string,
    endDate: string,
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    trainingDays?: readonly string[] | null,
): boolean {
    const trainingDates = getTrainingDatesInRange(
        startDate,
        endDate,
        trainingDays,
    );
    if (trainingDates.length === 0) {
        return isTemplateWeekStructureComplete(weeklyStructure);
    }

    const daysWithPatterns = new Set<string>();
    for (const week of weeklyStructure) {
        for (const day of week.days) {
            if (day.patterns.length > 0) {
                daysWithPatterns.add(`${week.week_ordinal}-${day.day_of_week}`);
            }
        }
    }

    const fullCalendarCoverage = trainingDates.every((d) =>
        daysWithPatterns.has(`${d.weekOrdinal}-${d.dayOfWeek}`),
    );
    if (fullCalendarCoverage) return true;

    // Quick Program / autoría: week 1 es plantilla para todas las semanas del bloque.
    return isTemplateWeekStructureComplete(weeklyStructure);
}

/** Checklist items for Resumen / gates. */
export function buildPhaseReadinessChecklist(
    input: PhaseReadinessInput,
): PhaseReadinessChecklist {
    const qualitiesSum = input.qualities.reduce(
        (acc, q) => acc + q.percentage,
        0,
    );
    const datesValid =
        input.startDate != null &&
        input.endDate != null &&
        !input.overlapDetected &&
        !input.outsidePlanBounds;

    return {
        datesValid,
        qualitiesComplete:
            input.qualities.length > 0 && qualitiesSum === 100,
        loadValid: isLoadValid(input.volumeLevel, input.intensityLevel),
        structureComplete:
            datesValid && input.startDate && input.endDate
                ? isStructureComplete(
                      input.startDate,
                      input.endDate,
                      input.weeklyStructure,
                      input.trainingDays,
                  )
                : false,
    };
}

/** Gate aligned with POST/PUT block API (qualities 100 % + dates valid). */
export function canPersistBlock(input: PhaseReadinessInput): boolean {
    const checklist = buildPhaseReadinessChecklist(input);
    return (
        checklist.datesValid &&
        checklist.qualitiesComplete &&
        checklist.loadValid
    );
}

/** Gate for «Dejar lista» — all checklist items including structure. */
export function canActivatePhase(input: PhaseReadinessInput): boolean {
    if (!input.blockId || input.isDirty) return false;
    const checklist = buildPhaseReadinessChecklist(input);
    return (
        checklist.datesValid &&
        checklist.qualitiesComplete &&
        checklist.loadValid &&
        checklist.structureComplete
    );
}

/** UX label: borrador | incompleta | lista. */
export function derivePhaseUxLabel(input: PhaseReadinessInput): PhaseUxLabel {
    if (!input.blockId || input.isDirty) return "borrador";
    if (canActivatePhase(input)) return "lista";
    return "incompleta";
}

/** Minimal block fields for readiness when hydrating from API. */
export function phaseReadinessFromBlock(
    block: PlanPeriodBlock,
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
    extras?: Partial<PhaseReadinessInput>,
): PhaseReadinessInput {
    return {
        blockId: block.id,
        startDate: block.start_date,
        endDate: block.end_date,
        qualities: block.qualities.map((q) => ({
            physical_quality_id: q.physical_quality_id,
            percentage: q.percentage,
        })),
        volumeLevel: block.volume_level,
        intensityLevel: block.intensity_level,
        weeklyStructure,
        ...extras,
    };
}

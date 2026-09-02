/**
 * periodBlockPersistence.ts — Persistencia incremental de bloque (PRES-2 F2).
 *
 * Contexto: orquesta create/update de bloque y estructura semanal sin reescribir
 * semanas sin cambios; usado desde PlanPeriodizationSection.
 *
 * Notas de mantenimiento: diff estructural vía weekStructureDiff de @nexia/shared.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { weeksStructureEqual } from "@nexia/shared";
import { getBlockCalendarWeekCount } from "@nexia/shared";
import type {
    PlanPeriodBlock,
    PeriodBlockQualityInput,
    PlanPeriodBlockWithStructureCreate,
} from "@nexia/shared/types/planningCargas";
import type {
    WeeklyStructureOut,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

export interface PeriodBlockPersistPayload {
    start_date: string;
    end_date: string;
    volume_level: number;
    intensity_level: number;
    qualities: PeriodBlockQualityInput[];
}

function qualitiesEqual(
    a: PeriodBlockQualityInput[],
    b: PeriodBlockQualityInput[],
): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort(
        (x, y) => x.physical_quality_id - y.physical_quality_id,
    );
    const sortedB = [...b].sort(
        (x, y) => x.physical_quality_id - y.physical_quality_id,
    );
    return sortedA.every(
        (q, i) =>
            q.physical_quality_id === sortedB[i].physical_quality_id &&
            q.percentage === sortedB[i].percentage,
    );
}

/** True when scalar block fields differ from persisted block. */
export function blockFieldsChanged(
    form: PeriodBlockPersistPayload,
    block: PlanPeriodBlock,
): boolean {
    return (
        form.start_date !== block.start_date ||
        form.end_date !== block.end_date ||
        form.volume_level !== block.volume_level ||
        form.intensity_level !== block.intensity_level ||
        !qualitiesEqual(
            form.qualities,
            block.qualities.map((q) => ({
                physical_quality_id: q.physical_quality_id,
                percentage: q.percentage,
            })),
        )
    );
}

export function toBlockPersistPayload(form: {
    startDate: string;
    endDate: string;
    volumeLevel: number;
    intensityLevel: number;
    qualities: PeriodBlockQualityInput[];
}): PeriodBlockPersistPayload {
    return {
        start_date: form.startDate,
        end_date: form.endDate,
        volume_level: form.volumeLevel,
        intensity_level: form.intensityLevel,
        qualities: form.qualities,
    };
}

/** Plan de persistencia al crear bloque: solo semana tipo + apply-template si hay más semanas. */
export function resolveCreateStructurePlan(
    startDate: string,
    endDate: string,
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
): {
    templateWeek: WeeklyStructureWeekCreate | null;
    shouldApplyTemplate: boolean;
} {
    const templateWeek =
        weeklyStructure.find((w) => w.week_ordinal === 1) ?? null;
    const shouldApplyTemplate =
        templateWeek != null &&
        templateWeek.days.length > 0 &&
        getBlockCalendarWeekCount(startDate, endDate) > 1;
    return { templateWeek, shouldApplyTemplate };
}

/** Body for atomic create endpoint (D-PAP §8.4.5). */
export function toBlockCreateWithStructurePayload(
    form: {
        startDate: string;
        endDate: string;
        volumeLevel: number;
        intensityLevel: number;
        qualities: PeriodBlockQualityInput[];
    },
    weeklyStructure: readonly WeeklyStructureWeekCreate[],
): PlanPeriodBlockWithStructureCreate {
    const base = toBlockPersistPayload(form);
    const { templateWeek, shouldApplyTemplate } = resolveCreateStructurePlan(
        form.startDate,
        form.endDate,
        weeklyStructure,
    );
    return {
        ...base,
        template_week:
            templateWeek != null && templateWeek.days.length > 0
                ? templateWeek
                : null,
        apply_template_to_remaining_weeks: shouldApplyTemplate,
    };
}

type UpdateWeekFn = (args: {
    planId: number;
    blockId: number;
    weekId: number;
    body: WeeklyStructureWeekCreate;
}) => { unwrap: () => Promise<unknown> };

type CreateWeekFn = (args: {
    planId: number;
    blockId: number;
    body: WeeklyStructureWeekCreate;
}) => { unwrap: () => Promise<unknown> };

/** PUT/create only weeks whose structure changed vs persisted snapshot. */
export async function persistWeeklyStructureIncremental(
    planId: number,
    blockId: number,
    draft: WeeklyStructureWeekCreate[],
    existingStructure: WeeklyStructureOut | undefined,
    updateWeek: UpdateWeekFn,
    createWeek: CreateWeekFn,
): Promise<boolean> {
    if (draft.length === 0) return false;

    const existingByOrdinal = new Map(
        (existingStructure?.weeks ?? []).map((w) => [w.week_ordinal, w]),
    );

    let changed = false;
    for (const weekDraft of draft) {
        const existing = existingByOrdinal.get(weekDraft.week_ordinal);
        if (existing?.id != null) {
            if (weeksStructureEqual(weekDraft, existing)) continue;
            await updateWeek({
                planId,
                blockId,
                weekId: existing.id,
                body: weekDraft,
            }).unwrap();
            changed = true;
        } else {
            await createWeek({
                planId,
                blockId,
                body: weekDraft,
            }).unwrap();
            changed = true;
        }
    }
    return changed;
}

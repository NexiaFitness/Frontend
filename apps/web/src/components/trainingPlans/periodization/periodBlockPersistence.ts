/**
 * periodBlockPersistence.ts — Persistencia incremental de bloque (PRES-2 F2).
 *
 * Contexto: orquesta create/update de bloque y estructura semanal sin reescribir
 * semanas sin cambios; usado desde PlanPeriodizationSection.
 *
 * Notas de mantenimiento: diff estructural vía weekStructureDiff de @nexia/shared;
 * edit con cambio de semana tipo usa POST sync-recurring (atómico BE).
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { classifyWeeksByTemplate, weeksStructureEqual } from "@nexia/shared";
import { getBlockCalendarWeekCount } from "@nexia/shared";
import type {
    PlanPeriodBlock,
    PeriodBlockQualityInput,
    PlanPeriodBlockWithStructureCreate,
} from "@nexia/shared/types/planningCargas";
import type {
    WeeklyStructureOut,
    WeeklyStructureSyncRecurringIn,
    WeeklyStructureWeek,
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

type SyncRecurringFn = (args: {
    planId: number;
    blockId: number;
    body: WeeklyStructureSyncRecurringIn;
}) => { unwrap: () => Promise<unknown> };

const TEMPLATE_WEEK_ORDINAL = 1;

/** Copia profunda de draft/baseline para evitar referencias compartidas draft↔baseline. */
export function cloneWeeklyStructureDraft(
    weeks: readonly WeeklyStructureWeekCreate[],
): WeeklyStructureWeekCreate[] {
    return weeks.map((w) => ({
        week_ordinal: w.week_ordinal,
        label: w.label ?? null,
        days: w.days.map((d) => ({
            day_of_week: d.day_of_week,
            patterns: d.patterns.map((p) => ({
                movement_pattern_id: p.movement_pattern_id,
                sub_pattern: p.sub_pattern ?? null,
            })),
        })),
    }));
}

/** Normaliza semanas persistidas → draft editable (sin ids de BD). */
export function weeklyStructureToDraft(
    weeks: readonly WeeklyStructureWeek[],
): WeeklyStructureWeekCreate[] {
    return cloneWeeklyStructureDraft(
        weeks.map((w) => ({
            week_ordinal: w.week_ordinal,
            label: w.label ?? null,
            days: w.days.map((d) => ({
                day_of_week: d.day_of_week,
                patterns: d.patterns.map((p) => ({
                    movement_pattern_id: p.movement_pattern_id,
                    sub_pattern: p.sub_pattern ?? null,
                })),
            })),
        })),
    );
}

export interface PersistWeeklyStructureOptions {
    /** Surfaces D-PRES: no caer al diff vs RTK cache cuando falta baseline local. */
    requireBaselineDiff?: boolean;
}

/** Mapa week_ordinal → id de BD para PUT incremental. */
export function mapWeekIdsByOrdinal(
    structure: WeeklyStructureOut | undefined,
): Map<number, number> {
    const ids = new Map<number, number>();
    for (const week of structure?.weeks ?? []) {
        if (week.id != null) {
            ids.set(week.week_ordinal, week.id);
        }
    }
    return ids;
}

function weekChangedVsBaseline(
    weekDraft: WeeklyStructureWeekCreate,
    baselineByOrdinal: Map<number, WeeklyStructureWeekCreate>,
): boolean {
    const baselineWeek = baselineByOrdinal.get(weekDraft.week_ordinal);
    if (baselineWeek == null) return true;
    return !weeksStructureEqual(weekDraft, baselineWeek);
}

async function putOrCreateWeekDraft(
    planId: number,
    blockId: number,
    weekDraft: WeeklyStructureWeekCreate,
    weekIdsByOrdinal: Map<number, number>,
    existingByOrdinal: Map<number, { id?: number | null }>,
    updateWeek: UpdateWeekFn,
    createWeek: CreateWeekFn,
): Promise<void> {
    const weekId =
        weekIdsByOrdinal.get(weekDraft.week_ordinal) ??
        existingByOrdinal.get(weekDraft.week_ordinal)?.id;

    if (weekId != null) {
        await updateWeek({
            planId,
            blockId,
            weekId,
            body: weekDraft,
        }).unwrap();
        return;
    }

    await createWeek({
        planId,
        blockId,
        body: weekDraft,
    }).unwrap();
}

/**
 * Edit D-PAP: sync-recurring atómico cuando cambia semana tipo; PUT incremental
 * para personalizadas locales o cambios que no tocan la plantilla.
 */
export async function persistBlockStructureEdit(
    planId: number,
    blockId: number,
    blockStartDate: string,
    blockEndDate: string,
    draft: WeeklyStructureWeekCreate[],
    diffBaseline: readonly WeeklyStructureWeekCreate[],
    existingStructure: WeeklyStructureOut | undefined,
    updateWeek: UpdateWeekFn,
    createWeek: CreateWeekFn,
    syncRecurring: SyncRecurringFn,
): Promise<boolean> {
    if (draft.length === 0 || diffBaseline.length === 0) {
        return false;
    }

    const baselineByOrdinal = new Map(
        diffBaseline.map((w) => [w.week_ordinal, w]),
    );
    const existingByOrdinal = new Map(
        (existingStructure?.weeks ?? []).map((w) => [w.week_ordinal, w]),
    );
    const weekIdsByOrdinal = mapWeekIdsByOrdinal(existingStructure);
    void blockStartDate;
    void blockEndDate;

    const changedOrdinals = draft
        .filter((weekDraft) =>
            weekChangedVsBaseline(weekDraft, baselineByOrdinal),
        )
        .map((weekDraft) => weekDraft.week_ordinal);

    if (changedOrdinals.length === 0) {
        return false;
    }

    let changed = false;
    const templateChanged = changedOrdinals.includes(TEMPLATE_WEEK_ORDINAL);

    if (templateChanged) {
        const templateDraft = draft.find(
            (w) => w.week_ordinal === TEMPLATE_WEEK_ORDINAL,
        );
        if (templateDraft == null) {
            return false;
        }

        const baselineKinds = classifyWeeksByTemplate(
            diffBaseline,
            TEMPLATE_WEEK_ORDINAL,
        );
        const personalizedUpdates = draft.filter((weekDraft) => {
            if (weekDraft.week_ordinal === TEMPLATE_WEEK_ORDINAL) {
                return false;
            }
            if (baselineKinds[weekDraft.week_ordinal] !== "personalizada") {
                return false;
            }
            return weekChangedVsBaseline(weekDraft, baselineByOrdinal);
        });

        await syncRecurring({
            planId,
            blockId,
            body: {
                template_week: templateDraft,
                personalized_week_updates:
                    personalizedUpdates.length > 0
                        ? personalizedUpdates
                        : undefined,
            },
        }).unwrap();
        changed = true;

        return changed;
    }

    for (const weekDraft of draft) {
        if (!weekChangedVsBaseline(weekDraft, baselineByOrdinal)) {
            continue;
        }
        await putOrCreateWeekDraft(
            planId,
            blockId,
            weekDraft,
            weekIdsByOrdinal,
            existingByOrdinal,
            updateWeek,
            createWeek,
        );
        changed = true;
    }

    return changed;
}

/** PUT/create only weeks whose structure changed vs persisted snapshot. */
export async function persistWeeklyStructureIncremental(
    planId: number,
    blockId: number,
    draft: WeeklyStructureWeekCreate[],
    existingStructure: WeeklyStructureOut | undefined,
    updateWeek: UpdateWeekFn,
    createWeek: CreateWeekFn,
    /** Local persisted snapshot for diff (D-PRES). Obligatorio en surfaces con baseline. */
    diffBaseline?: readonly WeeklyStructureWeekCreate[],
    options?: PersistWeeklyStructureOptions,
): Promise<boolean> {
    if (draft.length === 0) return false;

    if (
        options?.requireBaselineDiff &&
        (diffBaseline == null || diffBaseline.length === 0)
    ) {
        return false;
    }

    const existingByOrdinal = new Map(
        (existingStructure?.weeks ?? []).map((w) => [w.week_ordinal, w]),
    );
    const baselineByOrdinal = new Map(
        (diffBaseline ?? []).map((w) => [w.week_ordinal, w]),
    );
    const weekIdsByOrdinal = mapWeekIdsByOrdinal(existingStructure);
    const useBaselineDiff = diffBaseline != null && diffBaseline.length > 0;

    let changed = false;
    for (const weekDraft of draft) {
        if (useBaselineDiff) {
            if (!weekChangedVsBaseline(weekDraft, baselineByOrdinal)) {
                continue;
            }
        } else {
            const existing = existingByOrdinal.get(weekDraft.week_ordinal);
            if (
                existing != null &&
                weeksStructureEqual(weekDraft, existing)
            ) {
                continue;
            }
        }

        const weekId =
            weekIdsByOrdinal.get(weekDraft.week_ordinal) ??
            existingByOrdinal.get(weekDraft.week_ordinal)?.id;

        if (weekId != null) {
            await updateWeek({
                planId,
                blockId,
                weekId,
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

/**
 * planningShellUtils.ts — Helpers de dominio para shell F5 (explore · createWhen).
 */

import type { ActivePlanByClientOut, TrainingPlan } from "@nexia/shared/types/training";
import { TRAINING_PLAN_STATUS } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import {
    findNextFreeDate,
    isDateInRange,
} from "@nexia/shared/utils/periodBlockOverlap";

export function findBlockContainingDate(
    blocks: PlanPeriodBlock[],
    dateStr: string,
): PlanPeriodBlock | undefined {
    return blocks.find((block) =>
        isDateInRange(dateStr, block.start_date, block.end_date),
    );
}

function parseLocal(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function formatProgramDurationLabel(start: string, end: string): string {
    const ms = parseLocal(end).getTime() - parseLocal(start).getTime();
    const weeks = Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
    if (weeks < 4) {
        return `${weeks} sem`;
    }
    const months = Math.floor(weeks / 4);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
}

/** Primer día libre para añadir fase tras el bloque más tardío (F5 addPhase). */
export function resolveNextPhaseStartDate(
    blocks: PlanPeriodBlock[],
    planStartDate?: string | null,
): string | null {
    if (blocks.length === 0) {
        return planStartDate ?? null;
    }
    const latestEnd = blocks.reduce(
        (max, block) => (block.end_date > max ? block.end_date : max),
        blocks[0].end_date,
    );
    return findNextFreeDate(latestEnd, blocks);
}

/** Hay al menos un día libre dentro de la vigencia del plan para otra fase. */
export function canAddPeriodPhase(
    blocks: PlanPeriodBlock[],
    planStartDate?: string | null,
    planEndDate?: string | null,
): boolean {
    if (!planStartDate || !planEndDate) {
        return false;
    }
    const nextStart = resolveNextPhaseStartDate(blocks, planStartDate);
    if (!nextStart) {
        return false;
    }
    return isDateInRange(nextStart, planStartDate, planEndDate);
}

export function resolveCalendarMonthForDate(dateStr: string): Date {
    const [y, m] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, 1);
}

/** G9 — id de bloque enfocado desde ?focus= si existe en la lista. */
export function parseFocusedBlockId(
    searchParams: URLSearchParams,
    blocks: readonly PlanPeriodBlock[],
): number | null {
    const raw = searchParams.get("focus");
    if (!raw) {
        return null;
    }
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
        return null;
    }
    if (!blocks.some((block) => block.id === id)) {
        return null;
    }
    return id;
}

/** true si hay ?focus= pero no referencia un bloque válido (saneo URL). */
export function hasStaleFocusParam(
    searchParams: URLSearchParams,
    blocks: readonly PlanPeriodBlock[],
    pendingFocusBlockId: number | null = null,
): boolean {
    const raw = searchParams.get("focus");
    if (!raw) {
        return false;
    }
    const id = Number(raw);
    if (
        pendingFocusBlockId != null &&
        Number.isFinite(id) &&
        id === pendingFocusBlockId
    ) {
        return false;
    }
    return parseFocusedBlockId(searchParams, blocks) === null;
}

/**
 * G9 — foco efectivo tras create: tolera ?focus= hasta que RTK refetch incluya el bloque.
 */
export function resolveFocusedBlockId(
    searchParams: URLSearchParams,
    blocks: readonly PlanPeriodBlock[],
    pendingFocusBlockId: number | null = null,
): number | null {
    const parsed = parseFocusedBlockId(searchParams, blocks);
    if (parsed != null) {
        return parsed;
    }
    const raw = searchParams.get("focus");
    if (!raw || pendingFocusBlockId == null) {
        return null;
    }
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
        return null;
    }
    return id === pendingFocusBlockId ? id : null;
}

function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** ¿Algún día del bloque cae en el mes visible del calendario? */
export function isPeriodBlockVisibleInMonth(
    block: PlanPeriodBlock,
    month: Date,
): boolean {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const blockStart = parseLocalDate(block.start_date);
    const blockEnd = parseLocalDate(block.end_date);
    return blockStart <= monthEnd && blockEnd >= monthStart;
}

/** Forma de plan para hero / panel (display_name / display_goal). */
export function toActivePlanDisplay(plan: TrainingPlan): ActivePlanByClientOut {
    return {
        ...plan,
        display_name: plan.name,
        display_goal: plan.goal,
    };
}

/** Historial colapsable en detalle de plan: más de un plan asignado. */
export function hasMultipleClientTrainingPlans(
    trainingPlans: readonly TrainingPlan[] | undefined,
): boolean {
    return (trainingPlans?.length ?? 0) > 1;
}

/** Hub sin plan operativo: mostrar lista si hay al menos un plan en el cliente. */
export function shouldShowPlanningHubPlanList(
    trainingPlans: readonly TrainingPlan[] | undefined,
): boolean {
    return (trainingPlans?.length ?? 0) >= 1;
}

/** Hub: título "Historial" solo con dos o más planes (un plan = tarjeta sin etiqueta). */
export function shouldShowPlanningHubHistoryLabel(
    trainingPlans: readonly TrainingPlan[] | undefined,
): boolean {
    return (trainingPlans?.length ?? 0) >= 2;
}

function isClientPlanActive(plan: TrainingPlan): boolean {
    return plan.status === TRAINING_PLAN_STATUS.ACTIVE || plan.is_active === true;
}

/** Clave ISO para ordenar historial (fin del plan, luego inicio). */
function planHistorySortKey(plan: TrainingPlan): string {
    return plan.end_date || plan.start_date || plan.created_at;
}

/**
 * Listado de planes del cliente: activo primero; resto hacia atrás (más reciente → más antiguo).
 */
export function sortClientTrainingPlansForDisplay(
    plans: readonly TrainingPlan[],
): TrainingPlan[] {
    return [...plans].sort((a, b) => {
        const aActive = isClientPlanActive(a);
        const bActive = isClientPlanActive(b);
        if (aActive !== bActive) {
            return aActive ? -1 : 1;
        }
        const byEnd = planHistorySortKey(b).localeCompare(planHistorySortKey(a));
        if (byEnd !== 0) {
            return byEnd;
        }
        return b.id - a.id;
    });
}

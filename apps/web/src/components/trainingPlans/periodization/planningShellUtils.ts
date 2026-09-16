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

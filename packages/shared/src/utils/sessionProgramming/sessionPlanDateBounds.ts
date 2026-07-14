/**
 * sessionPlanDateBounds.ts — Límites de fecha de sesión según vigencia del plan
 *
 * Contexto: instanciar plantilla y crear sesión deben permitir cualquier día
 * dentro de [start_date, end_date] del plan seleccionado (incl. días pasados del bloque).
 * Sin DOM ni React.
 */

import {
    formatLocalDateOnly,
    isDateInClosedInterval,
    toDateOnlyString,
} from "../../training/activePeriodBlock";

export interface TrainingPlanDateRange {
    start_date: string;
    end_date: string;
}

export interface SessionDateBounds {
    min: string | undefined;
    max: string | undefined;
}

export function resolveSessionDateBoundsForPlan(
    plan: TrainingPlanDateRange | null | undefined
): SessionDateBounds {
    if (!plan) {
        return { min: undefined, max: undefined };
    }
    const min = toDateOnlyString(plan.start_date);
    const max = toDateOnlyString(plan.end_date);
    return {
        min: min || undefined,
        max: max || undefined,
    };
}

export function clampSessionDateToPlan(
    sessionDate: string,
    plan: TrainingPlanDateRange | null | undefined
): string {
    const normalized = toDateOnlyString(sessionDate);
    if (!normalized || !plan) {
        return normalized || sessionDate;
    }
    const { min, max } = resolveSessionDateBoundsForPlan(plan);
    let clamped = normalized;
    if (min && clamped < min) {
        clamped = min;
    }
    if (max && clamped > max) {
        clamped = max;
    }
    return clamped;
}

export function validateSessionDateWithinPlan(
    sessionDate: string,
    plan: TrainingPlanDateRange | null | undefined
): string | null {
    if (!sessionDate.trim()) {
        return "La fecha es obligatoria";
    }
    if (!plan) {
        return null;
    }
    const day = toDateOnlyString(sessionDate);
    const { min, max } = resolveSessionDateBoundsForPlan(plan);
    if (!day || !min || !max) {
        return "El plan seleccionado no tiene vigencia válida";
    }
    if (!isDateInClosedInterval(day, min, max)) {
        return `La fecha debe estar entre ${min} y ${max} (vigencia del plan)`;
    }
    return null;
}

/**
 * Fecha por defecto al elegir plan: hoy si cae en vigencia; si no, el borde más cercano.
 */
export function suggestDefaultSessionDateForPlan(
    plan: TrainingPlanDateRange,
    referenceDate?: string
): string {
    const today = toDateOnlyString(referenceDate) || formatLocalDateOnly(new Date());
    const { min, max } = resolveSessionDateBoundsForPlan(plan);
    if (!min || !max) {
        return today;
    }
    if (isDateInClosedInterval(today, min, max)) {
        return today;
    }
    if (today < min) {
        return min;
    }
    return max;
}

export interface TrainingPlanPickerLike {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
}

/**
 * Prefiere plan activo que cubre hoy; si hay varios, mayor id (más reciente).
 */
export function pickDefaultTrainingPlanId(
    plans: TrainingPlanPickerLike[],
    referenceDate?: string
): number | null {
    if (plans.length === 0) {
        return null;
    }
    const today = toDateOnlyString(referenceDate) || formatLocalDateOnly(new Date());
    const active = plans.filter((p) => p.status === "active");
    const covering = active.filter((p) =>
        isDateInClosedInterval(today, p.start_date, p.end_date)
    );
    if (covering.length > 0) {
        return covering.reduce((best, cur) => (cur.id > best.id ? cur : best)).id;
    }
    if (active.length === 1) {
        return active[0].id;
    }
    return null;
}

/**
 * planAssignmentResolve.ts — Resolución CURRENT y solape de instancias (espejo BE plan_assignment_resolve).
 *
 * Intervalos inclusivos por día (YYYY-MM-DD). Sin React ni RTK.
 */

import type { TrainingPlanInstance } from "../types/training";
import {
    formatLocalDateOnly,
    isDateInClosedInterval,
    toDateOnlyString,
} from "./activePeriodBlock";

export interface AssignmentOverlapInstanceDetail {
    instance_id: number;
    source_plan_id: number | null;
    start_date: string;
    end_date: string;
    proposed_end_date: string | null;
    will_complete: boolean;
}

export interface AssignmentOverlapApiDetail {
    code: "assignment_overlap_requires_confirmation";
    message: string;
    incoming_start: string;
    incoming_end: string;
    overlapping_instances: AssignmentOverlapInstanceDetail[];
}

export function dayBeforeYmd(day: string): string {
    const d = toDateOnlyString(day);
    if (!d) return "";
    const [y, m, dayNum] = d.split("-").map(Number);
    const dt = new Date(y, m - 1, dayNum);
    dt.setDate(dt.getDate() - 1);
    return formatLocalDateOnly(dt);
}

/** Inclusive interval overlap (aligned with backend assignment_ranges_overlap). */
export function assignmentRangesOverlap(
    aStart: string,
    aEnd: string,
    bStart: string,
    bEnd: string
): boolean {
    const as = toDateOnlyString(aStart);
    const ae = toDateOnlyString(aEnd);
    const bs = toDateOnlyString(bStart);
    const be = toDateOnlyString(bEnd);
    if (!as || !ae || !bs || !be) return false;
    return as <= be && ae >= bs;
}

export function proposedTrimEndYmd(
    existingStart: string,
    incomingStart: string
): string | null {
    const newEnd = dayBeforeYmd(incomingStart);
    const es = toDateOnlyString(existingStart);
    if (!newEnd || !es) return null;
    if (newEnd < es) return null;
    return newEnd;
}

export interface FindCommittedOverlapOptions {
    trainerId?: number;
    exceptInstanceId?: number;
}

/** Instancias comprometidas (active + is_active) que solapan el rango incoming. */
export function findOverlappingCommittedInstances(
    instances: TrainingPlanInstance[],
    clientId: number,
    rangeStart: string,
    rangeEnd: string,
    options?: FindCommittedOverlapOptions
): TrainingPlanInstance[] {
    const rs = toDateOnlyString(rangeStart);
    const re = toDateOnlyString(rangeEnd);
    if (!rs || !re || clientId <= 0) return [];

    return instances
        .filter((inst) => {
            if (inst.client_id !== clientId) return false;
            if (inst.status !== "active") return false;
            if (inst.is_active === false) return false;
            if (options?.trainerId != null && inst.trainer_id !== options.trainerId) {
                return false;
            }
            if (
                options?.exceptInstanceId != null &&
                inst.id === options.exceptInstanceId
            ) {
                return false;
            }
            const is = toDateOnlyString(inst.start_date);
            const ie = toDateOnlyString(inst.end_date);
            return assignmentRangesOverlap(is, ie, rs, re);
        })
        .sort((a, b) => {
            const sa = toDateOnlyString(a.start_date);
            const sb = toDateOnlyString(b.start_date);
            if (sa !== sb) return sa < sb ? -1 : 1;
            return a.id - b.id;
        });
}

/**
 * CURRENT: única instancia comprometida cuya ventana cubre referenceDate. Sin fallback futuro.
 */
/** Instancia comprometida ligada a un documento `TrainingPlan` (source_plan_id). */
export function findCommittedInstanceForSourcePlan(
    instances: TrainingPlanInstance[],
    clientId: number,
    sourcePlanId: number
): TrainingPlanInstance | undefined {
    if (clientId <= 0 || sourcePlanId <= 0) return undefined;
    return instances.find(
        (inst) =>
            inst.client_id === clientId &&
            inst.status === "active" &&
            inst.is_active !== false &&
            inst.source_plan_id === sourcePlanId
    );
}

/** Aplica ventana de asignación sobre fechas del documento (vigencia operativa en UI). */
/** Sesión de plan dentro de la ventana asignada (CURRENT operativo; SPEC §3.6 post-recorte). */
export function isTrainingSessionInCommittedAssignmentWindow(
    sessionDate: string | null | undefined,
    assignmentStart: string | null | undefined,
    assignmentEnd: string | null | undefined
): boolean {
    const day = toDateOnlyString(sessionDate);
    if (!day) return false;
    return isDateInClosedInterval(day, assignmentStart ?? "", assignmentEnd ?? "");
}

export function filterTrainingSessionsInCommittedAssignmentWindow<
    T extends { session_date?: string | null },
>(
    sessions: T[],
    assignmentStart: string | null | undefined,
    assignmentEnd: string | null | undefined
): T[] {
    if (!assignmentStart || !assignmentEnd) return sessions;
    return sessions.filter((s) =>
        isTrainingSessionInCommittedAssignmentWindow(
            s.session_date,
            assignmentStart,
            assignmentEnd
        )
    );
}

export function applyCommittedInstanceWindowToPlan<T extends { start_date: string; end_date: string }>(
    plan: T,
    instance: TrainingPlanInstance | undefined
): T {
    if (!instance) return plan;
    const start = toDateOnlyString(instance.start_date) ?? instance.start_date;
    const end = toDateOnlyString(instance.end_date) ?? instance.end_date;
    return { ...plan, start_date: start, end_date: end };
}

export function pickAssignmentCoveringDate(
    instances: TrainingPlanInstance[],
    clientId: number,
    referenceDate: Date,
    trainerId?: number
): TrainingPlanInstance | undefined {
    if (clientId <= 0) return undefined;
    const day = formatLocalDateOnly(referenceDate);
    if (!day) return undefined;

    const covering = instances.filter((inst) => {
        if (inst.client_id !== clientId) return false;
        if (inst.status !== "active") return false;
        if (inst.is_active === false) return false;
        if (trainerId != null && inst.trainer_id !== trainerId) return false;
        return isDateInClosedInterval(day, inst.start_date, inst.end_date);
    });

    if (covering.length === 0) return undefined;
    return covering.reduce((best, cur) =>
        toDateOnlyString(cur.start_date) > toDateOnlyString(best.start_date) ||
        (toDateOnlyString(cur.start_date) === toDateOnlyString(best.start_date) &&
            cur.id > best.id)
            ? cur
            : best
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/** Extrae detail 409 assignment_overlap desde error RTK/Fetch. */
export function parseAssignmentOverlapApiDetail(
    error: unknown
): AssignmentOverlapApiDetail | null {
    if (!isRecord(error)) return null;
    const data =
        "data" in error && isRecord(error.data)
            ? error.data
            : "detail" in error
              ? error.detail
              : null;
    if (!isRecord(data)) return null;
    if (data.code !== "assignment_overlap_requires_confirmation") return null;
    if (!Array.isArray(data.overlapping_instances)) return null;
    if (typeof data.message !== "string") return null;
    if (typeof data.incoming_start !== "string") return null;
    if (typeof data.incoming_end !== "string") return null;
    return {
        code: "assignment_overlap_requires_confirmation",
        message: data.message,
        incoming_start: data.incoming_start,
        incoming_end: data.incoming_end,
        overlapping_instances: data.overlapping_instances as AssignmentOverlapInstanceDetail[],
    };
}

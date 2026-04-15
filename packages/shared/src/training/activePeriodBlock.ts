/**
 * activePeriodBlock.ts — Resolución pura de instancia de plan y bloque de periodización activos.
 *
 * Contexto: sin React ni RTK. Usado por useClientActiveBlock para coherencia por bloque en pestaña cliente.
 * Contrato de fechas: strings YYYY-MM-DD (o ISO prefijable a 10 caracteres).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { PlanPeriodBlock } from "../types/planningCargas";
import type { TrainingPlanInstance } from "../types/training";

/** Normaliza a YYYY-MM-DD para comparación lexicográfica segura entre fechas calendario. */
export function toDateOnlyString(isoDate: string | null | undefined): string {
    if (isoDate == null || isoDate === "") return "";
    const trimmed = isoDate.trim();
    return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

/** Fecha local del calendario (no UTC) en YYYY-MM-DD; alineado con “hoy” del entrenador en su zona. */
export function formatLocalDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * ¿Está day (YYYY-MM-DD) en [start, end] inclusive?
 */
export function isDateInClosedInterval(
    day: string,
    rangeStart: string,
    rangeEnd: string
): boolean {
    const d = toDateOnlyString(day);
    const a = toDateOnlyString(rangeStart);
    const b = toDateOnlyString(rangeEnd);
    if (!d || !a || !b) return false;
    return d >= a && d <= b;
}

export interface FindActivePlanPeriodBlockOptions {
    /** Excluir bloques con is_active === false (default true). */
    requireBlockRowActive?: boolean;
}

/**
 * Bloque de periodización que contiene la fecha de referencia (día inclusive).
 * Si varios califican: menor sort_order (null al final), luego menor id.
 */
export function findActivePlanPeriodBlock(
    blocks: PlanPeriodBlock[],
    referenceDate: Date,
    options?: FindActivePlanPeriodBlockOptions
): PlanPeriodBlock | undefined {
    const requireRowActive = options?.requireBlockRowActive !== false;
    const day = toDateOnlyString(referenceDate.toISOString());
    if (!day) return undefined;

    const candidates = blocks.filter((b) => {
        if (requireRowActive && b.is_active === false) return false;
        const start = toDateOnlyString(b.start_date);
      const end = toDateOnlyString(b.end_date);
        return start !== "" && end !== "" && isDateInClosedInterval(day, start, end);
    });

    if (candidates.length === 0) return undefined;

    candidates.sort((x, y) => {
        const ox = x.sort_order ?? Number.MAX_SAFE_INTEGER;
        const oy = y.sort_order ?? Number.MAX_SAFE_INTEGER;
        if (ox !== oy) return ox - oy;
        return x.id - y.id;
    });

    return candidates[0];
}

/**
 * Elige la instancia operativa para el cliente en la fecha dada:
 * Regla (spec): solo puede existir 1 instancia status="active" por cliente; puede ser futura.
 *
 * Prioridad:
 * 1) instancia "active" cuyo rango contiene referenceDate (si existe)
 * 2) si no existe, instancia "active" futura más cercana (start_date asc)
 *
 * Nota: en el caso 1) si hay varias por data inconsistente, se elige mayor id.
 */
export function pickActiveTrainingPlanInstanceForToday(
    instances: TrainingPlanInstance[],
    clientId: number,
    referenceDate: Date
): TrainingPlanInstance | undefined {
    if (clientId <= 0) return undefined;
    const day = formatLocalDateOnly(referenceDate);
    if (!day) return undefined;

    const covering = instances.filter(
        (inst) =>
            inst.client_id === clientId &&
            inst.status === "active" &&
            isDateInClosedInterval(day, inst.start_date, inst.end_date)
    );

    if (covering.length > 0) {
        return covering.reduce((best, cur) => (cur.id > best.id ? cur : best));
    }

    // No coverage today: choose nearest future active instance (start_date asc, tie id asc)
    const future = instances
        .filter((inst) => inst.client_id === clientId && inst.status === "active")
        .filter((inst) => {
            const start = toDateOnlyString(inst.start_date);
            return start !== "" && start > day;
        })
        .sort((a, b) => {
            const sa = toDateOnlyString(a.start_date);
            const sb = toDateOnlyString(b.start_date);
            if (sa !== sb) return sa < sb ? -1 : 1;
            return a.id - b.id;
        });

    return future[0];
}

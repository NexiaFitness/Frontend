/**
 * planBlockAnalytics.ts — Métricas D1–D4, D3, D7 y normalización §12 (modo bloques).
 *
 * Lógica pura: sin fetch ni DOM. U1 = 20 % como razón 0.2 en comparaciones.
 *
 * @see docs/specs/SPEC_TAB_GRAFICOS_PLAN_ENTRENAMIENTO.md
 */

import type { PlanPeriodBlock } from "../types/planningCargas";

/** U1: umbral de alineación / desviación (20 %). */
export const PLAN_ANALYTICS_DEVIATION_RATIO = 0.2;

/** Límite de seguridad §13 al componer sesiones por paginación en FE. */
export const PLAN_ANALYTICS_SESSION_FETCH_MAX = 2000;

/** Tamaño de página alineado con backend `limit` máx. */
export const PLAN_ANALYTICS_SESSION_PAGE_SIZE = 1000;

export interface PlanBlockAnalyticsSession {
    id: number;
    session_name?: string;
    period_block_id: number | null;
    session_date: string | null;
    is_generic_session: boolean;
    status: string;
    is_active: boolean;
    planned_volume: number | null;
    planned_intensity: number | null;
    actual_volume: number | null;
    actual_intensity: number | null;
}

export interface WeeklyAlignmentBar {
    /** Lunes de la semana (YYYY-MM-DD, local). */
    weekStartIso: string;
    /** Etiqueta corta eje X (p. ej. S1). */
    weekLabel: string;
    /** Porcentaje 0–100 o null si denominador 0. */
    pct: number | null;
    /** Texto para tooltip: inicio ISO + rango. */
    tooltipDetail: string;
}

export interface VolumeIntensityPoint {
    sessionId: number;
    date: string;
    planVolume: number;
    planIntensity: number;
    realVolume: number | null;
    realIntensity: number | null;
}

export interface DeviationListItem {
    sessionId: number;
    sessionDate: string | null;
    sessionName: string;
    deviationKind: "volume" | "intensity" | "both";
    volumeDeviationPct: number;
    intensityDeviationPct: number;
}

export interface PlanBlockAnalyticsResult {
    d1CoherenceGlobalPct: number | null;
    d2LoadDeviationPct: number | null;
    d3WeeklyAlignment: WeeklyAlignmentBar[];
    d4Deviations: DeviationListItem[];
    d7VolumeIntensitySeries: VolumeIntensityPoint[];
    /** Sesiones completadas evaluables (D1 denominador). */
    d1CompletedEvaluableCount: number;
    /** Sesiones completadas alineadas dual (D1 numerador). */
    d1AlignedCompletedCount: number;
    /** N sesiones D2 (volumen). */
    d2SessionCount: number;
    /** Sesiones sin fecha y marcadas genéricas (§13). */
    genericWithoutDateCount: number;
}

/**
 * Normalización §12: planned/actual de sesión a escala 0–10 para comparar con bloque.
 */
export function normalizeSessionLoadToTen(value: number | null | undefined): number | null {
    if (value == null || Number.isNaN(value)) {
        return null;
    }
    if (value === 0) {
        return 0;
    }
    if (value > 0 && value <= 1) {
        return Math.min(10, Math.max(0, value * 10));
    }
    return Math.min(10, Math.max(0, value));
}

export function computeD6AdherencePct(
    sessionsCompleted: number,
    sessionsPlanned: number
): number | null {
    if (sessionsPlanned <= 0) {
        return null;
    }
    return (100 * sessionsCompleted) / sessionsPlanned;
}

function parseYmdLocal(ymd: string): Date {
    const [y, m, d] = ymd.split("-").map((p) => parseInt(p, 10));
    return new Date(y, m - 1, d);
}

function formatYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Lunes de la semana calendario (local) que contiene `ymd`. */
export function mondayOfWeekContaining(ymd: string): string {
    const d = parseYmdLocal(ymd);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    return formatYmd(d);
}

function addDaysYmd(ymd: string, days: number): string {
    const d = parseYmdLocal(ymd);
    d.setDate(d.getDate() + days);
    return formatYmd(d);
}

function ymdCompare(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function dateInRangeInclusive(d: string, start: string, end: string): boolean {
    return ymdCompare(d, start) >= 0 && ymdCompare(d, end) <= 0;
}

function activeBlockById(
    blocks: PlanPeriodBlock[],
    id: number | null
): PlanPeriodBlock | null {
    if (id == null) return null;
    const b = blocks.find((x) => x.id === id && x.is_active);
    return b ?? null;
}

function dualAligned(
    pv: number,
    pi: number,
    block: PlanPeriodBlock,
    ratio: number
): boolean {
    if (block.volume_level <= 0 || block.intensity_level <= 0) {
        return false;
    }
    const vOk =
        Math.abs(pv - block.volume_level) / block.volume_level <= ratio;
    const iOk =
        Math.abs(pi - block.intensity_level) / block.intensity_level <= ratio;
    return vOk && iOk;
}

function volumeDeviationPct(pv: number, block: PlanPeriodBlock): number | null {
    if (block.volume_level <= 0) return null;
    return (Math.abs(pv - block.volume_level) / block.volume_level) * 100;
}

function intensityDeviationPct(pi: number, block: PlanPeriodBlock): number | null {
    if (block.intensity_level <= 0) return null;
    return (Math.abs(pi - block.intensity_level) / block.intensity_level) * 100;
}

function collectWeekStartsInPlanRange(planStart: string, planEnd: string): string[] {
    const keys = new Set<string>();
    let cur = mondayOfWeekContaining(planStart);
    const endMon = mondayOfWeekContaining(planEnd);
    let guard = 0;
    while (guard++ < 520) {
        keys.add(cur);
        if (cur === endMon) break;
        cur = addDaysYmd(cur, 7);
    }
    return Array.from(keys).sort(ymdCompare);
}

/**
 * Agrega D1–D4, D3 (semanas) y D7 a partir de bloques activos y sesiones del plan.
 */
export function computePlanBlockAnalytics(
    blocks: PlanPeriodBlock[],
    sessions: PlanBlockAnalyticsSession[],
    planStartDate: string,
    planEndDate: string,
    options?: { deviationRatio?: number }
): PlanBlockAnalyticsResult {
    const ratio = options?.deviationRatio ?? PLAN_ANALYTICS_DEVIATION_RATIO;
    const nameOf = (s: PlanBlockAnalyticsSession) => s.session_name ?? `Sesión #${s.id}`;

    let d1CompletedEvaluable = 0;
    let d1AlignedCompleted = 0;
    const d2Devs: number[] = [];
    const d4Items: DeviationListItem[] = [];
    const d7: VolumeIntensityPoint[] = [];

    type WeekAgg = { aligned: number; denom: number };
    const weekStarts = collectWeekStartsInPlanRange(planStartDate, planEndDate);
    const weekMap = new Map<string, WeekAgg>();
    for (const w of weekStarts) {
        weekMap.set(w, { aligned: 0, denom: 0 });
    }

    let genericWithoutDateCount = 0;

    for (const s of sessions) {
        if (!s.is_active) continue;

        if (s.is_generic_session && !s.session_date) {
            genericWithoutDateCount += 1;
        }

        const block = activeBlockById(blocks, s.period_block_id);
        const pv = normalizeSessionLoadToTen(s.planned_volume);
        const pi = normalizeSessionLoadToTen(s.planned_intensity);

        const d1EvaluableCompleted =
            s.status === "completed" &&
            block != null &&
            pv != null &&
            pi != null &&
            block.volume_level > 0 &&
            block.intensity_level > 0;

        if (d1EvaluableCompleted) {
            d1CompletedEvaluable += 1;
            if (dualAligned(pv, pi, block, ratio)) {
                d1AlignedCompleted += 1;
            }
        }

        if (block != null && pv != null && block.volume_level > 0) {
            const vd = volumeDeviationPct(pv, block);
            if (vd != null) {
                d2Devs.push(vd);
            }
        }

        if (block != null && pv != null && pi != null) {
            const vPct = volumeDeviationPct(pv, block);
            const iPct = intensityDeviationPct(pi, block);
            const vBad = vPct != null && vPct / 100 > ratio;
            const iBad = iPct != null && iPct / 100 > ratio;
            if (vBad || iBad) {
                const kind: DeviationListItem["deviationKind"] =
                    vBad && iBad ? "both" : vBad ? "volume" : "intensity";
                d4Items.push({
                    sessionId: s.id,
                    sessionDate: s.session_date,
                    sessionName: nameOf(s),
                    deviationKind: kind,
                    volumeDeviationPct: vPct ?? 0,
                    intensityDeviationPct: iPct ?? 0,
                });
            }
        }

        if (
            s.session_date &&
            !s.is_generic_session &&
            dateInRangeInclusive(s.session_date, planStartDate, planEndDate) &&
            block != null
        ) {
            const rv =
                s.status === "completed"
                    ? normalizeSessionLoadToTen(s.actual_volume)
                    : null;
            const ri =
                s.status === "completed"
                    ? normalizeSessionLoadToTen(s.actual_intensity)
                    : null;
            d7.push({
                sessionId: s.id,
                date: s.session_date,
                planVolume: block.volume_level,
                planIntensity: block.intensity_level,
                realVolume: rv,
                realIntensity: ri,
            });
        }

        if (
            s.session_date &&
            !s.is_generic_session &&
            dateInRangeInclusive(s.session_date, planStartDate, planEndDate) &&
            s.status === "completed"
        ) {
            const wk = mondayOfWeekContaining(s.session_date);
            const agg = weekMap.get(wk);
            if (agg && block != null && pv != null && pi != null && block.volume_level > 0 && block.intensity_level > 0) {
                agg.denom += 1;
                if (dualAligned(pv, pi, block, ratio)) {
                    agg.aligned += 1;
                }
            }
        }
    }

    d7.sort((a, b) => ymdCompare(a.date, b.date) || a.sessionId - b.sessionId);

    d4Items.sort((a, b) => {
        if (!a.sessionDate && !b.sessionDate) return b.sessionId - a.sessionId;
        if (!a.sessionDate) return 1;
        if (!b.sessionDate) return -1;
        const c = ymdCompare(b.sessionDate, a.sessionDate);
        if (c !== 0) return c;
        return b.sessionId - a.sessionId;
    });

    const d1CoherenceGlobalPct =
        d1CompletedEvaluable > 0 ? (100 * d1AlignedCompleted) / d1CompletedEvaluable : null;

    const d2LoadDeviationPct =
        d2Devs.length > 0 ? d2Devs.reduce((a, b) => a + b, 0) / d2Devs.length : null;

    const d3WeeklyAlignment: WeeklyAlignmentBar[] = weekStarts.map((weekStartIso, idx) => {
        const agg = weekMap.get(weekStartIso)!;
        const sun = addDaysYmd(weekStartIso, 6);
        const tooltipDetail = `${weekStartIso} – ${sun}`;
        const pct = agg.denom > 0 ? (100 * agg.aligned) / agg.denom : null;
        return {
            weekStartIso,
            weekLabel: `S${idx + 1}`,
            pct,
            tooltipDetail,
        };
    });

    return {
        d1CoherenceGlobalPct,
        d2LoadDeviationPct,
        d3WeeklyAlignment,
        d4Deviations: d4Items,
        d7VolumeIntensitySeries: d7,
        d1CompletedEvaluableCount: d1CompletedEvaluable,
        d1AlignedCompletedCount: d1AlignedCompleted,
        d2SessionCount: d2Devs.length,
        genericWithoutDateCount,
    };
}

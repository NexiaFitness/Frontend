/**
 * sessionBriefMath.ts — Funciones puras para la sección "Brief de sesión".
 *
 * Encapsula los cálculos de posicionamiento temporal (semana del bloque,
 * sesión N de M) y normalización de risk/coherencia sin depender de la UI.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import type { PlanPeriodBlock } from "../types/planningCargas";

// ============================================================================
// SEMANA DEL BLOQUE
// ============================================================================

function parseLocalIsoDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parsed = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
}

function diffInDays(a: Date, b: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor((a.getTime() - b.getTime()) / oneDay);
}

export interface BlockWeekInfo {
    current: number;
    total: number;
}

/**
 * Calcula en qué semana del bloque cae una fecha de sesión (1-based).
 * Devuelve null si no hay datos suficientes.
 */
export function computeWeekOfBlock(
    block: Pick<PlanPeriodBlock, "start_date" | "end_date"> | null | undefined,
    sessionDate: string | null | undefined
): BlockWeekInfo | null {
    if (!block || !sessionDate) return null;
    const start = parseLocalIsoDate(block.start_date);
    const end = parseLocalIsoDate(block.end_date);
    const date = parseLocalIsoDate(sessionDate);
    if (!start || !end || !date) return null;
    if (end.getTime() < start.getTime()) return null;

    const totalDays = diffInDays(end, start) + 1;
    const total = Math.max(1, Math.ceil(totalDays / 7));
    const offsetDays = Math.max(0, diffInDays(date, start));
    const current = Math.min(total, Math.max(1, Math.floor(offsetDays / 7) + 1));
    return { current, total };
}

// ============================================================================
// POSICIÓN DE LA SESIÓN
// ============================================================================

export interface SessionListItemForPosition {
    id: number;
    session_date: string | null;
    is_active?: boolean;
    period_block_id?: number | null;
}

export interface SessionPosition {
    indexInPlan: number;
    totalInPlan: number;
    indexInBlock: number | null;
    totalInBlock: number | null;
}

/**
 * Calcula la posición de una sesión dentro del plan y, opcionalmente, dentro
 * de su bloque. Ignora sesiones inactivas y sesiones sin fecha (genéricas).
 */
export function computeSessionPosition(
    sessions: SessionListItemForPosition[] | undefined,
    sessionId: number,
    periodBlockId: number | null | undefined
): SessionPosition | null {
    if (!sessions || sessions.length === 0) return null;
    const datedActive = sessions
        .filter((s) => s.is_active !== false && !!s.session_date)
        .sort(
            (a, b) =>
                new Date(`${a.session_date}T12:00:00`).getTime() -
                new Date(`${b.session_date}T12:00:00`).getTime()
        );
    const idxPlan = datedActive.findIndex((s) => s.id === sessionId);
    if (idxPlan < 0) return null;

    let indexInBlock: number | null = null;
    let totalInBlock: number | null = null;
    if (periodBlockId != null) {
        const sameBlock = datedActive.filter((s) => s.period_block_id === periodBlockId);
        const idxBlock = sameBlock.findIndex((s) => s.id === sessionId);
        if (idxBlock >= 0) {
            indexInBlock = idxBlock + 1;
            totalInBlock = sameBlock.length;
        }
    }

    return {
        indexInPlan: idxPlan + 1,
        totalInPlan: datedActive.length,
        indexInBlock,
        totalInBlock,
    };
}

// ============================================================================
// COHERENCIA
// ============================================================================

export type CoherenceLevel = "excellent" | "good" | "warning" | "poor";

export function coherenceLevelFor(percentage: number | null | undefined): CoherenceLevel | null {
    if (percentage == null || Number.isNaN(percentage)) return null;
    if (percentage >= 85) return "excellent";
    if (percentage >= 70) return "good";
    if (percentage >= 50) return "warning";
    return "poor";
}

// ============================================================================
// FATIGA (intensidad textual de la última lectura)
// ============================================================================

export interface FatigueSnapshot {
    risk: "low" | "medium" | "high" | null;
    preFatigueLast: number | null;
    deltaLast: number | null;
    averagePre: number | null;
}

/**
 * sessionExerciseUtils.ts — Utilidades para métricas de ejercicios de sesión
 *
 * Contexto: Fase 5 plan UX — métrica planned_sets vs actual_sets por ejercicio/sesión.
 * Usado por SessionDetail y StandaloneSessionDetail.
 *
 * @author Frontend Team
 * @since Fase 5 — Plan integración flujo planificación UX
 */

export interface SetsMetricResult {
    label: string;
    badgeClass: string;
}

/**
 * Formatea la métrica series programadas vs realizadas para un ejercicio.
 * - "X/Y series" cuando ambos existen
 * - "X programadas" cuando solo planned
 * - "Y realizadas" cuando solo actual
 * - "—" cuando ninguno
 */
export function formatSetsMetric(
    planned: number | null | undefined,
    actual: number | null | undefined
): SetsMetricResult {
    const hasPlanned = planned != null && planned >= 0;
    const hasActual = actual != null && actual >= 0;

    if (hasPlanned && hasActual) {
        const isComplete = actual >= planned;
        return {
            label: `${actual}/${planned} series`,
            badgeClass: isComplete
                ? "bg-success/10 text-success border border-success/30"
                : "bg-warning/10 text-warning border border-warning/30",
        };
    }
    if (hasPlanned) {
        return {
            label: `${planned} programadas`,
            badgeClass: "bg-muted text-muted-foreground border border-border",
        };
    }
    if (hasActual) {
        return {
            label: `${actual} realizadas`,
            badgeClass: "bg-muted text-muted-foreground border border-border",
        };
    }
    return {
        label: "—",
        badgeClass: "bg-muted text-muted-foreground border border-border",
    };
}

export interface SessionSetsTotals {
    totalPlanned: number;
    totalActual: number;
}

/**
 * Calcula totales de series programadas y realizadas para una lista de ejercicios.
 */
export function computeSessionSetsTotals(
    exercises: Array<{ planned_sets?: number | null; actual_sets?: number | null }>
): SessionSetsTotals {
    let totalPlanned = 0;
    let totalActual = 0;
    for (const ex of exercises) {
        if (ex.planned_sets != null && ex.planned_sets >= 0) totalPlanned += ex.planned_sets;
        if (ex.actual_sets != null && ex.actual_sets >= 0) totalActual += ex.actual_sets;
    }
    return { totalPlanned, totalActual };
}

/**
 * detailTableLayout.ts — Constantes y utilidades de cuadrícula read-only.
 *
 * Reps/Tiempo y Esfuerzo ocupan siempre la misma posición (columnas fijas
 * a la derecha). Columnas extra (Ronda, Drop, Serie…) se añaden delante.
 *
 * Componentes React en detailTableCells.tsx (evita react-refresh/only-export-components).
 *
 * @author Frontend Team
 * @since v6.6.1
 */

/** Ancho reservado para columna Ronda (vacía en tipos sin ronda). */
export const DETAIL_ROUND_COL_CLASS = "w-12";

/** Ancho fijo Reps / Tiempo — alineado en todos los tipos de serie. */
export const DETAIL_REPS_COL_CLASS = "w-[108px]";

/** Ancho fijo Esfuerzo — alineado en todos los tipos de serie. */
export const DETAIL_EFFORT_COL_CLASS = "w-[108px]";

/** Descanso reservado a la derecha de Esfuerzo (vacío si no aplica por fila). */
export const DETAIL_REST_COL_CLASS = "w-[72px]";

export const DETAIL_TABLE_CLASS = "w-full table-fixed text-xs";

export const DETAIL_TABLE_HEAD_CLASS =
    "bg-surface/60 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80";

export const DETAIL_TABLE_BODY_CLASS = "divide-y divide-border/30";

export interface DetailTableColGroupProps {
    /** false solo si la tabla no usa la cuadrícula estándar (legacy). */
    includeRoundColumn?: boolean;
    /**
     * Siempre reservar columna Descanso (72px) para que Reps/Esfuerzo no se desplacen
     * entre bloques de la misma sesión.
     */
    includeRestColumn?: boolean;
    /** Columnas opcionales tras Descanso (reps real, peso…). */
    trailingColumnCount?: number;
}

/** colspan para separadores de ronda en tablas multi-ronda. */
export function detailTableColSpan(options: {
    includeRestColumn?: boolean;
    trailingColumnCount?: number;
}): number {
    let count = 4; // ronda + lead + reps + esfuerzo
    if (options.includeRestColumn !== false) count += 1;
    count += options.trailingColumnCount ?? 0;
    return count;
}

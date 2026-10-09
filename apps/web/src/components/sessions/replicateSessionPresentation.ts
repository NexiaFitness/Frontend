/**
 * replicateSessionPresentation.ts — Copy y formato del flujo «Replicar sesión».
 *
 * Contexto: textos de resultado y fechas para useReplicateSessionFlow y
 * ReplicateSessionConflictModal (D-REP-1..3,
 * docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/02_DECISIONES_PRODUCTO.md).
 *
 * Notas de mantenimiento: sin estado ni red; fechas locales YYYY-MM-DD.
 *
 * @author Frontend Team
 * @since v9.2.0
 */

import type { ReplicationSkipPartition } from "@nexia/shared";
import type { SkippedConflictItem } from "@nexia/shared/types/trainingSessions";

/** Estado del modal de conflictos tras la primera replicación (force=false). */
export interface ReplicateConflictOutcome {
    createdCount: number;
    /** Huecos con sesión sustituible (session_already_exists). */
    replaceable: SkippedConflictItem[];
    /** Huecos con sesión ya entrenada (protected_session): informativos. */
    protectedItems: SkippedConflictItem[];
}

export const EMPTY_REPLICATE_CONFLICT_OUTCOME: ReplicateConflictOutcome = {
    createdCount: 0,
    replaceable: [],
    protectedItems: [],
};

export const REPLICATE_CONFLICT_KEEP_LABEL = "Mantener las existentes";
export const REPLICATE_CONFLICT_REPLACE_LABEL = "Sustituir por esta versión";
export const REPLICATE_CONFLICT_PROTECTED_TITLE = "Ya entrenadas — no se modifican";
export const REPLICATE_CONFLICT_REPLACE_HINT =
    "Sustituir elimina esas sesiones planificadas, incluidos los cambios que hicieras en ellas, y crea la copia nueva.";

/** «lun 9 mar» a partir de YYYY-MM-DD (hora local, sin desfase UTC). */
export function formatReplicationDate(dateISO: string | null): string {
    if (!dateISO) return "";
    const [y, m, d] = dateISO.split("-").map(Number);
    if ([y, m, d].some((n) => Number.isNaN(n))) return dateISO;
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function plural(count: number, one: string, many: string): string {
    return `${count} ${count === 1 ? one : many}`;
}

/** Mensaje final tras replicar o sustituir. */
export function buildReplicateOutcomeMessage(
    createdCount: number,
    skips: Pick<ReplicationSkipPartition, "protectedItems" | "outsideBlock">,
    mode: "replicate" | "replace",
): string {
    const verb = mode === "replace" ? "sustituida" : "replicada";
    const verbPlural = mode === "replace" ? "sustituidas" : "replicadas";
    const parts = [
        `${plural(createdCount, "sesión", "sesiones")} ${
            createdCount === 1 ? verb : verbPlural
        }.`,
    ];
    if (skips.protectedItems.length > 0) {
        parts.push(
            `${plural(skips.protectedItems.length, "semana", "semanas")} con sesión ya entrenada no se ${
                skips.protectedItems.length === 1 ? "ha" : "han"
            } modificado.`,
        );
    }
    if (skips.outsideBlock.length > 0) {
        parts.push(
            `${plural(skips.outsideBlock.length, "semana queda", "semanas quedan")} fuera del bloque.`,
        );
    }
    return parts.join(" ");
}

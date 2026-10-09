/**
 * Copy y toggles del expand de prescripción fuerza (V04 mapa).
 * @see design/atleta/run-y-diseno/F3b_FE14_V04_PRESCRIPTION_POR_MODALIDAD.md
 */

import type { SessionGroupKind } from "../../sessionProgramming/sessionBlockView";

const STRENGTH_MAP_KINDS: ReadonlySet<SessionGroupKind> = new Set([
    "single_set",
    "superset",
    "giant_set",
    "dropset",
]);

export function isStrengthPrescriptionMapKind(kind: SessionGroupKind): boolean {
    return STRENGTH_MAP_KINDS.has(kind);
}

/** Etiqueta de grupo bajo el bloque (p. ej. «Single set», «Drop set · 2 rondas»). */
export function formatAthletePreviewGroupKindLabel(
    kind: SessionGroupKind,
    rounds: number | null | undefined
): string {
    switch (kind) {
        case "single_set":
            return "Single set";
        case "superset":
            return rounds != null && rounds > 0 ? `Superset — ${rounds} rondas` : "Superset";
        case "giant_set":
            return rounds != null && rounds > 0 ? `Giant set — ${rounds} rondas` : "Giant set";
        case "dropset":
            return rounds != null && rounds > 0 ? `Drop set — ${rounds} rondas` : "Drop set";
        default:
            return kind;
    }
}

export function strengthPrescriptionToggleLabels(kind: SessionGroupKind): {
    show: string;
    hide: string;
    rowColumn: string;
} {
    switch (kind) {
        case "dropset":
            return {
                show: "Ver escalones",
                hide: "Ocultar escalones",
                rowColumn: "Escalón",
            };
        case "superset":
        case "giant_set":
            return {
                show: "Ver detalle",
                hide: "Ocultar detalle",
                rowColumn: "Ronda",
            };
        case "single_set":
        default:
            return {
                show: "Ver series",
                hide: "Ocultar series",
                rowColumn: "Serie",
            };
    }
}

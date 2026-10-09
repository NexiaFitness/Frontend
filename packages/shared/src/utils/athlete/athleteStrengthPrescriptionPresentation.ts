/**
 * Copy y toggles del expand de prescripción fuerza (V04 mapa).
 * @see design/atleta/run-y-diseno/F3b_FE14_V04_PRESCRIPTION_POR_MODALIDAD.md
 */

import type {
    SessionExerciseGroupView,
    SessionGroupKind,
} from "../../sessionProgramming/sessionBlockView";
const STRENGTH_MAP_KINDS: ReadonlySet<SessionGroupKind> = new Set([
    "single_set",
    "superset",
    "giant_set",
    "dropset",
]);

export function isStrengthPrescriptionMapKind(kind: SessionGroupKind): boolean {
    return STRENGTH_MAP_KINDS.has(kind);
}

/** Solo modalidad (sin rondas); meta en `buildAthleteStrengthPrescriptionGroupMeta`. */
export function formatAthletePreviewGroupKindLabel(kind: SessionGroupKind): string {
    switch (kind) {
        case "single_set":
            return "Single set";
        case "superset":
            return "Superset";
        case "giant_set":
            return "Giant set";
        case "dropset":
            return "Drop set";
        default:
            return kind;
    }
}

/** Líneas bajo la cabecera de modalidad (paridad AMRAP / EMOM meta). */
export function buildAthleteStrengthPrescriptionGroupMeta(
    group: Pick<SessionExerciseGroupView, "kind" | "rounds" | "restBetweenSeconds">
): string[] {
    const lines: string[] = [];
    const { kind, rounds } = group;

    if (kind !== "single_set" && rounds != null && rounds > 0) {
        lines.push(`${rounds} ${rounds === 1 ? "ronda" : "rondas"}`);
    }

    switch (kind) {
        case "superset":
            lines.push("Alterna los ejercicios en cada ronda.");
            break;
        case "giant_set":
            lines.push("Recorre todos los ejercicios en cada ronda.");
            break;
        case "dropset":
            lines.push(
                "Serie principal y drops de carga en secuencia; repite la secuencia en cada ronda."
            );
            break;
        default:
            break;
    }

    return lines;
}

export function strengthPrescriptionToggleLabels(kind: SessionGroupKind): {
    show: string;
    hide: string;
    rowColumn: string;
} {
    switch (kind) {
        case "dropset":
            return {
                show: "Ver series",
                hide: "Ocultar series",
                rowColumn: "Drop",
            };
        case "superset":
        case "giant_set":
            return {
                show: "Ver series",
                hide: "Ocultar series",
                rowColumn: "Ronda",
            };
        case "amrap":
        case "emom":
            return {
                show: "Ver series",
                hide: "Ocultar series",
                rowColumn: "Serie",
            };
        case "for_time":
            return {
                show: "Ver series",
                hide: "Ocultar series",
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

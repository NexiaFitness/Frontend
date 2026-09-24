/**
 * validateCatalogBundle.ts — Validación cliente del bundle Admin (contrato C / §E).
 *
 * Espejo de reglas de producto antes de POST/PUT; el servidor es fuente de verdad.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type {
    CatalogJointActionIn,
    CatalogMuscleIn,
    CatalogPatternIn,
    ExerciseCatalogCoreIn,
} from "../../types/adminCatalog";

export type AdminCatalogSectionId =
    | "datos"
    | "musculos"
    | "patrones"
    | "articulaciones"
    | "material"
    | "etiquetas";

export interface CatalogBundleDraft {
    core: ExerciseCatalogCoreIn;
    muscles: CatalogMuscleIn[];
    movement_patterns: CatalogPatternIn[];
    joint_actions: CatalogJointActionIn[];
    equipment_ids: number[];
    tag_ids: number[];
}

export interface CatalogSectionErrors {
    section: AdminCatalogSectionId;
    messages: string[];
}

export interface CatalogValidationResult {
    ok: boolean;
    bySection: CatalogSectionErrors[];
    firstSectionWithError: AdminCatalogSectionId | null;
}

const VALID_TIPOS = new Set(["monoarticular", "multiarticular", "complex"]);
const VALID_LATERALITY = new Set(["bilateral", "unilateral", "alternating"]);
const VALID_AXIAL = new Set(["none", "low", "medium", "high"]);

function push(
    map: Map<AdminCatalogSectionId, string[]>,
    section: AdminCatalogSectionId,
    message: string
): void {
    const list = map.get(section) ?? [];
    list.push(message);
    map.set(section, list);
}

/**
 * Valida el draft de ficha Admin. No muta el input.
 */
export function validateCatalogBundleDraft(draft: CatalogBundleDraft): CatalogValidationResult {
    const map = new Map<AdminCatalogSectionId, string[]>();
    const { core, muscles, movement_patterns, joint_actions, equipment_ids } = draft;

    if (!core.nombre?.trim()) {
        push(map, "datos", "El nombre es obligatorio");
    }
    if (!core.tipo?.trim() || !VALID_TIPOS.has(core.tipo.trim().toLowerCase())) {
        push(map, "datos", "Tipo inválido (monoarticular, multiarticular o complex)");
    }
    if (!core.nivel?.trim()) {
        push(map, "datos", "El nivel es obligatorio");
    }
    if (core.laterality != null && core.laterality !== "") {
        if (!VALID_LATERALITY.has(core.laterality.trim().toLowerCase())) {
            push(map, "datos", "Lateralidad inválida");
        }
    }
    if (core.axial_load != null && core.axial_load !== "") {
        if (!VALID_AXIAL.has(core.axial_load.trim().toLowerCase())) {
            push(map, "datos", "Carga axial inválida");
        }
    }

    if (muscles.length === 0) {
        push(map, "musculos", "Añade al menos un músculo");
    } else {
        const seen = new Set<number>();
        let pmCount = 0;
        for (const m of muscles) {
            if (!m.muscle_id || m.muscle_id < 1) {
                push(map, "musculos", "Selecciona un músculo en cada fila");
                continue;
            }
            if (seen.has(m.muscle_id)) {
                push(map, "musculos", `El músculo ${m.muscle_id} está duplicado (un solo rol por músculo)`);
            }
            seen.add(m.muscle_id);
            if (m.role === "prime_mover") {
                pmCount += 1;
            }
        }
        if (pmCount < 1) {
            push(map, "musculos", "Se requiere al menos un prime mover");
        }
    }

    if (movement_patterns.length === 0) {
        push(map, "patrones", "Añade al menos un patrón de movimiento");
    } else {
        const seen = new Set<number>();
        let primary = 0;
        for (const p of movement_patterns) {
            if (!p.movement_pattern_id || p.movement_pattern_id < 1) {
                push(map, "patrones", "Selecciona un patrón en cada fila");
                continue;
            }
            if (seen.has(p.movement_pattern_id)) {
                push(map, "patrones", "Patrón duplicado");
            }
            seen.add(p.movement_pattern_id);
            if ((p.role ?? "primary") === "primary") {
                primary += 1;
            }
        }
        if (primary < 1) {
            push(map, "patrones", "Se requiere al menos un patrón con rol primary");
        }
    }

    if (joint_actions.length === 0) {
        push(map, "articulaciones", "Añade al menos una articulación con acción");
    } else {
        const seen = new Set<string>();
        for (const ja of joint_actions) {
            if (!ja.joint_id || !ja.action_id) {
                push(map, "articulaciones", "Cada fila necesita articulación y acción");
                continue;
            }
            const key = `${ja.joint_id}:${ja.action_id}`;
            if (seen.has(key)) {
                push(map, "articulaciones", "Par articulación/acción duplicado");
            }
            seen.add(key);
        }
    }

    if (equipment_ids.length === 0) {
        push(map, "material", "Selecciona al menos un material");
    } else if (new Set(equipment_ids).size !== equipment_ids.length) {
        push(map, "material", "Material duplicado");
    }

    const order: AdminCatalogSectionId[] = [
        "datos",
        "musculos",
        "patrones",
        "articulaciones",
        "material",
        "etiquetas",
    ];
    const bySection: CatalogSectionErrors[] = order
        .filter((s) => (map.get(s)?.length ?? 0) > 0)
        .map((section) => ({ section, messages: map.get(section) ?? [] }));

    return {
        ok: bySection.length === 0,
        bySection,
        firstSectionWithError: bySection[0]?.section ?? null,
    };
}

/**
 * Ordena músculos para el payload: PM en orden de UI (priority 1..n en servidor), luego resto.
 */
export function orderMusclesForCommit(muscles: CatalogMuscleIn[]): CatalogMuscleIn[] {
    const pm = muscles.filter((m) => m.role === "prime_mover");
    const rest = muscles.filter((m) => m.role !== "prime_mover");
    return [...pm, ...rest];
}

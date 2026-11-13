/**
 * validateCatalogBundle.ts — Validación cliente del bundle Admin (contrato C / §E).
 *
 * Espejo de reglas de producto antes de POST/PUT; el servidor es fuente de verdad.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type {
    CatalogAxialLoad,
    CatalogJointActionIn,
    CatalogMuscleIn,
    CatalogPatternIn,
    ExerciseCatalogBundleCreateIn,
    ExerciseCatalogCoreIn,
} from "../../types/adminCatalog";
import type { TrainingObjective } from "../../types/exerciseContract";

export type AdminCatalogSectionId =
    | "datos"
    | "tecnica"
    | "musculos"
    | "patrones"
    | "articulaciones"
    | "material"
    | "etiquetas"
    | "alternativas"
    | "variantes";

/**
 * Core en edición: `axial_load` y `objetivo_entrenamiento` null = aún sin elegir. Nunca se
 * sustituyen por un valor por defecto; la validación los exige y `finalizeCatalogBundle` solo
 * produce el payload cuando están informados.
 */
export type CatalogCoreDraft = Omit<ExerciseCatalogCoreIn, "axial_load" | "objetivo_entrenamiento"> & {
    axial_load: CatalogAxialLoad | null;
    objetivo_entrenamiento: TrainingObjective | null;
};

export interface CatalogBundleDraft {
    core: CatalogCoreDraft;
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

/** Campos de «Datos» que la ficha marca uno a uno (el mensaje va bajo el campo). */
export type CatalogCoreFieldId =
    | "nombre"
    | "tipo"
    | "nivel"
    | "laterality"
    | "axial_load"
    | "objetivo_entrenamiento";

export interface CatalogValidationResult {
    ok: boolean;
    bySection: CatalogSectionErrors[];
    firstSectionWithError: AdminCatalogSectionId | null;
    /** Los mismos mensajes de «datos», por campo. */
    byField: Partial<Record<CatalogCoreFieldId, string>>;
}

const VALID_TIPOS = new Set(["monoarticular", "multiarticular", "complex"]);
const VALID_LATERALITY = new Set(["bilateral", "unilateral", "alternating"]);
export const CATALOG_AXIAL_LOADS: readonly CatalogAxialLoad[] = ["none", "low", "medium", "high"];

/** Valor de carga axial reconocido, o null si falta o no es válido (sin valor por defecto). */
export function parseCatalogAxialLoad(value: string | null | undefined): CatalogAxialLoad | null {
    const normalized = value?.trim().toLowerCase();
    return CATALOG_AXIAL_LOADS.find((axial) => axial === normalized) ?? null;
}

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
 * `techniqueErrors`: los de `resolveTechniqueSubmit` (SPEC_H10), que dependen del modo y de
 * la técnica guardada; aquí solo se ordenan con el resto en la sección «tecnica».
 */
export function validateCatalogBundleDraft(
    draft: CatalogBundleDraft,
    techniqueErrors: readonly string[] = []
): CatalogValidationResult {
    const map = new Map<AdminCatalogSectionId, string[]>();
    const byField: Partial<Record<CatalogCoreFieldId, string>> = {};
    const coreError = (field: CatalogCoreFieldId, message: string) => {
        push(map, "datos", message);
        byField[field] = message;
    };
    const { core, muscles, movement_patterns, joint_actions, equipment_ids } = draft;
    for (const message of techniqueErrors) {
        push(map, "tecnica", message);
    }

    if (!core.nombre?.trim()) {
        coreError("nombre", "El nombre es obligatorio");
    }
    if (!core.tipo?.trim() || !VALID_TIPOS.has(core.tipo.trim().toLowerCase())) {
        coreError("tipo", "Tipo inválido (monoarticular, multiarticular o complex)");
    }
    if (!core.nivel?.trim()) {
        coreError("nivel", "El nivel es obligatorio");
    }
    if (core.laterality != null && core.laterality !== "") {
        if (!VALID_LATERALITY.has(core.laterality.trim().toLowerCase())) {
            coreError("laterality", "Lateralidad inválida");
        }
    }
    if (core.axial_load === null) {
        coreError("axial_load", "La carga axial es obligatoria");
    }
    if (core.objetivo_entrenamiento === null) {
        coreError("objetivo_entrenamiento", "El objetivo de entrenamiento es obligatorio");
    }
    // Espejo de la regla del servidor (H1 R1): cardio y movilidad no exigen músculo principal
    // ni patrón; un objetivo aún vacío se valida como fuerza (el caso más exigente).
    const requiresStrengthStructure =
        core.objetivo_entrenamiento === null || core.objetivo_entrenamiento === "strength";

    if (muscles.length === 0 && requiresStrengthStructure) {
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
        if (pmCount < 1 && requiresStrengthStructure) {
            push(map, "musculos", "Hace falta al menos un músculo objetivo.");
        }
    }

    if (movement_patterns.length === 0 && requiresStrengthStructure) {
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
            if (p.role === "primary") {
                primary += 1;
            }
        }
        if (primary < 1 && requiresStrengthStructure) {
            push(map, "patrones", "Hace falta un patrón primario.");
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
        "tecnica",
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
        byField,
    };
}

/**
 * Payload POST/PUT desde un draft ya validado. Devuelve null si falta un campo obligatorio
 * del contrato (carga axial, objetivo): nunca lo rellena.
 */
export function finalizeCatalogBundle(draft: CatalogBundleDraft): ExerciseCatalogBundleCreateIn | null {
    const { axial_load, objetivo_entrenamiento } = draft.core;
    if (axial_load === null || objetivo_entrenamiento === null) {
        return null;
    }
    return { ...draft, core: { ...draft.core, axial_load, objetivo_entrenamiento } };
}

/**
 * Ordena músculos para el payload: PM en orden de UI (priority 1..n en servidor), luego resto.
 */
export function orderMusclesForCommit(muscles: CatalogMuscleIn[]): CatalogMuscleIn[] {
    const pm = muscles.filter((m) => m.role === "prime_mover");
    const rest = muscles.filter((m) => m.role !== "prime_mover");
    return [...pm, ...rest];
}

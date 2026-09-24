/**
 * adminCatalogFormTypes.ts — Estado local de la ficha Admin (draft UI).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type {
    CatalogMuscleRole,
    CatalogPatternRole,
    CatalogExerciseOut,
    ExerciseCatalogCoreIn,
} from "@nexia/shared/types/adminCatalog";

export type AdminCatalogSectionId =
    | "datos"
    | "musculos"
    | "patrones"
    | "articulaciones"
    | "material"
    | "etiquetas";

export interface MuscleRowDraft {
    key: string;
    muscle_id: number | null;
    role: CatalogMuscleRole;
    label?: string;
}

export interface PatternRowDraft {
    key: string;
    movement_pattern_id: number | null;
    role: CatalogPatternRole;
}

export interface JointRowDraft {
    key: string;
    joint_id: number | null;
    action_id: number | null;
    role: string;
}

export interface AdminCatalogFormDraft {
    core: ExerciseCatalogCoreIn;
    muscles: MuscleRowDraft[];
    patterns: PatternRowDraft[];
    joints: JointRowDraft[];
    equipment_ids: number[];
    tag_ids: number[];
    /** Optimistic lock — solo edit. */
    expected_updated_at: string | null;
    exercise_code: string | null;
    review_status: "pending" | "reviewed" | null;
}

let rowKeySeq = 0;
export function nextRowKey(prefix: string): string {
    rowKeySeq += 1;
    return `${prefix}-${rowKeySeq}`;
}

export function emptyCore(): ExerciseCatalogCoreIn {
    return {
        nombre: "",
        nombre_ingles: null,
        tipo: "multiarticular",
        nivel: "intermediate",
        laterality: "bilateral",
        axial_load: "none",
        descripcion: null,
        instrucciones: null,
        notas: null,
        is_active: true,
    };
}

export function emptyDraft(): AdminCatalogFormDraft {
    return {
        core: emptyCore(),
        muscles: [
            {
                key: nextRowKey("m"),
                muscle_id: null,
                role: "prime_mover",
            },
        ],
        patterns: [
            {
                key: nextRowKey("p"),
                movement_pattern_id: null,
                role: "primary",
            },
        ],
        joints: [
            {
                key: nextRowKey("j"),
                joint_id: null,
                action_id: null,
                role: "primary",
            },
        ],
        equipment_ids: [],
        tag_ids: [],
        expected_updated_at: null,
        exercise_code: null,
        review_status: null,
    };
}

export function draftFromCatalog(exercise: CatalogExerciseOut): AdminCatalogFormDraft {
    const musclesRaw = [...(exercise.muscles ?? [])];
    musclesRaw.sort((a, b) => {
        const aPm = a.role === "prime_mover" ? 0 : 1;
        const bPm = b.role === "prime_mover" ? 0 : 1;
        if (aPm !== bPm) return aPm - bPm;
        return (a.priority ?? 0) - (b.priority ?? 0);
    });

    const muscles: MuscleRowDraft[] =
        musclesRaw.length > 0
            ? musclesRaw.map((m) => ({
                  key: nextRowKey("m"),
                  muscle_id: m.id,
                  role: (m.role as CatalogMuscleRole) || "prime_mover",
                  label: m.name_es || m.name || m.name_en,
              }))
            : [{ key: nextRowKey("m"), muscle_id: null, role: "prime_mover" }];

    const patterns: PatternRowDraft[] =
        (exercise.movement_patterns ?? []).length > 0
            ? (exercise.movement_patterns ?? []).map((p) => ({
                  key: nextRowKey("p"),
                  movement_pattern_id: p.id,
                  role: (p.role as CatalogPatternRole) || "primary",
              }))
            : [{ key: nextRowKey("p"), movement_pattern_id: null, role: "primary" }];

    const joints: JointRowDraft[] =
        (exercise.joint_action_details ?? []).length > 0
            ? (exercise.joint_action_details ?? []).map((j) => ({
                  key: nextRowKey("j"),
                  joint_id: j.joint_id,
                  action_id: j.action_id ?? null,
                  role: j.role || "primary",
              }))
            : [{ key: nextRowKey("j"), joint_id: null, action_id: null, role: "primary" }];

    return {
        core: {
            nombre: exercise.nombre,
            nombre_ingles: exercise.nombre_ingles,
            tipo: exercise.tipo,
            nivel: exercise.nivel,
            laterality: exercise.laterality ?? null,
            axial_load: exercise.axial_load ?? "none",
            descripcion: exercise.descripcion,
            instrucciones: exercise.instrucciones,
            notas: exercise.notas,
            is_active: exercise.is_active,
        },
        muscles,
        patterns,
        joints,
        equipment_ids: (exercise.equipment ?? []).map((e) => e.id),
        tag_ids: (exercise.tags ?? []).map((t) => t.id),
        expected_updated_at: exercise.updated_at,
        exercise_code: exercise.exercise_id,
        review_status: exercise.review_status,
    };
}

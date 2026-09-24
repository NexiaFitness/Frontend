/**
 * adminCatalog.ts — Contratos Admin catálogo de ejercicios (M4/M5).
 *
 * Fuente: OpenAPI local `/api/v1/openapi.json` (schemas Catalog* / ExerciseCatalog*).
 * No inventar campos; alinear con `backend/app/schemas/admin_catalog.py`.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { Exercise } from "../hooks/exercises/useExercises";

export type CatalogReviewStatus = "pending" | "reviewed";

export type CatalogMuscleRole = "prime_mover" | "synergist" | "stabilizer";

export type CatalogPatternRole = "primary" | "secondary";

/** POST/PUT body muscle line — priority lo asigna el servidor por orden PM. */
export interface CatalogMuscleIn {
    muscle_id: number;
    role: CatalogMuscleRole;
}

export interface CatalogPatternIn {
    movement_pattern_id: number;
    role?: CatalogPatternRole;
}

export interface CatalogJointActionIn {
    joint_id: number;
    action_id: number;
    role?: string;
}

export interface ExerciseCatalogCoreIn {
    nombre: string;
    nombre_ingles?: string | null;
    tipo: string;
    nivel: string;
    laterality?: string | null;
    axial_load?: string | null;
    descripcion?: string | null;
    instrucciones?: string | null;
    notas?: string | null;
    is_active?: boolean;
}

export interface ExerciseCatalogBundleCreateIn {
    core: ExerciseCatalogCoreIn;
    muscles: CatalogMuscleIn[];
    movement_patterns: CatalogPatternIn[];
    joint_actions: CatalogJointActionIn[];
    equipment_ids: number[];
    tag_ids?: number[];
}

export interface ExerciseCatalogBundleUpdateIn extends ExerciseCatalogBundleCreateIn {
    expected_updated_at: string;
}

/** GET/POST/PUT `/exercises/.../catalog` — ExerciseOut + meta revisión. */
export interface CatalogExerciseOut extends Exercise {
    review_status: CatalogReviewStatus;
    catalog_reviewed_at: string | null;
    catalog_reviewed_by_user_id: number | null;
}

export interface CatalogReviewStatusOut {
    exercise_pk: number;
    exercise_code: string;
    review_status: CatalogReviewStatus;
    catalog_reviewed_at?: string | null;
    catalog_reviewed_by_user_id?: number | null;
}

export interface ExerciseChangeLogEntryOut {
    id: number;
    field_path: string;
    old_value?: string | null;
    new_value?: string | null;
    actor_user_id?: number | null;
    actor_label: string;
    created_at: string;
}

export interface ExerciseCatalogHistoryOut {
    exercise_pk: number;
    entries: ExerciseChangeLogEntryOut[];
}

/** Cuerpo 409 PUT catalog (detail de HTTPException). */
export interface CatalogConcurrencyErrorOut {
    detail: string;
    server_updated_at?: string | null;
    expected_updated_at?: string | null;
    diff_summary?: Record<string, unknown>;
}

export interface CatalogValidationErrorBody {
    detail: string;
    errors: string[];
}

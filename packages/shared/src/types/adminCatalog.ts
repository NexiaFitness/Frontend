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
import type {
    CatalogReviewState,
    CatalogSource,
    ExerciseContractMissingCode,
    ExerciseContractStatus,
    MuscleEvidenceFields,
    TrainingObjective,
} from "./exerciseContract";

export type CatalogReviewStatus = "pending" | "reviewed";

export type CatalogMuscleRole = "prime_mover" | "synergist" | "stabilizer";

export type CatalogPatternRole = "primary" | "secondary";

/** Carga axial del ejercicio. Obligatoria en el contrato: el servidor no aplica valor por defecto. */
export type CatalogAxialLoad = "none" | "low" | "medium" | "high";

/** POST/PUT body muscle line — priority lo asigna el servidor por orden PM. */
export interface CatalogMuscleIn extends MuscleEvidenceFields {
    muscle_id: number;
    role: CatalogMuscleRole;
}

export interface CatalogPatternIn {
    movement_pattern_id: number;
    role: CatalogPatternRole;
}

export interface CatalogJointActionIn {
    joint_id: number;
    action_id: number;
    /** Servidor: `primary` | `secondary`, obligatorio. */
    role: string;
}

export interface ExerciseCatalogCoreIn {
    nombre: string;
    nombre_ingles?: string | null;
    tipo: string;
    nivel: string;
    laterality?: string | null;
    axial_load: CatalogAxialLoad;
    /** Obligatorio (H1): decide si el ejercicio suma volumen muscular. */
    objetivo_entrenamiento: TrainingObjective;
    /** null = regla del servidor (admin: revisado al cambiar el valor). */
    axial_load_review?: CatalogReviewState | null;
    nivel_review?: CatalogReviewState | null;
    /** null = conserva el origen (alta admin: nexia). */
    source?: CatalogSource | null;
    source_ref?: string | null;
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

/** GET `/admin/catalog/exercises` — item de listado (F8). */
export interface AdminCatalogExerciseListItemOut {
    exercise_pk: number;
    exercise_code: string;
    nombre: string;
    nombre_ingles?: string | null;
    is_active: boolean;
    review_status: CatalogReviewStatus;
    catalog_reviewed_at?: string | null;
    /** Códigos backend: OK, NO_PM, PM_PRIORITY, NO_PRIMARY_PATTERN, NO_EQUIPMENT, INCOMPLETE_JOINT_ACTIONS, VOLUME_MAPPING. */
    quality_flags: string[];
    objetivo_entrenamiento?: TrainingObjective | null;
    /** Derivado por el backend (H1); null si no se calculó. */
    contract_status?: ExerciseContractStatus | null;
    contract_missing?: ExerciseContractMissingCode[] | null;
}

/** Progreso de revisión F9 — alcance activos. */
export interface CatalogReviewProgressOut {
    reviewed_count: number;
    active_count: number;
}

export interface AdminCatalogExerciseListOut {
    items: AdminCatalogExerciseListItemOut[];
    total: number;
    skip: number;
    limit: number;
    review_progress: CatalogReviewProgressOut;
}

/** Query params del listado admin (todos opcionales en backend). */
export interface AdminCatalogListParams {
    skip?: number;
    limit?: number;
    search?: string;
    review_status?: CatalogReviewStatus;
    include_inactive?: boolean;
    quality_issues_only?: boolean;
}

export interface CatalogImportViolationOut {
    exercise_id?: string | null;
    sheet: string;
    row?: number | null;
    rule: string;
    message: string;
}

export interface CatalogImportFieldChangeOut {
    field: string;
    before: string;
    after: string;
}

/** Entrada de `change_summary.updated` — la produce `catalog_import_bundle._diff_fields`. */
export interface CatalogImportUpdatedEntryOut {
    exercise_id: string | null;
    exercise_name_es?: string | null;
    fields: string[];
    changes?: CatalogImportFieldChangeOut[];
    was_inactive?: boolean;
}

/** Carga axial / nivel existentes que el import no sobrescribe: before = BD, after = archivo. */
export interface CatalogImportPreservedEntryOut {
    exercise_id: string | null;
    exercise_name_es?: string | null;
    fields: CatalogImportFieldChangeOut[];
}

export interface CatalogImportNewEntryOut {
    exercise_id: string;
    exercise_name_es: string;
}

export interface CatalogImportAssignedExerciseIdOut {
    row: number;
    exercise_id: string;
    exercise_name_es: string;
}

export interface CatalogImportChangeSummaryOut {
    /** Códigos de ejercicio nuevos (compat. API legacy). */
    new: string[];
    /** Detalle con nombres para UI (preferir frente a `new`). */
    new_entries?: CatalogImportNewEntryOut[];
    updated: CatalogImportUpdatedEntryOut[];
    preserved?: CatalogImportPreservedEntryOut[];
    unchanged_count: number;
    assigned_exercise_ids?: CatalogImportAssignedExerciseIdOut[];
}

export interface CatalogImportValidateOut {
    ok_for_import: boolean;
    violations: CatalogImportViolationOut[];
    change_summary: CatalogImportChangeSummaryOut;
}

export interface CatalogImportConfirmOut {
    imported_count: number;
    new_count: number;
    updated_count: number;
    exercise_ids: string[];
    change_summary: CatalogImportChangeSummaryOut;
}

export interface AdminCatalogExportParams {
    include_inactive?: boolean;
}

/** GET /admin/catalog/exercises/{pk}/usage */
export interface CatalogExerciseUsageOut {
    exercise_pk: number;
    sessions: number;
    templates: number;
    alternatives: number;
    performance_records: number;
}

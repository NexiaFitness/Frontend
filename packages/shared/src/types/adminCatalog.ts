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
    CatalogReviewInputState,
    ExerciseContractMissingCode,
    ExerciseContractStatus,
    MuscleEvidenceFields,
    TrainingObjective,
} from "./exerciseContract";

export type CatalogReviewStatus = "pending" | "reviewed";

/** Filtro de la revisión masiva: rúbrica, pendiente o desempate. */
export type CatalogValueReviewFilter = "rubric" | "pending" | "tiebreak";

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
    axial_load_review?: CatalogReviewInputState | null;
    nivel_review?: CatalogReviewInputState | null;
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

/** Quién hizo un cambio del historial, clasificado por el servidor. */
export type ExerciseChangeLogActorKind =
    | "import"
    | "admin"
    | "bulk_review"
    | "batch"
    | "batch_rollback"
    | "decision_nelson"
    | "decision_adrian"
    | "migration"
    | "other";

/**
 * Qué puede enseñar la pantalla: `full` la diferencia; `same` nada distinto al leerlo
 * (solo reordenado, vacío → «nan»); `unreadable` forma antigua o desconocida.
 */
export type ExerciseChangeLogDetail = "full" | "same" | "unreadable";

/**
 * Una entrada del historial, ya legible (backend `catalog_change_log_readable`).
 * Los valores crudos se quedan en el registro de auditoría y no viajan. La procedencia
 * (source, source_ref) no se devuelve.
 */
export interface ExerciseChangeLogEntryOut {
    id: number;
    field_path: string;
    actor_user_id?: number | null;
    /** Etiqueta guardada (auditoría); la pantalla usa `actor_kind`. */
    actor_label: string;
    actor_kind: ExerciseChangeLogActorKind;
    batch_number?: number | null;
    created_at: string;
    change: CatalogImportFieldChangeOut;
    detail: ExerciseChangeLogDetail;
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
    axial_load?: string | null;
    axial_load_review?: string | null;
    nivel?: string | null;
    nivel_review?: string | null;
    catalog_review_note?: string | null;
    axial_load_tiebreak?: boolean;
    nivel_tiebreak?: boolean;
    primary_pattern?: string | null;
    equipment?: string[];
    updated_at?: string | null;
}

/** Progreso de revisión F9 — alcance activos. */
export interface CatalogReviewProgressOut {
    reviewed_count: number;
    active_count: number;
    /** Activos con carga o nivel en rúbrica, pendiente o desempate. */
    queue_count?: number;
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
    review?: CatalogValueReviewFilter;
    axial_load?: string;
    nivel?: string;
    pattern?: string;
    include_inactive?: boolean;
    quality_issues_only?: boolean;
}

export interface CatalogBulkReviewItemIn {
    exercise_pk: number;
    axial_load: string;
    nivel: string;
    expected_updated_at: string;
}

export interface CatalogBulkReviewIn {
    items: CatalogBulkReviewItemIn[];
}

export interface CatalogBulkReviewOut {
    updated_count: number;
}

export interface CatalogBulkReviewConflictItem {
    exercise_pk: number;
    nombre: string;
    server_updated_at?: string | null;
}

export interface CatalogImportViolationOut {
    exercise_id?: string | null;
    sheet: string;
    row?: number | null;
    column?: string | null;
    rule: string;
    message: string;
}

/** Atributo de una relación que cambia. `evidence_note` llega sin texto (solo se marca). */
export type CatalogImportItemAttribute =
    | "role"
    | "priority"
    | "evidence_level"
    | "is_coach_decision"
    | "evidence_note";

export interface CatalogImportItemAttributeChangeOut {
    attribute: CatalogImportItemAttribute;
    before: string | null;
    after: string | null;
}

/** Un músculo, patrón, acción, material o etiqueta que se añade, se quita o cambia. */
export interface CatalogImportItemChangeOut {
    change: "added" | "removed" | "changed";
    /** Nombre en español; null si ya no existe en el catálogo (nunca un id). */
    name: string | null;
    /** Código del rol (prime_mover, synergist, stabilizer, primary, secondary), si tiene. */
    role: string | null;
    attributes: CatalogImportItemAttributeChangeOut[];
}

export interface CatalogImportFieldChangeOut {
    field: string;
    /** Valor legible; vacío en una relación (entonces manda `items`). */
    before: string;
    after: string;
    /** Relaciones: qué se añade, quita o cambia. Nunca la lista serializada. */
    items?: CatalogImportItemChangeOut[];
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
    /** Columnas retiradas que traía el archivo y no se aplican (H8: Fuente, Referencia de fuente). */
    ignored_columns?: string[];
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

export type CatalogPreviewVolumeRole = "prime_mover" | "synergist" | "stabilizer";

export type CatalogPreviewEmptyReason = "not_strength";

export type CatalogPreviewAxialReason = "axial_unknown" | "axial_pending_review";

/** Why the trainer picker would hide this draft. Empty means it would list it. */
export type CatalogPreviewSelectorBlock = "inactive" | "incomplete_contract";

/** POST /admin/catalog/preview — one muscle group, one set. */
export interface CatalogPreviewVolumeGroupOut {
    muscle_group_id: number;
    name: string;
    role: CatalogPreviewVolumeRole;
    multiplier: string;
}

export interface CatalogPreviewVolumeOut {
    groups: CatalogPreviewVolumeGroupOut[];
    empty_reason: CatalogPreviewEmptyReason | null;
    is_plyometric: boolean;
}

export interface CatalogPreviewAxialOut {
    verifiable: boolean;
    weight: number | null;
    reason: CatalogPreviewAxialReason | null;
}

/** POST /admin/catalog/preview. Same body as create. Writes nothing. */
export interface CatalogPreviewOut {
    validation_errors: string[];
    contract_status: ExerciseContractStatus;
    contract_missing: ExerciseContractMissingCode[];
    volume_per_set: CatalogPreviewVolumeOut;
    axial_weight: CatalogPreviewAxialOut;
    selectable_in_sessions: boolean;
    selector_blocks: CatalogPreviewSelectorBlock[];
}

/** GET /admin/catalog/exercises/{pk}/usage */
export interface CatalogExerciseUsageOut {
    exercise_pk: number;
    sessions: number;
    templates: number;
    alternatives: number;
    performance_records: number;
}

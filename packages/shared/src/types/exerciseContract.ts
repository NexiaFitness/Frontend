/**
 * exerciseContract.ts — Contrato del ejercicio para el motor (H1): objetivo, revisión y estado
 * de contrato derivado. El origen (source, source_ref) es interno y la API no lo devuelve (H8).
 *
 * Fuente: OpenAPI local `/api/v1/openapi.json` (ExerciseOut, ExerciseCatalogCoreIn,
 * AdminCatalogExerciseListItemOut). Spec: docs/catalogo-ejercicios/motor-v2-2026-10/SPEC_H1.
 * Notas de mantenimiento: `contract_status` lo calcula el backend; el front nunca lo deriva.
 * Los códigos de `contract_missing` se traducen en la capa de presentación de la web.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

/** Solo `strength` suma volumen muscular. */
export type TrainingObjective = "strength" | "cardiovascular" | "mobility";

export const TRAINING_OBJECTIVES: readonly TrainingObjective[] = [
    "strength",
    "cardiovascular",
    "mobility",
];

/**
 * Estado de revisión guardado (lectura). legacy = heredado del catálogo anterior;
 * rubric = puesto por la rúbrica H5b con revisión ciega, elegible en sesiones;
 * pending_review = propuesta sin revisar (bloquea la carga axial); reviewed = confirmado.
 */
export type CatalogReviewState = "legacy" | "pending_review" | "rubric" | "reviewed";

/** Estados que acepta la API como entrada: legacy y rubric los escribe solo el servidor. */
export type CatalogReviewInputState = "pending_review" | "reviewed";

export type ExerciseContractStatus = "complete" | "incomplete";

export type ExerciseContractMissingCode =
    | "objetivo_entrenamiento"
    | "axial_load"
    | "axial_load_pending_review"
    | "nivel"
    | "prime_mover"
    | "primary_pattern"
    | "joint_actions"
    | "equipment";

/** Campos de contrato en ExerciseOut (null = el endpoint no lo calcula o no hay dato). */
export interface ExerciseContractFields {
    objetivo_entrenamiento?: TrainingObjective | null;
    axial_load_review?: CatalogReviewState | null;
    nivel_review?: CatalogReviewState | null;
    contract_status?: ExerciseContractStatus | null;
    contract_missing?: ExerciseContractMissingCode[] | null;
}

/** Trazabilidad por fila ejercicio-músculo. */
export type MuscleEvidenceLevel = "closed" | "extrapolation" | "limited";

export interface MuscleEvidenceFields {
    evidence_level?: MuscleEvidenceLevel | null;
    is_coach_decision?: boolean;
    evidence_note?: string | null;
}

/** GET /exercises/?contract= — `complete` solo para el selector que añade ejercicios. */
export type ExerciseContractFilter = "all" | "complete";

/** Objetivo reconocido, o null si falta o no es válido (sin valor por defecto). */
export function parseTrainingObjective(value: string | null | undefined): TrainingObjective | null {
    const normalized = value?.trim().toLowerCase();
    return TRAINING_OBJECTIVES.find((objective) => objective === normalized) ?? null;
}

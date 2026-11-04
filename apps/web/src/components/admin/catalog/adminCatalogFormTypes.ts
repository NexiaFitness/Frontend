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
} from "@nexia/shared/types/adminCatalog";
import type { MuscleEvidenceFields } from "@nexia/shared/types/exerciseContract";
import {
    parseCatalogAxialLoad,
    parseTrainingObjective,
    type AdminCatalogSectionId,
    type CatalogCoreDraft,
} from "@nexia/shared";

export type { AdminCatalogSectionId };

export interface MuscleRowDraft extends MuscleEvidenceFields {
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

/**
 * Propuesta que la ficha puede confirmar sin cambiar el valor.
 * pending_review bloquea el selector; rubric ya es elegible (H5b) y confirmarlo
 * lo deja en reviewed (H1 R4). legacy y reviewed no piden confirmación.
 */
export type CatalogProposalKind = "pending_review" | "rubric";

export interface PendingReviewState {
    axial_load: CatalogProposalKind | null;
    nivel: CatalogProposalKind | null;
}

export interface AdminCatalogFormDraft {
    core: CatalogCoreDraft;
    pending_review: PendingReviewState;
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

/**
 * Cambia músculo o rol de una fila. La trazabilidad (fuente, decisión, nota) describía la fila
 * anterior: se limpia para no atribuir a una decisión nueva la evidencia de otra.
 */
export function retargetMuscleRow(
    row: MuscleRowDraft,
    patch: Partial<Pick<MuscleRowDraft, "muscle_id" | "role" | "label">>
): MuscleRowDraft {
    const changed =
        (patch.muscle_id !== undefined && patch.muscle_id !== row.muscle_id) ||
        (patch.role !== undefined && patch.role !== row.role);
    if (!changed) return { ...row, ...patch };
    return { ...row, ...patch, evidence_level: null, is_coach_decision: false, evidence_note: null };
}

function proposalKind(review: string | null | undefined): CatalogProposalKind | null {
    return review === "pending_review" || review === "rubric" ? review : null;
}

let rowKeySeq = 0;
export function nextRowKey(prefix: string): string {
    rowKeySeq += 1;
    return `${prefix}-${rowKeySeq}`;
}

/** Alta nueva: nivel, carga axial y objetivo empiezan vacíos y son obligatorios (sin defecto). */
export function emptyCore(): CatalogCoreDraft {
    return {
        nombre: "",
        nombre_ingles: null,
        tipo: "multiarticular",
        nivel: "",
        laterality: "bilateral",
        axial_load: null,
        objetivo_entrenamiento: null,
        descripcion: null,
        instrucciones: null,
        notas: null,
        is_active: true,
    };
}

export function emptyDraft(): AdminCatalogFormDraft {
    return {
        core: emptyCore(),
        pending_review: { axial_load: null, nivel: null },
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
                  // Trazabilidad: se conserva al guardar (su edición llega en H5).
                  evidence_level: m.evidence_level ?? null,
                  is_coach_decision: m.is_coach_decision ?? false,
                  evidence_note: m.evidence_note ?? null,
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
            axial_load: parseCatalogAxialLoad(exercise.axial_load),
            objetivo_entrenamiento: parseTrainingObjective(exercise.objetivo_entrenamiento),
            descripcion: exercise.descripcion,
            instrucciones: exercise.instrucciones,
            notas: exercise.notas,
            is_active: exercise.is_active,
        },
        pending_review: {
            axial_load: proposalKind(exercise.axial_load_review),
            nivel: proposalKind(exercise.nivel_review),
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

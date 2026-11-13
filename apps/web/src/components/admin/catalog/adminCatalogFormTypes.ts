/**
 * adminCatalogFormTypes.ts — Estado local de la ficha Admin (draft UI) y su hidratación.
 *
 * Contexto: lo usa useAdminExerciseCatalogForm; las operaciones sobre el borrador viven en
 * adminCatalogDraft.ts. H10 (DISENO_H10_FICHA_ADMIN): los selectores con búsqueda añaden
 * filas ya elegidas, así que no hay filas vacías; «Revisado» es parte del borrador y viaja
 * en el guardado (D-H10-4).
 * Notas de mantenimiento: el orden de los músculos objetivo es su prioridad (1…n al
 * guardar, orderMusclesForCommit en shared).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type {
    CatalogMuscleRole,
    CatalogPatternRole,
    CatalogExerciseOut,
    CatalogTechniqueOut,
} from "@nexia/shared/types/adminCatalog";
import type { MuscleEvidenceFields } from "@nexia/shared/types/exerciseContract";
import {
    parseCatalogAxialLoad,
    parseTrainingObjective,
    techniqueDraftFromOut,
    type AdminCatalogSectionId,
    type CatalogCoreDraft,
    type CatalogTechniqueDraft,
} from "@nexia/shared";

export type { AdminCatalogSectionId };

export interface MuscleRowDraft extends MuscleEvidenceFields {
    key: string;
    muscle_id: number;
    role: CatalogMuscleRole;
}

export interface PatternRowDraft {
    key: string;
    movement_pattern_id: number;
    role: CatalogPatternRole;
}

export interface JointRowDraft {
    key: string;
    joint_id: number;
    action_id: number;
    role: CatalogPatternRole;
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
    /** Técnica tal como se escribe (SPEC_H10). */
    technique: CatalogTechniqueDraft;
    /** Técnica guardada al hidratar: decide si el guardado la manda (R8) o si vaciarla es borrar (R3). */
    saved_technique: CatalogTechniqueOut | null;
    /** Interruptor «Revisado» (D-H10-4): se aplica al guardar. */
    reviewed: boolean;
    /** Optimistic lock — solo edit. */
    expected_updated_at: string | null;
    exercise_code: string | null;
    review_status: "pending" | "reviewed" | null;
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
        is_active: true,
    };
}

export function emptyDraft(): AdminCatalogFormDraft {
    return {
        core: emptyCore(),
        pending_review: { axial_load: null, nivel: null },
        muscles: [],
        patterns: [],
        joints: [],
        equipment_ids: [],
        tag_ids: [],
        technique: techniqueDraftFromOut(null),
        saved_technique: null,
        reviewed: false,
        expected_updated_at: null,
        exercise_code: null,
        review_status: null,
    };
}

const ROLE_ORDER: Record<string, number> = { prime_mover: 0, synergist: 1, stabilizer: 2 };

export function draftFromCatalog(exercise: CatalogExerciseOut): AdminCatalogFormDraft {
    const musclesRaw = [...(exercise.muscles ?? [])].sort((a, b) => {
        const byRole = (ROLE_ORDER[a.role ?? ""] ?? 9) - (ROLE_ORDER[b.role ?? ""] ?? 9);
        return byRole !== 0 ? byRole : (a.priority ?? 0) - (b.priority ?? 0);
    });

    return {
        core: {
            nombre: exercise.nombre,
            nombre_ingles: exercise.nombre_ingles,
            tipo: exercise.tipo,
            nivel: exercise.nivel,
            laterality: exercise.laterality ?? null,
            axial_load: parseCatalogAxialLoad(exercise.axial_load),
            objetivo_entrenamiento: parseTrainingObjective(exercise.objetivo_entrenamiento),
            is_active: exercise.is_active,
        },
        pending_review: {
            axial_load: proposalKind(exercise.axial_load_review),
            nivel: proposalKind(exercise.nivel_review),
        },
        muscles: musclesRaw.map((m) => ({
            key: nextRowKey("m"),
            muscle_id: m.id,
            role: (m.role as CatalogMuscleRole) || "prime_mover",
            // Trazabilidad: se conserva al guardar mientras la fila no cambie.
            evidence_level: m.evidence_level ?? null,
            is_coach_decision: m.is_coach_decision ?? false,
            evidence_note: m.evidence_note ?? null,
        })),
        patterns: (exercise.movement_patterns ?? []).map((p) => ({
            key: nextRowKey("p"),
            movement_pattern_id: p.id,
            role: (p.role as CatalogPatternRole) || "primary",
        })),
        joints: (exercise.joint_action_details ?? [])
            .filter((j): j is typeof j & { action_id: number } => j.action_id != null)
            .map((j) => ({
                key: nextRowKey("j"),
                joint_id: j.joint_id,
                action_id: j.action_id,
                role: (j.role as CatalogPatternRole) || "primary",
            })),
        equipment_ids: (exercise.equipment ?? []).map((e) => e.id),
        tag_ids: (exercise.tags ?? []).map((t) => t.id),
        technique: techniqueDraftFromOut(exercise.technique),
        saved_technique: exercise.technique ?? null,
        reviewed: exercise.review_status === "reviewed",
        expected_updated_at: exercise.updated_at,
        exercise_code: exercise.exercise_id,
        review_status: exercise.review_status,
    };
}

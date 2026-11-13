/**
 * adminCatalogDraft.ts — Operaciones puras sobre el borrador de la ficha admin.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §3). Las tarjetas de la ficha solo pintan; añadir,
 * quitar, reordenar y cambiar roles pasa por aquí, y `toBundleDraft` lo traduce al
 * contrato. Funciones puras: se prueban sin React.
 * Notas de mantenimiento:
 * - Músculos objetivo: su posición en la lista es su prioridad (orderMusclesForCommit).
 * - Patrones y acciones articulares: siempre queda un primario si hay alguno; al quitar el
 *   primario, el siguiente pasa a primario (la validación pide uno).
 * - Un músculo tiene un solo rol: el selector enseña en qué grupo está ya.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { orderMusclesForCommit, type CatalogBundleDraft } from "@nexia/shared";
import { moveItem } from "@nexia/shared/utils/listOps";
import type { CatalogMuscleRole } from "@nexia/shared/types/adminCatalog";
import {
    nextRowKey,
    type AdminCatalogFormDraft,
    type JointRowDraft,
    type PatternRowDraft,
} from "./adminCatalogFormTypes";

type Draft = AdminCatalogFormDraft;

/** Normaliza el borrador al draft del contrato; no rellena campos obligatorios. */
export function toBundleDraft(draft: Draft): CatalogBundleDraft {
    return {
        core: {
            ...draft.core,
            nombre: draft.core.nombre.trim(),
            nombre_ingles: draft.core.nombre_ingles?.trim() || null,
            tipo: draft.core.tipo.trim().toLowerCase(),
            nivel: draft.core.nivel.trim(),
            laterality: draft.core.laterality?.trim() || null,
        },
        muscles: orderMusclesForCommit(
            draft.muscles.map((m) => ({
                muscle_id: m.muscle_id,
                role: m.role,
                evidence_level: m.evidence_level ?? null,
                is_coach_decision: m.is_coach_decision ?? false,
                evidence_note: m.evidence_note ?? null,
            }))
        ),
        movement_patterns: draft.patterns.map((p) => ({
            movement_pattern_id: p.movement_pattern_id,
            role: p.role,
        })),
        joint_actions: draft.joints.map((j) => ({
            joint_id: j.joint_id,
            action_id: j.action_id,
            role: j.role,
        })),
        equipment_ids: draft.equipment_ids,
        tag_ids: draft.tag_ids,
    };
}

/* ---------------------------------- Músculos --------------------------------- */

export function addMuscle(draft: Draft, muscleId: number, role: CatalogMuscleRole): Draft {
    if (draft.muscles.some((m) => m.muscle_id === muscleId)) return draft;
    return {
        ...draft,
        muscles: [...draft.muscles, { key: nextRowKey("m"), muscle_id: muscleId, role }],
    };
}

export function removeMuscle(draft: Draft, key: string): Draft {
    return { ...draft, muscles: draft.muscles.filter((m) => m.key !== key) };
}

/** Sube (-1) o baja (+1) un músculo objetivo; su posición es su prioridad. */
export function movePrimeMover(draft: Draft, key: string, direction: -1 | 1): Draft {
    const primeMovers = draft.muscles.filter((m) => m.role === "prime_mover");
    const index = primeMovers.findIndex((m) => m.key === key);
    if (index < 0) return draft;
    const moved = moveItem(primeMovers, index, index + direction);
    if (moved === primeMovers) return draft;
    return { ...draft, muscles: [...moved, ...draft.muscles.filter((m) => m.role !== "prime_mover")] };
}

/** Motivo por el que un músculo no se puede añadir: ya está en algún grupo. */
export function muscleUnavailable(
    draft: Draft,
    roleLabels: Record<CatalogMuscleRole, string>
): Map<number, string> {
    return new Map(draft.muscles.map((m) => [m.muscle_id, roleLabels[m.role]]));
}

/* ---------------------------------- Patrones --------------------------------- */

function withPrimary<T extends PatternRowDraft | JointRowDraft>(rows: T[]): T[] {
    if (rows.length === 0 || rows.some((r) => r.role === "primary")) return rows;
    return rows.map((r, i) => (i === 0 ? { ...r, role: "primary" } : r));
}

function setOnlyPrimary<T extends PatternRowDraft | JointRowDraft>(rows: T[], key: string): T[] {
    return rows.map((r) => ({ ...r, role: r.key === key ? "primary" : "secondary" }));
}

export function addPattern(draft: Draft, patternId: number): Draft {
    if (draft.patterns.some((p) => p.movement_pattern_id === patternId)) return draft;
    const role = draft.patterns.some((p) => p.role === "primary") ? "secondary" : "primary";
    return {
        ...draft,
        patterns: [...draft.patterns, { key: nextRowKey("p"), movement_pattern_id: patternId, role }],
    };
}

export function removePattern(draft: Draft, key: string): Draft {
    return { ...draft, patterns: withPrimary(draft.patterns.filter((p) => p.key !== key)) };
}

export function setPrimaryPattern(draft: Draft, key: string): Draft {
    return { ...draft, patterns: setOnlyPrimary(draft.patterns, key) };
}

/* ----------------------------- Acciones articulares ---------------------------- */

export function addJointAction(draft: Draft, jointId: number, actionId: number): Draft {
    if (draft.joints.some((j) => j.joint_id === jointId && j.action_id === actionId)) return draft;
    const role = draft.joints.some((j) => j.role === "primary") ? "secondary" : "primary";
    return {
        ...draft,
        joints: [...draft.joints, { key: nextRowKey("j"), joint_id: jointId, action_id: actionId, role }],
    };
}

export function removeJointAction(draft: Draft, key: string): Draft {
    return { ...draft, joints: withPrimary(draft.joints.filter((j) => j.key !== key)) };
}

/** Primario ↔ secundario: una acción articular puede ser secundaria junto a otra primaria. */
export function toggleJointRole(draft: Draft, key: string): Draft {
    return {
        ...draft,
        joints: withPrimary(
            draft.joints.map((j) =>
                j.key === key ? { ...j, role: j.role === "primary" ? "secondary" : "primary" } : j
            )
        ),
    };
}

/** Acciones que esa articulación ya tiene. */
export function jointActionsTaken(draft: Draft, jointId: number, reason: string): Map<number, string> {
    return new Map(draft.joints.filter((j) => j.joint_id === jointId).map((j) => [j.action_id, reason]));
}

/* ------------------------------ Material y etiquetas ---------------------------- */

export function addId(list: number[], id: number): number[] {
    return list.includes(id) ? list : [...list, id];
}

export function removeId(list: number[], id: number): number[] {
    return list.filter((value) => value !== id);
}

export function takenIds(list: readonly number[], reason: string): Map<number, string> {
    return new Map(list.map((id) => [id, reason]));
}

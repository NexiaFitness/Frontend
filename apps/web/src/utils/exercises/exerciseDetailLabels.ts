/**
 * exerciseDetailLabels.ts — Etiquetas UI para campos catálogo en detalle de ejercicio.
 */

import type { ExerciseJointActionRef, ExerciseTagRef } from "@nexia/shared/hooks/exercises";

const TIPO_CARGA_LABELS: Record<string, string> = {
    bodyweight: "Peso corporal",
    external: "Carga externa",
    mixed: "Mixta",
    ext: "Carga externa",
    free_weight: "Carga externa",
};

const LATERALITY_LABELS: Record<string, string> = {
    bilateral: "Bilateral",
    unilateral: "Unilateral",
    alternating: "Alternante",
};

const AXIAL_LOAD_LABELS: Record<string, string> = {
    none: "Sin carga axial",
    low: "Axial baja",
    medium: "Axial media",
    high: "Axial alta",
};

const STIMULUS_LABELS: Record<string, string> = {
    strength: "Fuerza",
    hypertrophy: "Hipertrofia",
    endurance: "Resistencia",
    power: "Potencia",
    stability: "Estabilidad",
    mobility: "Movilidad",
};

const ROLE_LABELS: Record<string, string> = {
    prime_mover: "Agonista",
    synergist: "Sinergista",
    stabilizer: "Estabilizador",
    primary: "Principal",
    secondary: "Secundario",
};

export function tipoCargaLabel(value: string | null | undefined): string {
    if (!value?.trim()) return "";
    const key = value.trim().toLowerCase();
    return TIPO_CARGA_LABELS[key] ?? value;
}

export function lateralityLabel(value: string | null | undefined): string {
    if (!value?.trim()) return "";
    const key = value.trim().toLowerCase();
    return LATERALITY_LABELS[key] ?? value;
}

export function axialLoadLabel(value: string | null | undefined): string {
    if (!value?.trim()) return "";
    const key = value.trim().toLowerCase();
    return AXIAL_LOAD_LABELS[key] ?? value;
}

export function stimulusTypeLabel(value: string | null | undefined): string {
    if (!value?.trim()) return "";
    const key = value.trim().toLowerCase();
    return STIMULUS_LABELS[key] ?? value;
}

export function catalogRoleLabel(role: string | null | undefined): string {
    if (!role?.trim()) return "";
    const key = role.trim().toLowerCase().replace(/\s+/g, "_");
    return ROLE_LABELS[key] ?? role;
}

export function mechanicalLoadLabel(level: number | null | undefined): string {
    if (level == null || level < 1 || level > 5) return "";
    return `Nivel ${level} / 5`;
}

export function tagDisplayLabel(tag: Pick<ExerciseTagRef, "name_es" | "name_en">): string {
    return (tag.name_es?.trim() || tag.name_en || "").trim();
}

/** Etiquetas catálogo deduplicadas por id para chips en detalle (spec §5 equipamiento y tags). */
export function exerciseTagItems(
    tags: ExerciseTagRef[] | null | undefined
): Array<{ id: number; label: string }> {
    if (!Array.isArray(tags) || tags.length === 0) return [];

    const byId = new Map<number, string>();
    for (const tag of tags) {
        const label = tagDisplayLabel(tag);
        if (label && tag.id != null) {
            byId.set(tag.id, label);
        }
    }
    return [...byId.entries()]
        .sort((a, b) => a[1].localeCompare(b[1], "es"))
        .map(([id, label]) => ({ id, label }));
}

export function jointActionDisplayLine(
    ja: ExerciseJointActionRef
): string {
    const joint = (ja.joint_name_es?.trim() || ja.joint_name_en || "").trim();
    const action = (ja.action_name_es?.trim() || ja.action_name_en || "").trim();
    const role = ja.role ? catalogRoleLabel(ja.role) : "";
    const parts = [joint, action].filter(Boolean);
    const base = parts.join(" · ");
    return role ? `${base} (${role})` : base;
}

export const EXERCISE_DETAIL_EMPTY_COPY = "Sin dato en catálogo";

/**
 * Opciones de filtro derivadas de la lista de ejercicios (spec Lovable).
 * Lógica de músculo prime_mover: @nexia/shared/exercises/muscleDisplay (DC-11).
 */

import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    collectPrimeMoverFilterOptions,
    exerciseMatchesMuscleFilter,
    exerciseMuscleSearchText,
    exercisePrimeMoverLabels,
    muscleFacetLabel,
    type ExerciseMuscleFacetInput,
    type MuscleRoleRef,
} from "@nexia/shared";
import { formatEquipmentLabelLine } from "./translations";

export type { ExerciseMuscleFacetInput, MuscleRoleRef };
export {
    collectPrimeMoverFilterOptions,
    exerciseMatchesMuscleFilter,
    exerciseMuscleSearchText,
    exercisePrimeMoverLabels,
    muscleFacetLabel,
};

function uniqSorted(values: string[]): string[] {
    const set = new Set(values.map((v) => v.trim()).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

function normKey(s: string): string {
    return s.trim().toLowerCase();
}

function primaryMuscleSegment(musculatura: string | null | undefined): string {
    if (!musculatura) return "";
    return musculatura.split(",")[0]?.trim() ?? "";
}

function equipmentParts(equipo: string | null | undefined): string[] {
    if (!equipo) return [];
    return equipo
        .split(/[,;/]/)
        .map((p) => p.trim())
        .filter(Boolean);
}

const LEGACY_PATTERN_PLACEHOLDERS = new Set(["general"]);

function isLegacyPlaceholder(value: string, placeholders: Set<string>): boolean {
    return placeholders.has(value.trim().toLowerCase());
}

export type MuscleFacetInput = Pick<Exercise, "muscles" | "musculatura_principal">;

/** Tokens de equipo normalizados (slug) para filtrar y deduplicar opciones. */
export function exerciseEquipmentTokens(ex: Exercise): string[] {
    const fromCat = (ex.equipment || [])
        .map((item) =>
            (item.name_en || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
        )
        .filter(Boolean);
    const fromLegacy = equipmentParts(ex.equipo).map((p) => p.trim().toLowerCase());
    return [...fromCat, ...fromLegacy];
}

/** Línea de equipo para UI (español del catálogo si existe). */
export function equipmentDisplayLine(ex: Exercise): string {
    const cat = ex.equipment || [];
    if (cat.length > 0) {
        return cat
            .map((item) => (item.name_es?.trim() || item.name_en || "").trim())
            .filter(Boolean)
            .join(", ");
    }
    return formatEquipmentLabelLine(ex.equipo || "");
}

export type PatternLabelsInput = Pick<Exercise, "movement_patterns" | "patron_movimiento">;

/** Etiquetas de patrón desde catálogo + columna legacy. */
export function exercisePatternLabels(ex: PatternLabelsInput): string[] {
    const mps = ex.movement_patterns || [];
    const out: string[] = [];
    for (const mp of mps) {
        const label = (mp.name_es || mp.name_en || "").trim();
        if (label) out.push(label);
    }
    const leg = (ex.patron_movimiento || "").trim();
    const hasCatalogPatterns = out.length > 0;
    const legacyIsPlaceholder =
        hasCatalogPatterns && isLegacyPlaceholder(leg, LEGACY_PATTERN_PLACEHOLDERS);
    if (leg && !legacyIsPlaceholder && !out.some((x) => normKey(x) === normKey(leg))) {
        out.push(leg);
    }
    return out;
}

export function getFilterOptions(exercises: Exercise[]): {
    groups: string[];
    equip: string[];
    patterns: string[];
} {
    return {
        groups: collectPrimeMoverFilterOptions(exercises),
        equip: uniqSorted(exercises.flatMap((e) => exerciseEquipmentTokens(e))),
        patterns: uniqSorted(exercises.flatMap((e) => exercisePatternLabels(e))),
    };
}

export { primaryMuscleSegment, equipmentParts };

/**
 * Opciones de filtro derivadas de la lista de ejercicios (spec Lovable).
 * Prioriza relaciones del catálogo nuevo (muscles, equipment, movement_patterns)
 * cuando existen; las columnas legacy a menudo quedan genéricas tras el import Excel.
 */

import type { Exercise } from "@nexia/shared/hooks/exercises";
import { getEquipmentLabel } from "./translations";

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

function isPrimeMoverRole(role: string | undefined | null): boolean {
    const r = (role || "").toLowerCase().replace(/\s+/g, "_");
    return r === "prime_mover" || r === "primary";
}

/** Texto de músculo para badge / filtro / búsqueda (prioriza catálogo). */
export function muscleFacetLabel(ex: Exercise): string {
    const muscles = ex.muscles;
    if (Array.isArray(muscles) && muscles.length > 0) {
        const prime = muscles.filter((m) => isPrimeMoverRole(m.role));
        const pick = (prime.length ? prime : muscles)[0];
        const label = (pick?.name_es || pick?.name || pick?.name_en || "").trim();
        if (label) return label;
    }
    return primaryMuscleSegment(ex.musculatura_principal) || (ex.musculatura_principal || "").trim();
}

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
    return equipmentParts(ex.equipo)
        .map((p) => getEquipmentLabel(p))
        .join(", ");
}

/** Etiquetas de patrón desde catálogo + columna legacy. */
export function exercisePatternLabels(ex: Exercise): string[] {
    const mps = ex.movement_patterns || [];
    const out: string[] = [];
    for (const mp of mps) {
        const label = (mp.name_es || mp.name_en || "").trim();
        if (label) out.push(label);
    }
    const leg = (ex.patron_movimiento || "").trim();
    if (leg && !out.some((x) => normKey(x) === normKey(leg))) {
        out.push(leg);
    }
    return out;
}

export function getFilterOptions(exercises: Exercise[]): {
    groups: string[];
    equip: string[];
    patterns: string[];
} {
    const groups: string[] = [];
    const equip: string[] = [];
    const patterns: string[] = [];

    for (const e of exercises) {
        const g = muscleFacetLabel(e);
        if (g) groups.push(g);
        equip.push(...exerciseEquipmentTokens(e));
        patterns.push(...exercisePatternLabels(e));
    }

    return {
        groups: uniqSorted(groups),
        equip: uniqSorted(equip),
        patterns: uniqSorted(patterns),
    };
}

export { primaryMuscleSegment, equipmentParts };

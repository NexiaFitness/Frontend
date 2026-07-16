/**
 * Opciones de filtro desde tablas de referencia del catálogo (API).
 */

import type { ExercisesLibraryCatalogOption } from "@/components/exercises/exercisesLibraryPresentation";

interface CatalogNamed {
    id: number;
    name_en: string;
    name_es?: string | null;
}

function catalogDisplayLabel(item: CatalogNamed): string {
    return (item.name_es?.trim() || item.name_en || "").trim();
}

/** Grupos / equipamiento / patrones ordenados en español; descarta entradas corruptas. */
export function buildCatalogFilterOptions(
    items: CatalogNamed[] | undefined | null
): ExercisesLibraryCatalogOption[] {
    if (!items?.length) return [];

    const byId = new Map<number, ExercisesLibraryCatalogOption>();
    for (const item of items) {
        const label = catalogDisplayLabel(item);
        if (!label || !Number.isNaN(Number(label))) continue;
        byId.set(item.id, { id: item.id, label });
    }

    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Etiquetas de grupo muscular para formulario legacy (solo sesión local). */
export function catalogOptionLabels(options: ExercisesLibraryCatalogOption[]): string[] {
    return options.map((o) => o.label);
}

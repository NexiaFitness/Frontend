/**
 * adminCatalogPreviewPresentation.ts — Copy de «Cómo cuenta» (vista previa del motor en la ficha).
 *
 * Contexto: H5 lo creó como panel a todo el ancho; H10 lo convierte en tarjeta de la
 * columna derecha (DISENO_H10_FICHA_ADMIN §3): nombre, barra y número en la misma fila.
 * Las clases de la tarjeta viven en adminCatalogFichaPresentation (FICHA_COUNT_*).
 * Notas de mantenimiento: la barra es AthleteProgressBar en primary; el peso axial usa la
 * escala del motor (0-3).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { CatalogPreviewSelectorBlock } from "@nexia/shared/types/adminCatalog";

const AXIAL_SCALE_NAME: Record<number, string> = {
    0: "Ninguna",
    1: "Baja",
    2: "Media",
    3: "Alta",
};

/** Nombre de un peso axial de la escala del motor («Baja» para 1). */
export function axialScaleName(weight: number): string {
    return AXIAL_SCALE_NAME[weight] ?? String(weight);
}

export const ADMIN_CATALOG_PREVIEW_COPY = {
    calculating: "Calculando…",
    notStrength: "El objetivo no es fuerza, así que no cuenta volumen muscular.",
    notVerifiable: "No verificable",
    pendingAxial: "El valor está pendiente de revisión y el motor lo usa igual.",
    productCriterion: "Criterio de producto",
    selectable: "Entra en el selector de sesiones.",
    notSelectable: "No entra en el selector hasta que el contrato esté completo.",
    notSelectableInactive: "No entra en el selector: el ejercicio está inactivo.",
    notSelectableBoth: "No entra en el selector: está inactivo y el contrato no está completo.",
    incomplete:
        "Completa nombre, tipo, nivel, carga axial y objetivo de entrenamiento para ver cómo contará cada serie.",
    error: "No se pudo calcular cómo cuenta este ejercicio.",
    retry: "Reintentar",
    role: {
        prime_mover: "Objetivo",
        synergist: "Sinergista",
        stabilizer: "Estabilizador",
    },
} as const;

export function catalogPreviewSelectorCopy(blocks: readonly CatalogPreviewSelectorBlock[]): string {
    const inactive = blocks.includes("inactive");
    const incomplete = blocks.includes("incomplete_contract");
    if (inactive && incomplete) return ADMIN_CATALOG_PREVIEW_COPY.notSelectableBoth;
    if (inactive) return ADMIN_CATALOG_PREVIEW_COPY.notSelectableInactive;
    if (incomplete) return ADMIN_CATALOG_PREVIEW_COPY.notSelectable;
    return ADMIN_CATALOG_PREVIEW_COPY.selectable;
}

export const ADMIN_CATALOG_PREVIEW_SKELETON = "h-9 animate-pulse rounded-lg bg-muted/40";

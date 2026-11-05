/**
 * adminCatalogPreviewPresentation.ts — Panel «Cómo cuenta este ejercicio».
 *
 * Card glass del sistema. La barra es la de AthleteProgressBar en primary.
 */

import type { CatalogPreviewSelectorBlock } from "@nexia/shared/types/adminCatalog";
import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const ADMIN_CATALOG_PREVIEW_CARD = cn(NEXIA_GLASS_CARD, "relative space-y-3 p-4");

export const ADMIN_CATALOG_PREVIEW_TITLE = "text-base font-semibold text-foreground";

export const ADMIN_CATALOG_PREVIEW_LINE = "text-sm text-foreground";

export const ADMIN_CATALOG_PREVIEW_META = "text-sm text-muted-foreground";

export const ADMIN_CATALOG_PREVIEW_NOTE = "text-caption text-muted-foreground";

export const ADMIN_CATALOG_PREVIEW_ROW = "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center";

export const ADMIN_CATALOG_PREVIEW_SKELETON = "h-10 animate-pulse rounded-lg bg-muted/40";

const AXIAL_SCALE_NAME: Record<number, string> = {
    0: "Ninguna",
    1: "Baja",
    2: "Media",
    3: "Alta",
};

export const ADMIN_CATALOG_PREVIEW_COPY = {
    title: "Cómo cuenta este ejercicio",
    calculating: "Calculando…",
    notStrength: "El objetivo no es fuerza, así que no cuenta volumen muscular.",
    notVerifiable: "Carga axial no verificable.",
    pendingAxial: "El valor está pendiente de revisión y el motor lo usa igual.",
    productCriterion: "Criterio de producto",
    selectable: "Entra en el selector de sesiones.",
    notSelectable: "No entra en el selector hasta que el contrato esté completo.",
    notSelectableInactive: "No entra en el selector: el ejercicio está inactivo.",
    notSelectableBoth: "No entra en el selector: está inactivo y el contrato no está completo.",
    incomplete: "Completa nombre, tipo, nivel, carga axial y objetivo para ver el cálculo.",
    error: "No se pudo calcular cómo cuenta este ejercicio.",
    retry: "Reintentar",
    axialScale: "Escala del motor: Ninguna 0, Baja 1, Media 2, Alta 3.",
    axial: (weight: number) => {
        const name = AXIAL_SCALE_NAME[weight];
        return name ? `Peso axial: ${weight} · ${name}` : `Peso axial: ${weight}`;
    },
    role: {
        prime_mover: "Objetivo",
        synergist: "Sinergista",
        stabilizer: "Estabilizador",
    },
} as const;

export function catalogPreviewSelectorCopy(
    blocks: readonly CatalogPreviewSelectorBlock[]
): string {
    const inactive = blocks.includes("inactive");
    const incomplete = blocks.includes("incomplete_contract");
    if (inactive && incomplete) return ADMIN_CATALOG_PREVIEW_COPY.notSelectableBoth;
    if (inactive) return ADMIN_CATALOG_PREVIEW_COPY.notSelectableInactive;
    if (incomplete) return ADMIN_CATALOG_PREVIEW_COPY.notSelectable;
    return ADMIN_CATALOG_PREVIEW_COPY.selectable;
}

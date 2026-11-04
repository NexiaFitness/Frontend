/**
 * adminCatalogPreviewPresentation.ts — Panel «Cómo cuenta este ejercicio».
 *
 * Card glass del sistema. La barra es la de AthleteProgressBar en primary.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const ADMIN_CATALOG_PREVIEW_CARD = cn(NEXIA_GLASS_CARD, "relative space-y-3 p-4");

export const ADMIN_CATALOG_PREVIEW_TITLE = "text-base font-semibold text-foreground";

export const ADMIN_CATALOG_PREVIEW_LINE = "text-sm text-foreground";

export const ADMIN_CATALOG_PREVIEW_META = "text-sm text-muted-foreground";

export const ADMIN_CATALOG_PREVIEW_NOTE = "text-caption text-muted-foreground";

export const ADMIN_CATALOG_PREVIEW_ROW = "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center";

export const ADMIN_CATALOG_PREVIEW_SKELETON = "h-10 animate-pulse rounded-lg bg-muted/40";

export const ADMIN_CATALOG_PREVIEW_COPY = {
    title: "Cómo cuenta este ejercicio",
    notStrength: "El objetivo no es fuerza, así que no cuenta volumen muscular.",
    notVerifiable: "Carga axial no verificable.",
    pendingAxial: "El valor está pendiente de revisión y el motor lo usa igual.",
    productCriterion: "Criterio de producto",
    selectable: "Entra en el selector de sesiones.",
    notSelectable: "No entra en el selector hasta que el contrato esté completo.",
    incomplete: "Completa nombre, tipo, nivel, carga axial y objetivo para ver el cálculo.",
    error: "No se pudo calcular cómo cuenta este ejercicio.",
    retry: "Reintentar",
    axial: (weight: number) => `Peso axial: ${weight}`,
    role: {
        prime_mover: "Objetivo",
        synergist: "Sinergista",
        stabilizer: "Estabilizador",
    },
} as const;

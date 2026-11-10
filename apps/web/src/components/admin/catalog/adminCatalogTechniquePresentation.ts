/**
 * adminCatalogTechniquePresentation.ts — Copy y tokens de la pestaña «Técnica» de la ficha admin.
 *
 * Contexto: SPEC_H10 §6.4. Escribir a la izquierda y ver a la derecha lo que leen el
 * entrenador y el atleta, con el mismo componente (ExerciseTechniqueText). En móvil, un
 * segmentado «Escribir / Vista previa». Base 375 px; lg añade la segunda columna.
 * Notas de mantenimiento: tokens del sistema (glass, rim, formularios premium); nada inventado.
 * Los límites vienen de CATALOG_TECHNIQUE_LIMITS (shared), no se repiten aquí.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import type { CatalogTechniqueCounts } from "@nexia/shared";
import { CATALOG_TECHNIQUE_LIMITS } from "@nexia/shared";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { PLATFORM_FORM_SECTION_TITLE } from "@/components/ui/forms/platformFormPresentation";

export type AdminCatalogTechniqueView = "write" | "preview";

function thousands(value: number): string {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const ADMIN_CATALOG_TECHNIQUE_COPY = {
    title: "Técnica",
    hint: "Lo que lee el atleta en «Ver técnica» y el entrenador en la ficha del ejercicio.",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Qué es el ejercicio y qué trabaja, en una o dos frases.",
    stepsLabel: "Ejecución",
    stepsPlaceholder:
        "Colócate de pie con los pies a la anchura de la cadera.\nBaja controlando la espalda.\nSube empujando el suelo.",
    tipsLabel: "Consejos (opcional)",
    tipsPlaceholder: "Errores que evitar, uno por línea.",
    previewTitle: "Vista previa",
    previewHint: "Así lo leen el entrenador y el atleta.",
    previewEmptyCreate: "Escribe la descripción y los pasos para ver cómo quedará.",
    previewEmptyEdit: "Este ejercicio aún no tiene técnica. Escribe la descripción y los pasos.",
    viewsAriaLabel: "Escribir o ver la técnica",
    views: [
        { id: "write", label: "Escribir" },
        { id: "preview", label: "Vista previa" },
    ],
    descriptionHelper: (counts: CatalogTechniqueCounts) =>
        `En una o dos frases · ${thousands(counts.descriptionLength)} / ${thousands(
            CATALOG_TECHNIQUE_LIMITS.descriptionMax
        )}`,
    stepsHelper: (counts: CatalogTechniqueCounts) =>
        `Un paso por línea, en orden · ${counts.steps} de ${CATALOG_TECHNIQUE_LIMITS.stepsMax}`,
    tipsHelper: (counts: CatalogTechniqueCounts) =>
        `Uno por línea · ${counts.tips} de ${CATALOG_TECHNIQUE_LIMITS.tipsMax}`,
} as const;

/** Segmentado Escribir / Vista previa: solo por debajo de lg, donde las columnas no caben. */
export const ADMIN_CATALOG_TECHNIQUE_VIEWS = "lg:hidden";

export const ADMIN_CATALOG_TECHNIQUE_LAYOUT = cn(
    "grid grid-cols-1 gap-6",
    "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8"
);

export const ADMIN_CATALOG_TECHNIQUE_EDITOR = "space-y-5";

/** Columna oculta en móvil cuando el segmentado muestra la otra; en lg, las dos. */
export const ADMIN_CATALOG_TECHNIQUE_COLUMN_HIDDEN = "hidden lg:block";

/** Crece con el texto hasta un tope; después, scroll dentro de la caja. */
const AUTOSIZE = "[field-sizing:content] resize-none max-h-[28rem] overflow-y-auto";

export const ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT = cn(AUTOSIZE, "min-h-[6rem]");

export const ADMIN_CATALOG_TECHNIQUE_STEPS_INPUT = cn(AUTOSIZE, "min-h-[11rem]");

export const ADMIN_CATALOG_TECHNIQUE_TIPS_INPUT = cn(AUTOSIZE, "min-h-[6rem]");

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW = cn(
    NEXIA_GLASS_CARD,
    "space-y-4 p-5 lg:sticky lg:top-4"
);

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW_HEADER = "space-y-1";

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW_TITLE = PLATFORM_FORM_SECTION_TITLE;

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW_HINT = "text-sm text-muted-foreground";

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY =
    "rounded-lg border border-dashed border-border/70 px-4 py-6 text-sm leading-relaxed text-muted-foreground";

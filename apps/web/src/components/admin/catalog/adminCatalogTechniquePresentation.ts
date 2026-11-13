/**
 * adminCatalogTechniquePresentation.ts — Copy y clases de la tarjeta «Técnica» de la ficha admin.
 *
 * Contexto: SPEC_H10 y DISENO_H10_FICHA_ADMIN §3. Tarjeta a todo el ancho con tres
 * columnas en escritorio (Descripción · Ejecución · Consejos) y un segmentado «Escribir /
 * Vista previa»; la vista previa usa ExerciseTechniqueText, lo mismo que ve el entrenador.
 * Notas de mantenimiento: terminología única Descripción · Ejecución · Consejos (D-H10-1).
 * Los límites vienen de CATALOG_TECHNIQUE_LIMITS (shared), nunca se copian aquí.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import { CATALOG_TECHNIQUE_LIMITS } from "@nexia/shared";

export type AdminCatalogTechniqueView = "write" | "preview";

function thousands(value: number): string {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const ADMIN_CATALOG_TECHNIQUE_COPY = {
    aside: "Lo que leen el entrenador y el atleta. Texto de NEXIA, en español.",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Qué es y para qué sirve, en una o dos frases.",
    descriptionCounter: (length: number) =>
        `${thousands(length)} / ${thousands(CATALOG_TECHNIQUE_LIMITS.descriptionMax)}`,
    stepsLabel: "Ejecución",
    stepItem: (index: number) => `Paso ${index + 1}`,
    stepPlaceholder: (index: number) =>
        index === 0 ? "Describe el primer paso" : "Siguiente paso",
    addStep: "Añadir paso",
    stepsHelper: (count: number) =>
        `Intro añade un paso · ${count} de ${CATALOG_TECHNIQUE_LIMITS.stepsMax}`,
    tipsLabel: "Consejos",
    tipsOptional: "· opcional",
    tipItem: (index: number) => `Consejo ${index + 1}`,
    tipPlaceholder: () => "Un error típico o una sensación que buscar",
    addTip: "Añadir consejo",
    tipsHelper: (count: number) => `${count} de ${CATALOG_TECHNIQUE_LIMITS.tipsMax}`,
    libraryHint: "Si la dejas vacía, se usa el texto del candidato de la Biblioteca.",
    previewEmptyCreate: "Escribe la descripción y los pasos para ver cómo quedará.",
    previewEmptyEdit: "Este ejercicio aún no tiene técnica. Escribe la descripción y los pasos.",
    viewsAriaLabel: "Escribir o ver la técnica",
    views: [
        { id: "write", label: "Escribir" },
        { id: "preview", label: "Vista previa" },
    ],
    summaryNone: "Sin texto",
    summary: (steps: number, tips: number) =>
        `${steps === 1 ? "1 paso" : `${steps} pasos`} · ${tips === 1 ? "1 consejo" : `${tips} consejos`}`,
} as const;

/** Segmentado en la cabecera (escritorio, ancho fijo) o dentro de la tarjeta (móvil). */
export const ADMIN_CATALOG_TECHNIQUE_VIEWS_HEADER = "w-56";

export const ADMIN_CATALOG_TECHNIQUE_VIEWS_MOBILE = "lg:hidden";

export const ADMIN_CATALOG_TECHNIQUE_GRID = "grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 lg:items-start";

export const ADMIN_CATALOG_TECHNIQUE_DESCRIPTION_INPUT = cn(
    "[field-sizing:content] resize-none min-h-[7rem] max-h-[28rem] overflow-y-auto"
);

export const ADMIN_CATALOG_TECHNIQUE_COUNTER = "mt-1 flex justify-end text-xs tabular-nums text-muted-foreground";

export const ADMIN_CATALOG_TECHNIQUE_COUNTER_OVER = "text-destructive";

export const ADMIN_CATALOG_TECHNIQUE_OPTIONAL = "font-normal text-muted-foreground/80";

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW = "max-w-2xl";

export const ADMIN_CATALOG_TECHNIQUE_PREVIEW_EMPTY =
    "rounded-lg border border-dashed border-border/70 px-4 py-6 text-sm leading-relaxed text-muted-foreground";

export const ADMIN_CATALOG_TECHNIQUE_HINT = "text-xs text-muted-foreground";

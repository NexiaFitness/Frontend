/**
 * addPillPresentation.ts — Pills de acción «añadir» (borde dashed, acento primary).
 *
 * Patrón Sparkle Flow: secundario cyan, hover suave, sin glow neón.
 * Usos: cualidades físicas del bloque, selectors tipo «+ opción» en wizards.
 */

import { cn } from "@/lib/utils";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";

export type AddPillVariant = "premium" | "compact";

/** Etiqueta de sección «Añadir …» — paridad PLATFORM_SECTION_LABEL. */
export const ADD_PILL_SECTION_LABEL_CLASS = PLATFORM_SECTION_LABEL;

export const ADD_PILL_SECTION_HINT_CLASS =
    "ml-1.5 font-normal normal-case text-muted-foreground/80";

const ADD_PILL_BASE_CLASS = cn(
    "inline-flex items-center justify-center rounded-full border border-dashed",
    "font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

/** Wizard D-PAP y surfaces premium — tamaño táctil, acento primary. */
export const ADD_PILL_PREMIUM_CLASS = cn(
    ADD_PILL_BASE_CLASS,
    "border-primary/25 bg-primary/5 px-3.5 py-2",
    "text-xs text-muted-foreground md:text-sm",
    "hover:border-primary/45 hover:bg-primary/10 hover:text-primary",
);

/** Constructor legacy / densidad alta. */
export const ADD_PILL_COMPACT_CLASS = cn(
    ADD_PILL_BASE_CLASS,
    "border-border px-3 py-1.5 text-[11px] text-muted-foreground",
    "hover:border-primary hover:bg-primary/5 hover:text-primary",
);

/** Celda en grid ancho completo (wizard cualidades). */
export const ADD_PILL_PREMIUM_GRID_ITEM_CLASS = cn(
    ADD_PILL_PREMIUM_CLASS,
    "w-full min-w-0 px-2.5 py-2.5 whitespace-normal text-center leading-snug",
);

export const ADD_PILL_GRID_PREMIUM_CLASS = cn(
    "grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:gap-2.5",
);

export const ADD_PILL_WRAP_COMPACT_CLASS =
    "flex flex-wrap gap-2 md:gap-2.5";

export function addPillItemClass(
    variant: AddPillVariant,
    fullWidth = false,
): string {
    if (variant === "premium" && fullWidth) {
        return ADD_PILL_PREMIUM_GRID_ITEM_CLASS;
    }
    return variant === "premium"
        ? ADD_PILL_PREMIUM_CLASS
        : ADD_PILL_COMPACT_CLASS;
}

export function addPillGridClass(variant: AddPillVariant): string {
    return variant === "premium"
        ? ADD_PILL_GRID_PREMIUM_CLASS
        : ADD_PILL_WRAP_COMPACT_CLASS;
}

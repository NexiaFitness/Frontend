/**
 * formControlPresentation.ts — Tokens canónicos para inputs, selects y textareas.
 *
 * Regla: altura fija (h-*) + py-0 + text-sm leading-none en campos de una línea,
 * para que el texto quepa sin desbordar. Fuente única para Input, SearchBar,
 * formFieldStyles y normalización global en index.css.
 */

import { cn } from "@/lib/utils";

/** Tipografía estándar en campos de formulario (una línea). */
export const NEXIA_FORM_CONTROL_TEXT = "text-sm leading-none";

/** Tipografía en textarea (multilínea). */
export const NEXIA_FORM_CONTROL_TEXTAREA_TEXT = "text-sm leading-normal";

export const NEXIA_FORM_CONTROL_FOCUS =
    "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]";

export const NEXIA_FORM_CONTROL_BASE = cn(
    "block w-full rounded-md border border-input bg-background text-foreground transition-colors",
    "placeholder:text-muted-foreground caret-primary",
    NEXIA_FORM_CONTROL_TEXT,
    NEXIA_FORM_CONTROL_FOCUS,
    "disabled:cursor-not-allowed disabled:opacity-50",
);

export const NEXIA_FORM_CONTROL_SIZE = {
    compact:
        "h-7 min-h-0 px-2 py-0 text-[11px] leading-none rounded-md border-border/60 bg-surface",
    xs: "h-8 min-h-0 px-2.5 py-0 text-xs leading-none rounded-md border-border/60 bg-surface",
    sm: "h-9 min-h-0 px-3 py-0",
    md: "h-9 min-h-0 px-4 py-0",
    lg: "h-9 min-h-0 px-5 py-0",
} as const;

export type NexiaFormControlSize = keyof typeof NEXIA_FORM_CONTROL_SIZE;

export function nexiaFormControlInputClass(size: NexiaFormControlSize = "sm"): string {
    return cn(NEXIA_FORM_CONTROL_BASE, NEXIA_FORM_CONTROL_SIZE[size]);
}

/** Input estándar sm — reutilizable en formFieldStyles y campos sueltos. */
export const NEXIA_FORM_CONTROL_INPUT = nexiaFormControlInputClass("sm");

/** Búsqueda con icono a la izquierda (ClientList, listados). */
export const NEXIA_FORM_CONTROL_SEARCH = cn(
    NEXIA_FORM_CONTROL_INPUT,
    "border-border bg-surface/80 pl-8 pr-3",
);

/** Contenedor búsqueda en toolbars — ancho mínimo para placeholder legible. */
export const NEXIA_FORM_CONTROL_SEARCH_WRAP = cn(
    "relative h-9 w-full min-w-0 flex-1 sm:ml-auto sm:w-72 sm:max-w-xs sm:flex-none",
);

/** Icono lupa — cyan primary (premium listados). */
export const NEXIA_FORM_CONTROL_SEARCH_ICON = cn(
    "pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 shrink-0 text-primary",
);

export const NEXIA_FORM_CONTROL_TEXTAREA_BASE = cn(
    "block w-full rounded-md border border-input bg-background text-foreground transition-colors",
    "placeholder:text-muted-foreground caret-primary resize-y",
    NEXIA_FORM_CONTROL_TEXTAREA_TEXT,
    NEXIA_FORM_CONTROL_FOCUS,
    "disabled:cursor-not-allowed disabled:opacity-50",
);

/** Textarea estándar — reutilizable en formFieldStyles. */
export const NEXIA_FORM_CONTROL_TEXTAREA = cn(
    NEXIA_FORM_CONTROL_TEXTAREA_BASE,
    "min-h-[5rem] px-3 py-2",
);

export const NEXIA_FORM_CONTROL_LABEL = "block text-sm font-medium text-foreground mb-1";

export const NEXIA_FORM_CONTROL_ERROR = "mt-1 text-sm text-destructive";

export const NEXIA_FORM_CONTROL_HELPER = "mt-1 text-xs text-muted-foreground";

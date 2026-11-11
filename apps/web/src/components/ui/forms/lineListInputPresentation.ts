/**
 * lineListInputPresentation.ts — Clases de la lista de líneas editable (pasos, consejos).
 *
 * Contexto: H10, técnica del ejercicio. Cada línea es un campo premium que crece con el
 * texto; a la izquierda, su número o su viñeta.
 * Notas de mantenimiento: el botón de quitar mide 44 px en móvil y 32 px desde `sm`.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import { PLATFORM_FORM_CONTROL } from "./platformFormPresentation";
import { NEXIA_FORM_CONTROL_TEXTAREA_BASE } from "./formControlPresentation";

export const LINE_LIST = "space-y-2";

export const LINE_LIST_ROW = "flex items-start gap-2";

export const LINE_LIST_MARKER = "w-5 shrink-0 pt-2 text-right text-sm tabular-nums";

export const LINE_LIST_MARKER_NUMBER = "font-semibold text-primary";

export const LINE_LIST_MARKER_BULLET = "text-primary/70";

export const LINE_LIST_FIELD = cn(
    NEXIA_FORM_CONTROL_TEXTAREA_BASE,
    PLATFORM_FORM_CONTROL,
    "min-h-9 resize-none px-3 py-2 [field-sizing:content]"
);

export const LINE_LIST_FIELD_INVALID = "border-destructive/60";

export const LINE_LIST_REMOVE = cn(
    "inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground",
    "transition-colors hover:bg-destructive/15 hover:text-destructive",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "disabled:pointer-events-none disabled:opacity-30 sm:size-8 [&_svg]:size-4"
);

export const LINE_LIST_FOOTER = "mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2";

export const LINE_LIST_HELPER = "text-xs text-muted-foreground";

export const LINE_LIST_ERROR = "mt-1.5 text-sm text-destructive";

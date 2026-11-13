/**
 * nexiaSearchPickerPresentation.ts — Clases y copy del selector con búsqueda.
 *
 * Contexto: H10. Panel flotante en escritorio (misma receta que NexiaPremiumModal: negro,
 * borde cyan, sombra profunda) y hoja inferior en móvil (el propio NexiaPremiumModal).
 * Notas de mantenimiento: filas de 48 px en la hoja (táctil) y de 36 px en el panel.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import { NEXIA_FORM_CONTROL_SEARCH, NEXIA_FORM_CONTROL_SEARCH_ICON } from "./formControlPresentation";

export const NEXIA_SEARCH_PICKER_WIDTH_PX = 352;
export const NEXIA_SEARCH_PICKER_GAP_PX = 8;
export const NEXIA_SEARCH_PICKER_EDGE_PX = 16;

export const NEXIA_SEARCH_PICKER_POPOVER = cn(
    "fixed z-[90] flex max-h-[min(24rem,70vh)] flex-col overflow-hidden rounded-xl",
    "border border-primary/30 bg-black p-2",
    "shadow-[0_28px_90px_-18px] shadow-black/90",
    "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
);

export const NEXIA_SEARCH_PICKER_BODY = "flex min-h-0 flex-col gap-2";

export const NEXIA_SEARCH_PICKER_SEARCH_WRAP = "relative shrink-0";

export const NEXIA_SEARCH_PICKER_SEARCH_ICON = NEXIA_FORM_CONTROL_SEARCH_ICON;

export const NEXIA_SEARCH_PICKER_INPUT = cn(NEXIA_FORM_CONTROL_SEARCH, "min-h-touch sm:min-h-0");

export const NEXIA_SEARCH_PICKER_LIST = "min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain";

export const NEXIA_SEARCH_PICKER_LIST_SHEET = "max-h-[50vh]";

const OPTION_BASE = cn(
    "flex w-full items-center justify-between gap-3 rounded-md px-3 text-left text-sm",
    "text-foreground transition-colors"
);

export function nexiaSearchPickerOptionClass({
    active,
    disabled,
    touch,
}: {
    active: boolean;
    disabled: boolean;
    touch: boolean;
}): string {
    return cn(
        OPTION_BASE,
        touch ? "min-h-touch-athlete" : "min-h-9",
        disabled ? "cursor-default text-muted-foreground" : "hover:bg-primary/10",
        active && !disabled && "bg-primary/10"
    );
}

export const NEXIA_SEARCH_PICKER_OPTION_REASON = "shrink-0 text-xs text-muted-foreground";

export const NEXIA_SEARCH_PICKER_EMPTY = "px-3 py-2 text-sm text-muted-foreground";

export const NEXIA_SEARCH_PICKER_HINT = "shrink-0 px-1 text-xs text-muted-foreground";

export const NEXIA_SEARCH_PICKER_COPY = {
    keyboardHint: "↑ ↓ para moverte · Intro para añadir · Esc para cerrar",
} as const;

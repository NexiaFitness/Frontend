/**
 * Estilos reutilizables para formularios de cliente (tokens del diseño).
 * Inputs, selects, textareas, labels, errores.
 * Para botones segmentados usar el componente SegmentButton (@/components/ui/buttons).
 */

import {
    NEXIA_FORM_CONTROL_ERROR,
    NEXIA_FORM_CONTROL_HELPER,
    NEXIA_FORM_CONTROL_INPUT,
    NEXIA_FORM_CONTROL_LABEL,
    NEXIA_FORM_CONTROL_TEXTAREA,
} from "@/components/ui/forms/formControlPresentation";

export const inputClass = NEXIA_FORM_CONTROL_INPUT;

export const selectClass = NEXIA_FORM_CONTROL_INPUT;

export const textareaClass = NEXIA_FORM_CONTROL_TEXTAREA;

export const labelClass = NEXIA_FORM_CONTROL_LABEL;

export const errorClass = NEXIA_FORM_CONTROL_ERROR;

export const helperClass = NEXIA_FORM_CONTROL_HELPER;

export const sectionHeadingClass = "text-lg font-semibold text-foreground";

export const sectionDividerClass = "flex-1 h-0.5 bg-border";

/** Card de sección (fondo surface oscuro) */
export const sectionCardClass = "rounded-lg border border-border bg-surface p-6";

/** Campo de solo lectura / display */
export const displayFieldClass =
    "w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm leading-none text-foreground";

/** Badge "Auto" / calculado */
export const badgeAutoClass = "text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full";

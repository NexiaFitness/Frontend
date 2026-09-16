/**
 * Estilos reutilizables para formularios de cliente (tokens del diseño).
 * Premium canónico: platformFormPresentation (DESIGN_PREMIUM §5.3).
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_FORM_CONTROL_ERROR,
    NEXIA_FORM_CONTROL_HELPER,
    NEXIA_FORM_CONTROL_INPUT,
    NEXIA_FORM_CONTROL_TEXTAREA,
} from "@/components/ui/forms/formControlPresentation";
import {
    PLATFORM_FORM_CONTROL,
    platformFormLabelClass,
} from "@/components/ui/forms/platformFormPresentation";

export const labelClass = platformFormLabelClass("premium");

export const inputClass = cn(NEXIA_FORM_CONTROL_INPUT, PLATFORM_FORM_CONTROL);

export const selectClass = cn(NEXIA_FORM_CONTROL_INPUT, PLATFORM_FORM_CONTROL);

export const textareaClass = cn(NEXIA_FORM_CONTROL_TEXTAREA, PLATFORM_FORM_CONTROL);

export const errorClass = NEXIA_FORM_CONTROL_ERROR;

export const helperClass = NEXIA_FORM_CONTROL_HELPER;

export const sectionHeadingClass = "text-lg font-semibold text-foreground";

export const sectionDividerClass = "flex-1 h-0.5 bg-border";

export const sectionCardClass = "rounded-lg border border-border bg-surface p-6";

export const displayFieldClass =
    "w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground";

export const badgeAutoClass =
    "text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full";

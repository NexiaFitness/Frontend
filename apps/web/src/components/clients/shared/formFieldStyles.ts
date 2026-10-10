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
    PLATFORM_FORM_NESTED_PANEL,
    PLATFORM_FORM_SECTION_TITLE,
    platformFormLabelClass,
} from "@/components/ui/forms/platformFormPresentation";

export const labelClass = platformFormLabelClass("premium");

export const inputClass = cn(NEXIA_FORM_CONTROL_INPUT, PLATFORM_FORM_CONTROL);

export const selectClass = cn(NEXIA_FORM_CONTROL_INPUT, PLATFORM_FORM_CONTROL);

export const textareaClass = cn(NEXIA_FORM_CONTROL_TEXTAREA, PLATFORM_FORM_CONTROL);

export const errorClass = NEXIA_FORM_CONTROL_ERROR;

export const helperClass = NEXIA_FORM_CONTROL_HELPER;

export const sectionHeadingClass = cn(
    PLATFORM_FORM_SECTION_TITLE,
    "text-[11px] normal-case tracking-wide text-primary/85",
);

export const sectionDividerClass = "flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent";

export const sectionCardClass = cn(PLATFORM_FORM_NESTED_PANEL, "space-y-4");

export const displayFieldClass = cn(
    "w-full rounded-md border border-primary/20 bg-black/30 px-3 py-2 text-sm text-foreground backdrop-blur-sm",
);

export const badgeAutoClass =
    "text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full";

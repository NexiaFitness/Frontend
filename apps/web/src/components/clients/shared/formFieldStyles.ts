/**
 * Estilos reutilizables para formularios de cliente (tokens del diseño).
 * Premium canónico: platformFormPresentation (DESIGN_PREMIUM §5.3).
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_FORM_CONTROL,
    platformFormLabelClass,
} from "@/components/ui/forms/platformFormPresentation";

export const labelClass = platformFormLabelClass("premium");

export const inputClass = cn(
    "w-full h-9 rounded-md px-3 py-1.5 text-sm text-foreground transition-colors",
    "caret-primary disabled:cursor-not-allowed disabled:opacity-50",
    PLATFORM_FORM_CONTROL,
);

export const selectClass = inputClass;

export const textareaClass = cn(
    "w-full min-h-[100px] resize-y rounded-md px-3 py-2 text-sm text-foreground transition-colors",
    "caret-primary disabled:cursor-not-allowed disabled:opacity-50",
    PLATFORM_FORM_CONTROL,
);

export const errorClass = "mt-1 text-sm text-destructive";

export const helperClass = "mt-1 text-xs text-muted-foreground";

export const sectionHeadingClass = "text-lg font-semibold text-foreground";

export const sectionDividerClass = "flex-1 h-0.5 bg-border";

export const sectionCardClass = "rounded-lg border border-border bg-surface p-6";

export const displayFieldClass =
    "w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground";

export const badgeAutoClass =
    "text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full";

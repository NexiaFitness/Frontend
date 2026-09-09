/**
 * blockAuthoringPatternsPresentation.ts — Tokens wizard D-PAP paso Patrones.
 */

import { cn } from "@/lib/utils";

import { AUTHORING_STEP_INNER_PANEL_CLASS } from "./phaseAuthoringPresentation";

/** Mensaje latido azul cuando faltan patrones en algún día activo. */
export const AUTHORING_PATTERNS_INCOMPLETE_STATUS_HINT =
    "Asigna al menos un patrón de movimiento a cada día de entrenamiento.";

export const AUTHORING_PATTERN_DAY_LIST_CLASS = "space-y-2.5 md:space-y-3";

const AUTHORING_PATTERN_DAY_CARD_BASE = cn(
    AUTHORING_STEP_INNER_PANEL_CLASS,
    "group relative w-full text-left",
    "cursor-pointer transition-all duration-200",
    "hover:border-primary/35 hover:bg-surface-2/45",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

export function authoringPatternDayCardClass(options: {
    hasPatterns: boolean;
    isEditing: boolean;
}): string {
    return cn(
        AUTHORING_PATTERN_DAY_CARD_BASE,
        options.isEditing &&
            "border-primary/45 bg-primary/[0.06] ring-1 ring-primary/25",
        options.hasPatterns &&
            !options.isEditing &&
            "border-primary/20",
    );
}

export const AUTHORING_PATTERN_DAY_CARD_TITLE_CLASS =
    "text-sm font-semibold tracking-tight text-foreground";

export const AUTHORING_PATTERN_DAY_CARD_EMPTY_CLASS =
    "text-xs leading-relaxed text-muted-foreground/90";

export const AUTHORING_PATTERN_DAY_CARD_EDIT_ICON_WRAP_CLASS =
    "pointer-events-none absolute right-3 top-3";

/**
 * phaseAuthoringPresentation.ts — Tokens premium superficie focal D-PAP (Fase 2).
 *
 * Referencia visual: platformPremiumPresentation, glassSurfacePresentation,
 * clientHeaderPresentation — no design system paralelo.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import {
    NEXIA_SEGMENTED_SHELL,
    NEXIA_SEGMENTED_SCROLL,
    NEXIA_SEGMENTED_TRACK_CONTENT,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_SECTION_LABEL,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_SUBTITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";

export const AUTHORING_SURFACE_CLASS = cn(
    "w-full min-w-0",
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
);

export const AUTHORING_HEADER_CLASS = cn(
    "mb-4 space-y-4 sm:mb-6",
);

export const AUTHORING_TITLE_CLASS = NEXIA_PORTAL_CARD_TITLE;

export const AUTHORING_SUBTITLE_CLASS = NEXIA_PORTAL_GREETING_SUBTITLE;

export const AUTHORING_STEPPER_SHELL_CLASS = NEXIA_SEGMENTED_SHELL;

export const AUTHORING_STEPPER_SCROLL_CLASS = NEXIA_SEGMENTED_SCROLL;

export const AUTHORING_STEPPER_TRACK_CLASS = NEXIA_SEGMENTED_TRACK_CONTENT;

export const authoringStepperItemClass = (
    active: boolean,
    completed: boolean,
): string =>
    cn(
        nexiaSegmentedItemClass(active, "content"),
        completed && !active && "text-foreground/80",
    );

export const AUTHORING_STEP_CARD_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative min-w-0 p-5 sm:p-6 md:p-7",
);

export const AUTHORING_STEP_META_CLASS = PLATFORM_SECTION_LABEL;

export const AUTHORING_FOOTER_INNER_CLASS =
    "mx-auto flex w-full min-w-0 max-w-full flex-col-reverse gap-3 sm:max-w-3xl sm:flex-row sm:items-center sm:justify-between sm:gap-3";

/** Artículo + sustantivo para copy de periodización (concordancia ES). */
export function periodUnitPhrase(unit: "fase" | "bloque"): string {
    return unit === "fase" ? "la fase" : "el bloque";
}

export const AUTHORING_DAY_TOGGLE_TRACK_CLASS =
    "flex flex-wrap justify-center gap-2 sm:gap-3";

export const authoringDayToggleClass = (active: boolean): string =>
    cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:h-12 sm:w-12",
        active
            ? "border-primary bg-primary/15 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary)/0.55)]"
            : "border-border/70 bg-surface-2/50 text-muted-foreground hover:border-primary/35 hover:text-foreground",
    );

export const AUTHORING_PLACEHOLDER_CLASS =
    "rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground";

export const WEEKDAY_LABELS_ES = ["L", "M", "X", "J", "V", "S", "D"] as const;

/** ISO: 1 = Lunes … 7 = Domingo */
export const WEEKDAY_ISO_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;

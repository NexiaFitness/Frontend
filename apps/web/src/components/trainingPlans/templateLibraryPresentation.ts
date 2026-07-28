/**
 * templateLibraryPresentation.ts — Biblioteca, create y detalle de plantillas (premium).
 *
 * Doc: DESIGN_PREMIUM.md (raíz)
 * Patrón: exercisesLibraryPresentation.ts · templateEditorPresentation.ts
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_BADGE_ROW,
    PLATFORM_BODY_MUTED,
    PLATFORM_FIELD_VALUE,
    PLATFORM_PAGE_SHELL,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";

export {
    PLATFORM_BACK_BUTTON as TEMPLATE_LIBRARY_BACK_BUTTON,
    PLATFORM_PAGE_HEADER as TEMPLATE_LIBRARY_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as TEMPLATE_LIBRARY_TITLE_WRAP,
    PLATFORM_LOADING_ROW as TEMPLATE_LIBRARY_LOADING_ROW,
} from "@/components/ui/surface/platformPremiumPresentation";

export const TEMPLATE_LIBRARY_COPY = {
    pageSubtitle: "Programas reutilizables que puedes asignar a varios clientes",
    createSubtitle: "Nombre y objetivo; después armarás el programa por semanas",
    createBack: "Biblioteca",
    detailBack: "Biblioteca",
    sectionBasic: "Información básica",
    sectionLibrary: "Biblioteca",
    sectionVisibility: "Visibilidad",
    libraryHint:
        "Las plantillas usan semanas 1, 2, 3… Al asignar, eliges la fecha de inicio y NEXIA arma el calendario.",
} as const;

export const TEMPLATE_LIBRARY_PAGE = cn(
    PLATFORM_PAGE_SHELL,
    ATHLETE_PAGE_X,
    "relative pb-10 lg:pb-12",
);

export const TEMPLATE_LIBRARY_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const TEMPLATE_LIBRARY_STACK = "relative space-y-5 sm:space-y-6";

export const TEMPLATE_LIBRARY_PRIMARY_CTA = cn(
    ATHLETE_PRIMARY_CTA,
    "w-full min-h-touch sm:w-auto sm:min-h-0 sm:px-5",
);

export const TEMPLATE_LIBRARY_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex flex-wrap items-center gap-2 p-3 sm:p-4",
);

export function templateLibraryFilterChipClass(active: boolean): string {
    return cn(
        "inline-flex h-9 min-h-touch shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors sm:min-h-0",
        active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/80 text-muted-foreground hover:border-input hover:text-foreground",
    );
}

export function templateLibraryFilterCountClass(active: boolean): string {
    return cn("tabular-nums font-normal", active ? "text-primary/60" : "text-muted-foreground/50");
}

export const TEMPLATE_LIBRARY_SEARCH_WRAP = "relative ml-auto h-9 w-full min-w-0 sm:w-56";

export const TEMPLATE_LIBRARY_SEARCH_ICON =
    "pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-primary";

export const TEMPLATE_LIBRARY_SEARCH_INPUT = "h-9 w-full bg-surface/80 pl-8";

export const TEMPLATE_LIBRARY_CARD_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-5",
    "lg:grid-cols-3 lg:gap-6",
);

export const TEMPLATE_LIBRARY_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex h-full flex-col gap-4 p-4 pt-5 sm:p-5",
    "transition-all hover:bg-surface-2/30",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100",
);

export const TEMPLATE_LIBRARY_CARD_TITLE = cn(NEXIA_PORTAL_CARD_TITLE, "line-clamp-2 text-left");

export const TEMPLATE_LIBRARY_CARD_TITLE_BTN = cn(
    TEMPLATE_LIBRARY_CARD_TITLE,
    "min-w-0 flex-1 rounded-sm hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
);

export const TEMPLATE_LIBRARY_CARD_BADGE_ROW = cn(PLATFORM_BADGE_ROW, "mt-2");

export const TEMPLATE_LIBRARY_CARD_META = NEXIA_PORTAL_CARD_DESCRIPTION;

export const TEMPLATE_LIBRARY_CARD_STATS = "space-y-2 text-sm";

export const TEMPLATE_LIBRARY_CARD_STAT_ROW = "flex justify-between text-muted-foreground";

export const TEMPLATE_LIBRARY_CARD_STAT_VALUE = "tabular-nums text-foreground";

export const TEMPLATE_LIBRARY_CARD_PROGRESS = "h-2 w-full overflow-hidden rounded-full bg-muted";

export const TEMPLATE_LIBRARY_CARD_PROGRESS_FILL = "h-full rounded-full bg-primary transition-all duration-300";

export const TEMPLATE_LIBRARY_CARD_ACTIONS = "mt-auto shrink-0 space-y-2 border-t border-border/60 pt-4";

export const TEMPLATE_LIBRARY_CARD_HINT = cn(NEXIA_PORTAL_CARD_DESCRIPTION, "text-xs");

export const TEMPLATE_LIBRARY_CARD_SECONDARY_BTN =
    "w-full border-primary/30 text-primary hover:bg-primary/10";

export const TEMPLATE_LIBRARY_CARD_DUPLICATE_BTN = "w-full text-muted-foreground hover:text-primary";

export const TEMPLATE_LIBRARY_LOADING_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex min-h-[200px] items-center justify-center p-12",
);

export const TEMPLATE_LIBRARY_EMPTY_SHELL = cn(ATHLETE_EMPTY_STATE_CARD, "relative border-dashed");

export const TEMPLATE_LIBRARY_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const TEMPLATE_LIBRARY_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const TEMPLATE_LIBRARY_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const TEMPLATE_LIBRARY_FORM_PAGE = cn(TEMPLATE_LIBRARY_PAGE, PLATFORM_PAGE_WITH_FIXED_FOOTER);

export const TEMPLATE_LIBRARY_FORM_STACK = "relative space-y-5 pb-28 sm:space-y-6 sm:pb-8";

export const TEMPLATE_LIBRARY_FORM_SECTION = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-5 p-4 pt-5 sm:p-6",
);

export const TEMPLATE_LIBRARY_FORM_SECTION_TITLE = ATHLETE_SECTION_LABEL;

export const TEMPLATE_LIBRARY_FORM_FIELD_LABEL = PLATFORM_SECTION_LABEL;

export const TEMPLATE_LIBRARY_FORM_FIELD_ERROR = "mt-1 text-sm text-destructive";

export const TEMPLATE_LIBRARY_FORM_TAG = cn(
    "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary",
);

export const TEMPLATE_LIBRARY_FORM_FOOTER = cn(
    "fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-background/90 p-4 backdrop-blur-md",
    "sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
);

export const TEMPLATE_LIBRARY_FORM_ACTIONS = "mx-auto flex max-w-3xl flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-end";

export const TEMPLATE_LIBRARY_DETAIL_PAGE = TEMPLATE_LIBRARY_PAGE;

export const TEMPLATE_LIBRARY_DETAIL_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 p-4 pt-5 sm:p-6",
);

export const TEMPLATE_LIBRARY_DETAIL_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const TEMPLATE_LIBRARY_DETAIL_DESCRIPTION = PLATFORM_BODY_MUTED;

export const TEMPLATE_LIBRARY_DETAIL_HINT = cn(
    "border-l-2 border-primary/30 pl-3",
    NEXIA_PORTAL_CARD_DESCRIPTION,
);

export const TEMPLATE_LIBRARY_DETAIL_META_GRID = cn(
    "grid grid-cols-1 gap-4 text-sm sm:grid-cols-2",
);

export const TEMPLATE_LIBRARY_DETAIL_META_LABEL = PLATFORM_SECTION_LABEL;

export const TEMPLATE_LIBRARY_DETAIL_META_VALUE = PLATFORM_FIELD_VALUE;

export const TEMPLATE_LIBRARY_DETAIL_ACTIONS = "flex flex-wrap gap-2 sm:justify-end";

export const TEMPLATE_LIBRARY_LEVEL_BADGE: Record<string, string> = {
    beginner: "text-success",
    intermediate: "text-warning",
    advanced: "text-primary",
};

export const TEMPLATE_LIBRARY_SECTION_DESC = cn(NEXIA_PORTAL_PAGE_EYEBROW, "mb-4 block");

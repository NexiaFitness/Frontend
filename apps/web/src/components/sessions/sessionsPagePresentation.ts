/**
 * sessionsPagePresentation.ts — Listado unificado sesiones + plantillas sesión (/dashboard/sessions).
 *
 * Paridad con TrainingPlansPage · templateLibraryPresentation (toolbar glass, filtros, empty).
 * Doc: DESIGN_PREMIUM.md (raíz)
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_LOADING_ROW,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    templateLibraryFilterChipClass,
    templateLibraryFilterCountClass,
    TRAINING_PLANS_TABS_GLOW,
    TRAINING_PLANS_TABS_PAGE,
    TRAINING_PLANS_TABS_PRIMARY_CTA,
    TRAINING_PLANS_TABS_STACK,
    TRAINING_PLANS_TABS_TOOLBAR,
    TRAINING_PLANS_TABS_SEARCH_ICON,
    TRAINING_PLANS_TABS_SEARCH_INPUT,
    TRAINING_PLANS_TABS_SEARCH_WRAP,
} from "@/components/trainingPlans/templateLibraryPresentation";
import {
    resolveSessionCardStatusTone,
    SESSION_CARD_ICON_BTN_EDIT,
} from "@/components/trainingSessions/sessionCardPresentation";

export const SESSIONS_PAGE = TRAINING_PLANS_TABS_PAGE;

export const SESSIONS_PAGE_GLOW = TRAINING_PLANS_TABS_GLOW;

export const SESSIONS_PAGE_STACK = TRAINING_PLANS_TABS_STACK;

export const SESSIONS_PAGE_HEADER = PLATFORM_PAGE_HEADER;

export const SESSIONS_PAGE_TITLE_WRAP = PLATFORM_PAGE_TITLE_WRAP;

export const SESSIONS_PAGE_PRIMARY_CTA = TRAINING_PLANS_TABS_PRIMARY_CTA;

export const SESSIONS_PAGE_TOOLBAR = TRAINING_PLANS_TABS_TOOLBAR;

export const sessionsPageFilterChipClass = templateLibraryFilterChipClass;

export const sessionsPageFilterCountClass = templateLibraryFilterCountClass;

export const SESSIONS_PAGE_SEARCH_WRAP = TRAINING_PLANS_TABS_SEARCH_WRAP;

export const SESSIONS_PAGE_SEARCH_ICON = TRAINING_PLANS_TABS_SEARCH_ICON;

export const SESSIONS_PAGE_SEARCH_INPUT = TRAINING_PLANS_TABS_SEARCH_INPUT;

export const SESSIONS_PAGE_LIST = "space-y-2 sm:space-y-3";

export const SESSIONS_PAGE_LIST_ITEM = cn(
    NEXIA_GLASS_CARD,
    "relative flex w-full min-w-0 cursor-pointer flex-col gap-3 p-4 pt-5 text-left sm:flex-row sm:items-center sm:gap-4 sm:p-4 sm:pt-5",
    "transition-all duration-150",
    "hover:border-primary/30 hover:bg-surface-2/25",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const SESSIONS_PAGE_LIST_ITEM_MAIN = "min-w-0 flex-1 space-y-2";

export const SESSIONS_PAGE_LIST_ITEM_TITLE = cn(
    NEXIA_PORTAL_CARD_TITLE,
    "truncate text-sm font-semibold leading-snug sm:text-base",
);

export const SESSIONS_PAGE_LIST_ITEM_CLIENT_ROW = "flex min-w-0 items-center gap-2";

export const SESSIONS_PAGE_LIST_ITEM_CLIENT_NAME = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "truncate text-xs sm:text-sm",
);

export const SESSIONS_PAGE_LIST_ITEM_ASIDE = cn(
    "flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end",
);

export const SESSIONS_PAGE_LIST_ITEM_DATE = cn(
    "shrink-0 text-xs tabular-nums text-muted-foreground sm:text-right",
);

export const SESSIONS_PAGE_LIST_ITEM_META = cn(
    "inline-flex shrink-0 items-center rounded-md border border-border/55 bg-background/40",
    "px-2.5 py-1 text-xs tabular-nums text-muted-foreground backdrop-blur-sm",
);

export const SESSIONS_PAGE_META_BADGE = cn(
    "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 backdrop-blur-sm",
    "text-[10px] font-semibold uppercase tracking-[0.06em]",
);

export const SESSIONS_PAGE_TYPE_BADGE: Record<string, string> = {
    strength: cn(SESSIONS_PAGE_META_BADGE, "border-primary/30 bg-primary/12 text-primary"),
    cardio: cn(SESSIONS_PAGE_META_BADGE, "border-warning/30 bg-warning/10 text-warning"),
    technique: cn(SESSIONS_PAGE_META_BADGE, "border-primary/25 bg-primary/8 text-primary/90"),
    assessment: cn(SESSIONS_PAGE_META_BADGE, "border-border/60 bg-muted/30 text-muted-foreground"),
};

export const SESSIONS_PAGE_TYPE_LABEL: Record<string, string> = {
    strength: "Fuerza",
    cardio: "Cardio",
    technique: "Técnica",
    assessment: "Evaluación",
};

export const SESSIONS_PAGE_STATUS_LABEL: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    modified: "Modificada",
    in_progress: "En curso",
    skipped: "Saltada",
    archived: "Archivada",
};

export function sessionsPageStatusBadgeClass(status: string): string {
    const tone = resolveSessionCardStatusTone(status);
    return cn(SESSIONS_PAGE_META_BADGE, "normal-case tracking-normal", tone.badge);
}

export function sessionsPageStatusLabel(status: string): string {
    const tone = resolveSessionCardStatusTone(status);
    return SESSIONS_PAGE_STATUS_LABEL[status] ?? tone.label ?? status;
}

export const SESSIONS_PAGE_EDIT_BTN = SESSION_CARD_ICON_BTN_EDIT;

export const SESSIONS_PAGE_EMPTY_SHELL = cn(ATHLETE_EMPTY_STATE_CARD, "relative border-dashed py-12 sm:py-16");

export const SESSIONS_PAGE_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const SESSIONS_PAGE_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const SESSIONS_PAGE_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const SESSIONS_PAGE_EMPTY_ACTION = cn(ATHLETE_PRIMARY_CTA, "mt-5 w-full sm:w-auto");

export const SESSIONS_PAGE_LOADING = PLATFORM_LOADING_ROW;

export const SESSIONS_PAGE_TEMPLATE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex flex-col gap-3 p-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:p-5",
    "transition-all hover:bg-surface-2/25",
);

export const SESSIONS_PAGE_TEMPLATE_TITLE = cn(
    NEXIA_PORTAL_CARD_TITLE,
    "truncate text-sm font-semibold sm:text-base",
);

export const SESSIONS_PAGE_TEMPLATE_META = NEXIA_PORTAL_CARD_DESCRIPTION;

export const SESSIONS_PAGE_COPY = {
    sessionsSubtitle: (total: number) => `${total} sesiones programadas`,
    templatesSubtitle: (total: number) => `${total} plantillas disponibles`,
    searchSessions: "Buscar sesión o cliente...",
    searchTemplates: "Buscar plantilla por nombre o descripción...",
} as const;

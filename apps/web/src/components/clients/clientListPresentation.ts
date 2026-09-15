/**
 * clientListPresentation.ts — Lista clientes (/dashboard/clients) premium.
 *
 * Shell glass alineado con planificación y dashboard entrenador.
 * Cards del roster: estilo KPI/list (sin NexiaGlassAccentRim — evita repetición cyan).
 *
 * Doc: DESIGN_PREMIUM.md · templateLibraryPresentation.ts · trainerDashboardPresentation.ts
 */

import type { ClientStatus } from "@nexia/shared/types/client";
import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import {
    TRAINER_DASHBOARD_ACTIVITY_ICON,
    TRAINER_DASHBOARD_KPI_CARD,
    TRAINER_DASHBOARD_WIDGET,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";
import {
    TEMPLATE_LIBRARY_GLOW,
    TEMPLATE_LIBRARY_LOADING_ROW,
    TEMPLATE_LIBRARY_SEARCH_ICON,
    TEMPLATE_LIBRARY_SEARCH_INPUT,
    TEMPLATE_LIBRARY_SEARCH_WRAP,
    TEMPLATE_LIBRARY_STACK,
    TEMPLATE_LIBRARY_TOOLBAR,
    templateLibraryFilterChipClass,
    templateLibraryFilterCountClass,
} from "@/components/trainingPlans/templateLibraryPresentation";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";

export const CLIENT_LIST_COPY = {
    eyebrow: "Cartera",
    title: "Clientes",
    totalSuffix: "en total",
    newClient: "Nuevo cliente",
    searchPlaceholder: "Buscar por nombre o email…",
    searchAria: "Buscar cliente",
    filterGroup: "Filtrar por estado",
    viewGrid: "Vista grid",
    viewList: "Vista lista",
    activityTitle: "Actividad reciente",
    activityEmpty: "No hay actividad reciente",
    emptyTitle: "Aún no tienes clientes registrados",
    emptyDetail: "Añade tu primer cliente para empezar a planificar y dar seguimiento.",
    emptyCta: "Añadir tu primer cliente",
    adherenceLabel: "Adherencia",
    loadError: "Error al cargar clientes",
} as const;

export const CLIENT_LIST_PAGE = cn(PLATFORM_PAGE_SHELL, "relative pb-10 md:pb-12 lg:pb-12");

export const CLIENT_LIST_GLOW = TEMPLATE_LIBRARY_GLOW;

export const CLIENT_LIST_STACK = TEMPLATE_LIBRARY_STACK;

export const CLIENT_LIST_HEADER = cn(
    "flex flex-col gap-3",
    "sm:flex-row sm:items-start sm:justify-between sm:gap-4",
);

export const CLIENT_LIST_TITLE_WRAP = "min-w-0 space-y-1";

export const CLIENT_LIST_EYEBROW = NEXIA_PORTAL_PAGE_EYEBROW;

export const CLIENT_LIST_TITLE = NEXIA_PORTAL_GREETING_H1;

export const CLIENT_LIST_SUBTITLE = cn(NEXIA_PORTAL_CARD_DESCRIPTION, "tabular-nums");

export const CLIENT_LIST_PRIMARY_CTA = cn(
    ATHLETE_PRIMARY_CTA,
    "w-full min-h-touch sm:w-auto sm:min-h-0 sm:px-5",
);

/** Barra glass — chips planificación (sin rim en tokens; rim opcional en JSX, una vez). */
export const CLIENT_LIST_TOOLBAR = TEMPLATE_LIBRARY_TOOLBAR;

export const CLIENT_LIST_TOOLBAR_ROW = "flex flex-wrap items-center gap-2";

export const CLIENT_LIST_FILTER_CHIP = templateLibraryFilterChipClass;

export const CLIENT_LIST_FILTER_COUNT = templateLibraryFilterCountClass;

export const CLIENT_LIST_SEARCH_WRAP = TEMPLATE_LIBRARY_SEARCH_WRAP;

export const CLIENT_LIST_SEARCH_ICON = TEMPLATE_LIBRARY_SEARCH_ICON;

export const CLIENT_LIST_SEARCH_INPUT = TEMPLATE_LIBRARY_SEARCH_INPUT;

export const CLIENT_LIST_VIEW_TOGGLE = "flex shrink-0 rounded-md border border-border/80 bg-background/40";

export function clientListViewToggleBtnClass(active: boolean): string {
    return cn(
        "inline-flex h-9 w-9 items-center justify-center transition-colors",
        active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-surface hover:text-foreground",
    );
}

export const CLIENT_LIST_CONTENT_LAYOUT = cn(
    "flex flex-col gap-4",
    "md:flex-row md:items-start md:gap-5 lg:gap-6",
);

export const CLIENT_LIST_MAIN = "min-w-0 flex-1";

export const CLIENT_LIST_GRID = cn(
    "grid grid-cols-1 gap-3",
    "sm:grid-cols-2 sm:gap-4",
    "xl:grid-cols-3 xl:gap-5",
);

/**
 * Card cliente — glass KPI (dashboard), sin línea cyan.
 * Distinto del widget con rim pero mismo lenguaje premium.
 */
export const CLIENT_LIST_CLIENT_CARD = cn(
    TRAINER_DASHBOARD_KPI_CARD,
    "flex cursor-pointer flex-col text-left",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const CLIENT_LIST_INVITATION_CARD = cn(
    CLIENT_LIST_CLIENT_CARD,
    "border-dashed border-primary/25",
);

export const CLIENT_LIST_CARD_NAME = cn(NEXIA_PORTAL_CARD_TITLE, "truncate text-sm sm:text-base");

export const CLIENT_LIST_CARD_EMAIL = cn(NEXIA_PORTAL_CARD_DESCRIPTION, "truncate text-xs");

export const CLIENT_LIST_CARD_BADGE_ROW = "mb-3 flex flex-wrap items-center gap-1.5 sm:gap-2";

export const CLIENT_LIST_ADHERENCE_LABEL = cn(
    ATHLETE_SECTION_LABEL,
    "normal-case tracking-normal text-muted-foreground/80",
);

export const CLIENT_LIST_TABLE_SHELL = cn(TRAINER_DASHBOARD_WIDGET, "overflow-x-auto p-0");

export const CLIENT_LIST_TABLE = "w-full min-w-[560px] text-sm";

export const CLIENT_LIST_TABLE_HEAD =
    "border-b border-border/70 bg-surface/40 text-left text-muted-foreground backdrop-blur-sm";

export const CLIENT_LIST_TABLE_HEAD_CELL = "px-3 py-2.5 font-medium sm:px-4 sm:py-3";

export const CLIENT_LIST_TABLE_ROW = cn(
    "cursor-pointer border-b border-border/60 bg-background/20 transition-colors",
    "hover:bg-primary/5 active:bg-primary/8",
);

export const CLIENT_LIST_TABLE_CELL = "px-3 py-2.5 sm:px-4 sm:py-3";

export const CLIENT_LIST_ASIDE = cn("w-full shrink-0", "md:w-56 lg:w-72");

export const CLIENT_LIST_ACTIVITY_PANEL = TRAINER_DASHBOARD_WIDGET;

export const CLIENT_LIST_ACTIVITY_TITLE = ATHLETE_SECTION_LABEL;

export const CLIENT_LIST_ACTIVITY_ITEM = "flex gap-2 sm:gap-3";

export const CLIENT_LIST_ACTIVITY_ICON = TRAINER_DASHBOARD_ACTIVITY_ICON;

export const CLIENT_LIST_ACTIVITY_TEXT = "line-clamp-2 text-xs text-foreground sm:text-sm";

export const CLIENT_LIST_ACTIVITY_TIME = "mt-0.5 text-[11px] text-muted-foreground sm:text-xs";

export const CLIENT_LIST_EMPTY = cn(
    ATHLETE_EMPTY_STATE_CARD,
    "relative border-dashed px-4 py-12 sm:py-16",
);

export const CLIENT_LIST_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const CLIENT_LIST_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const CLIENT_LIST_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const CLIENT_LIST_LOADING = TEMPLATE_LIBRARY_LOADING_ROW;

export function clientListStatusBadgeClass(status: ClientStatus | null | undefined): string {
    if (!status || status === "active") return "bg-success/10 text-success";
    if (status === "paused") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
}

export function clientListFatigueBadgeClass(fatigue: string | null): string {
    if (!fatigue) return "bg-muted text-muted-foreground";
    const f = fatigue.toLowerCase();
    if (f.includes("perfect")) return "bg-success/10 text-success";
    if (f.includes("slightly") || f.includes("very")) return "bg-warning/10 text-warning";
    if (f.includes("exhausted")) return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
}

export const CLIENT_LIST_BADGE_BASE =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium sm:px-2.5 sm:text-xs";

export const CLIENT_LIST_ADHERENCE_PERCENT = cn(
    "whitespace-nowrap text-xs font-medium tabular-nums sm:text-sm",
);

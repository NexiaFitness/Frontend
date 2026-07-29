/**
 * trainerDashboardPresentation.ts — Dashboard entrenador (/dashboard) premium.
 *
 * Reutiliza techo atleta (NEXIA_PORTAL_*, ATHLETE_*, glass). Mobile-first + desktop.
 * Doc: DESIGN_PREMIUM.md (raíz)
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_PAGE_SHELL,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";

export const TRAINER_DASHBOARD_COPY = {
    alertsTitle: "Requiere atención",
    todayTitle: "Hoy",
    clientsTitle: "Mis clientes",
    clientsHint: "Barra = adherencia al plan · Cara = satisfacción post-sesión",
    activityTitle: "Actividad reciente",
    billingTitle: "Facturación",
    viewAll: "Ver todas",
    viewAllClients: "Ver todos",
    viewSchedule: "Ver agenda completa",
    viewBilling: "Ver facturación",
    newAppointment: "Nueva cita",
    noAlerts: "No hay alertas en este momento",
    noSessionsToday: "No tienes sesiones programadas hoy.",
    noClients: "No tienes clientes aún",
    noActivity: "Sin actividad de clientes esta semana",
    statsError: "No se pudieron cargar las estadísticas. Intenta recargar la página.",
} as const;

export const TRAINER_DASHBOARD_PAGE = cn(
    PLATFORM_PAGE_SHELL,
    ATHLETE_PAGE_X,
    "relative mx-auto max-w-[1400px] pb-10 lg:pb-12",
);

export const TRAINER_DASHBOARD_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.14),transparent_72%)]";

export const TRAINER_DASHBOARD_STACK = "relative space-y-5 sm:space-y-6 lg:space-y-8";

export const TRAINER_DASHBOARD_GREETING_WRAP = "space-y-4";

export const TRAINER_DASHBOARD_KPI_GRID = cn(
    "grid grid-cols-2 gap-3",
    "sm:gap-4",
    "lg:grid-cols-4 lg:gap-5",
);

export const TRAINER_DASHBOARD_LAYOUT = "flex flex-col gap-5 lg:flex-row lg:gap-8";

export const TRAINER_DASHBOARD_MAIN = "flex min-w-0 flex-1 flex-col gap-5 lg:w-[68%] lg:gap-8";

export const TRAINER_DASHBOARD_ASIDE = "flex min-w-0 flex-col gap-5 lg:w-[32%] lg:gap-8";

export const TRAINER_DASHBOARD_WIDGET = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden p-4 pt-5 sm:p-5",
);

export const TRAINER_DASHBOARD_WIDGET_HEADER = "mb-4 flex items-center justify-between gap-3";

export const TRAINER_DASHBOARD_WIDGET_TITLE_ROW = "flex min-w-0 items-center gap-2";

export const TRAINER_DASHBOARD_WIDGET_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const TRAINER_DASHBOARD_WIDGET_EYEBROW = cn(NEXIA_PORTAL_PAGE_EYEBROW, "mb-3 block");

export const TRAINER_DASHBOARD_WIDGET_HINT = cn(
    PLATFORM_SECTION_LABEL,
    "mb-4 block normal-case tracking-normal text-muted-foreground/70",
);

export const TRAINER_DASHBOARD_COUNT_BADGE = cn(
    "inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-primary/10",
    "px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary",
);

export const TRAINER_DASHBOARD_ALERT_COUNT_BADGE = cn(
    "inline-flex shrink-0 items-center rounded-full border border-destructive/25 bg-destructive/10",
    "px-2.5 py-0.5 text-xs font-semibold tabular-nums text-destructive",
);

export const TRAINER_DASHBOARD_KPI_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative p-4 pt-5 transition-all duration-150",
    "hover:bg-surface-2/30 motion-safe:hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
);

export const TRAINER_DASHBOARD_KPI_LABEL = ATHLETE_SECTION_LABEL;

export const TRAINER_DASHBOARD_KPI_VALUE = "mt-1 text-2xl font-bold tabular-nums text-foreground sm:text-3xl";

export const TRAINER_DASHBOARD_KPI_DESCRIPTION = NEXIA_PORTAL_CARD_DESCRIPTION;

export const TRAINER_DASHBOARD_KPI_ICON_WRAP = "shrink-0 rounded-lg border border-border/60 bg-background/40 p-2.5 backdrop-blur-sm";

export const TRAINER_DASHBOARD_KPI_TREND_UP = "text-success";

export const TRAINER_DASHBOARD_KPI_TREND_DOWN = "text-destructive";

export const TRAINER_DASHBOARD_KPI_TREND_NEUTRAL = "text-muted-foreground";

export const TRAINER_DASHBOARD_LIST = "space-y-2 sm:space-y-3";

export const TRAINER_DASHBOARD_LIST_ITEM = cn(
    "flex w-full min-h-touch items-center gap-3 rounded-xl border border-border/70 bg-background/30 p-3 text-left",
    "backdrop-blur-sm transition-colors",
    "hover:border-primary/25 hover:bg-primary/5",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100",
    "sm:min-h-0 sm:p-4",
);

export const TRAINER_DASHBOARD_LIST_ITEM_ALERT = cn(
    TRAINER_DASHBOARD_LIST_ITEM,
    "border-l-[3px] border-l-destructive pl-3 sm:pl-4",
);

export const TRAINER_DASHBOARD_LIST_ITEM_TIME = "w-12 shrink-0 font-mono text-sm tabular-nums text-muted-foreground";

export const TRAINER_DASHBOARD_LIST_ITEM_NAME = "truncate text-sm font-medium text-foreground";

export const TRAINER_DASHBOARD_LIST_ITEM_META = "truncate text-xs text-muted-foreground";

export const TRAINER_DASHBOARD_LINK = cn(
    "inline-flex min-h-touch items-center gap-1 text-sm font-medium text-primary",
    "transition-colors hover:text-primary/80 sm:min-h-0",
);

export const TRAINER_DASHBOARD_PRIMARY_CTA = cn(
    ATHLETE_PRIMARY_CTA,
    "mt-4 w-full sm:w-auto sm:min-h-0",
);

export const TRAINER_DASHBOARD_EMPTY = cn(
    TRAINER_DASHBOARD_WIDGET,
    "py-8 text-center sm:py-10",
);

export const TRAINER_DASHBOARD_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const TRAINER_DASHBOARD_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const TRAINER_DASHBOARD_LOADING_BLOCK = "h-32 animate-pulse rounded-xl bg-muted/30";

export const TRAINER_DASHBOARD_ERROR = cn(
    TRAINER_DASHBOARD_WIDGET,
    "border-destructive/30 bg-destructive/5 text-center",
);

export const TRAINER_DASHBOARD_ERROR_TEXT = "text-sm text-destructive";

export const TRAINER_DASHBOARD_BANNER = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 border-warning/25 bg-warning/8 p-4 sm:flex-row sm:items-center sm:justify-between",
);

export const TRAINER_DASHBOARD_BANNER_TEXT = "text-sm text-warning";

export const TRAINER_DASHBOARD_BANNER_SUCCESS = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 border-success/25 bg-success/8 p-4 sm:flex-row sm:items-center sm:justify-between",
);

export const TRAINER_DASHBOARD_BANNER_SUCCESS_TEXT = "text-sm text-success";

export const TRAINER_DASHBOARD_BANNER_ACTIONS = "flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end";

export const TRAINER_DASHBOARD_ACTIVITY_ICON = cn(
    "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground",
);

export const TRAINER_DASHBOARD_SEVERITY_BADGE: Record<string, string> = {
    critical: "rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive",
    high: "rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold text-warning",
    medium: "rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold text-warning",
    low: "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary",
    default: "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground",
};

export const TRAINER_DASHBOARD_SESSION_STATUS_BADGE: Record<string, string> = {
    scheduled: "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary",
    confirmed: "rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success",
    completed: "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground",
    cancelled: "rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive",
};

export const TRAINER_DASHBOARD_TYPE_CHIP =
    "inline-flex rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground";

export {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
};

export const TRAINER_DASHBOARD_KPI_COLOR: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-primary",
};

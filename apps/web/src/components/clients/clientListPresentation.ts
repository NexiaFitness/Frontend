/**
 * clientListPresentation.ts — Lista clientes (/dashboard/clients) premium.
 *
 * Patrón filas glass mobile-first (techo atleta). Sin grid legacy.
 * Doc: DESIGN_PREMIUM.md (raíz)
 */

import { cn } from "@/lib/utils";
import type { ClientProgressTrend, ClientStatus } from "@nexia/shared/types/client";
import {
    ATHLETE_PRIMARY_CTA,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { ATHLETE_SESSION_META_BADGE } from "@/components/athlete/sessions/athleteSessionsPresentation";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_LOADING_ROW,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_SHELL,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    TRAINER_DASHBOARD_ACTIVITY_ICON,
    TRAINER_DASHBOARD_LIST,
    TRAINER_DASHBOARD_LIST_ITEM_META,
    TRAINER_DASHBOARD_WIDGET,
    TRAINER_DASHBOARD_WIDGET_EMPTY_INLINE,
    TRAINER_DASHBOARD_WIDGET_HEADER,
    TRAINER_DASHBOARD_WIDGET_TITLE,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

export {
    PLATFORM_PAGE_HEADER as CLIENT_LIST_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as CLIENT_LIST_TITLE_WRAP,
    PLATFORM_LOADING_ROW as CLIENT_LIST_LOADING_ROW,
};

export const CLIENT_LIST_COPY = {
    pageTitle: "Clientes",
    pageSubtitle: (total: number) => `${total} en tu roster`,
    searchPlaceholder: "Buscar por nombre o email…",
    filterAll: "Todos",
    filterActive: "Activos",
    filterPaused: "Pausados",
    addClient: "Nuevo cliente",
    addFirstClient: "Añadir tu primer cliente",
    emptyTitle: "Aún no tienes clientes registrados",
    emptyBody: "Añade tu primer cliente para empezar a planificar y dar seguimiento.",
    activityTitle: "Actividad reciente",
    noActivity: "Sin actividad reciente",
    invitationPending: "Invitación pendiente",
    adherenceLabel: "Adherencia",
    loadError: "Error al cargar clientes",
} as const;

export const CLIENT_LIST_PAGE = cn(PLATFORM_PAGE_SHELL, "relative pb-10 lg:pb-12");

export const CLIENT_LIST_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const CLIENT_LIST_STACK = "relative space-y-5 sm:space-y-6";

export const CLIENT_LIST_PRIMARY_CTA = cn(
    ATHLETE_PRIMARY_CTA,
    "w-full min-h-touch sm:w-auto sm:min-h-0 sm:px-5",
);

export const CLIENT_LIST_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex flex-wrap items-center gap-2 p-3 sm:p-4",
);

export function clientListFilterChipClass(active: boolean): string {
    return cn(
        "inline-flex h-9 min-h-touch shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors sm:min-h-0",
        active
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/80 text-muted-foreground hover:border-input hover:text-foreground",
    );
}

export function clientListFilterCountClass(active: boolean): string {
    return cn("tabular-nums font-normal", active ? "text-primary/60" : "text-muted-foreground/50");
}

export const CLIENT_LIST_LAYOUT = "flex flex-col gap-5 lg:flex-row lg:gap-8";

export const CLIENT_LIST_MAIN = "min-w-0 flex-1";

export const CLIENT_LIST_ROWS = cn(TRAINER_DASHBOARD_LIST, "space-y-2.5 sm:space-y-3");

/** Fila cliente — glass atleta, touch 48px móvil. overflow-visible para tooltips de métricas. */
export const CLIENT_LIST_ROW = cn(
    "relative flex w-full min-h-touch-athlete gap-3 overflow-visible rounded-xl border border-border/80",
    "bg-card/40 p-4 text-left backdrop-blur-md",
    "shadow-[0_12px_40px_-16px] shadow-black/40",
    "transition-all duration-150",
    "hover:border-primary/20 hover:bg-primary/[0.03]",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100",
    "sm:min-h-0 sm:items-center sm:gap-4",
);

export const CLIENT_LIST_ROW_INVITATION = cn(
    CLIENT_LIST_ROW,
    "relative border-dashed border-warning/35 bg-warning/[0.04]",
);

export const CLIENT_LIST_INVITATION_DISMISS = cn(
    "absolute right-2 top-2 z-[1]",
    "inline-flex size-7 items-center justify-center rounded-md",
    "text-muted-foreground/45 transition-colors",
    "hover:bg-background/35 hover:text-muted-foreground/80",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-40",
);

export const CLIENT_LIST_INVITATION_RESEND = "shrink-0 self-center sm:self-auto";

export const CLIENT_LIST_ROW_AVATAR = "relative shrink-0";

export const CLIENT_LIST_ROW_BODY = "min-w-0 flex-1 space-y-2 sm:space-y-1.5";

export const CLIENT_LIST_ROW_HEAD = "flex items-start justify-between gap-2 sm:items-center";

export const CLIENT_LIST_ROW_NAME = "truncate text-sm font-medium text-foreground sm:text-base";

export const CLIENT_LIST_ROW_EMAIL = "truncate text-xs text-muted-foreground";

export const CLIENT_LIST_ROW_BADGE_ROW = "flex flex-wrap items-center gap-1.5";

/** Bloque métricas: adherencia (barra + tendencia) y satisfacción (cara) separados. */
export const CLIENT_LIST_ROW_METRICS = cn(
    "flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5",
);

export const CLIENT_LIST_ROW_ADHERENCE_METRIC = cn(
    "flex min-w-0 flex-col gap-1 sm:min-w-[6.5rem] lg:min-w-[7.5rem]",
);

export const CLIENT_LIST_ROW_SATISFACTION_METRIC = cn(
    "flex shrink-0 flex-col items-center gap-1",
);

export const CLIENT_LIST_ROW_ADHERENCE = "flex min-w-0 items-center gap-1.5 pt-0.5";

export const CLIENT_LIST_ROW_ADHERENCE_VALUE = "shrink-0 text-xs tabular-nums text-muted-foreground";

export const CLIENT_LIST_ROW_ACTIONS = "mt-2 sm:mt-0 sm:shrink-0";

export const CLIENT_LIST_ROW_CHEVRON =
    "hidden size-4 shrink-0 text-muted-foreground/60 sm:block";

export const CLIENT_LIST_META_BADGE = ATHLETE_SESSION_META_BADGE;

export const CLIENT_LIST_STATUS_BADGE = {
    active: cn(CLIENT_LIST_META_BADGE, "border-success/30 bg-success/10 text-success shadow-success/10"),
    paused: cn(CLIENT_LIST_META_BADGE, "border-warning/30 bg-warning/10 text-warning shadow-warning/10"),
    inactive: cn(
        CLIENT_LIST_META_BADGE,
        "border-destructive/30 bg-destructive/10 text-destructive",
    ),
    unknown: cn(CLIENT_LIST_META_BADGE, "border-border/55 bg-background/45 text-muted-foreground"),
} as const;

export const CLIENT_LIST_FATIGUE_BADGE = {
    rested: cn(CLIENT_LIST_META_BADGE, "border-success/30 bg-success/10 text-success"),
    tired: cn(CLIENT_LIST_META_BADGE, "border-warning/30 bg-warning/10 text-warning"),
    exhausted: cn(CLIENT_LIST_META_BADGE, "border-destructive/30 bg-destructive/10 text-destructive"),
    unknown: cn(CLIENT_LIST_META_BADGE, "border-border/55 bg-background/45 text-muted-foreground"),
} as const;

export const CLIENT_LIST_INVITATION_BADGE = cn(
    CLIENT_LIST_META_BADGE,
    "border-warning/35 bg-warning/10 text-warning shadow-warning/10",
);

export const CLIENT_LIST_INVITATION_EXPIRED_BADGE = cn(
    CLIENT_LIST_META_BADGE,
    "border-border/55 bg-background/45 text-muted-foreground",
);

export const CLIENT_LIST_DESKTOP_METRICS = cn(
    "hidden shrink-0 items-center gap-4 lg:flex",
    "text-xs text-muted-foreground",
);

export const CLIENT_LIST_DESKTOP_METRIC = "flex min-w-[5.5rem] flex-col gap-1";

export const CLIENT_LIST_DESKTOP_METRIC_LABEL = cn(
    PLATFORM_SECTION_LABEL,
    "hidden normal-case tracking-normal text-[10px] text-muted-foreground/70 lg:block",
);

export const CLIENT_LIST_ACTIVITY_ASIDE = cn(
    TRAINER_DASHBOARD_WIDGET,
    "hidden lg:block lg:w-72 lg:shrink-0",
);

export const CLIENT_LIST_ACTIVITY_LIST = TRAINER_DASHBOARD_LIST;

export const CLIENT_LIST_ACTIVITY_ITEM = cn(
    "flex w-full gap-3 rounded-xl border border-transparent p-2 text-left transition-colors",
    "hover:border-border/60 hover:bg-background/30",
);

export const CLIENT_LIST_ACTIVITY_ICON = TRAINER_DASHBOARD_ACTIVITY_ICON;

export const CLIENT_LIST_ACTIVITY_META = TRAINER_DASHBOARD_LIST_ITEM_META;

export const CLIENT_LIST_ACTIVITY_HEADER = TRAINER_DASHBOARD_WIDGET_HEADER;

export const CLIENT_LIST_ACTIVITY_TITLE = TRAINER_DASHBOARD_WIDGET_TITLE;

export const CLIENT_LIST_ACTIVITY_EMPTY = TRAINER_DASHBOARD_WIDGET_EMPTY_INLINE;

export const CLIENT_LIST_EMPTY_SHELL = cn(ATHLETE_EMPTY_STATE_CARD, "relative border-dashed");

export const CLIENT_LIST_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const CLIENT_LIST_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const CLIENT_LIST_EMPTY_BODY = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const CLIENT_LIST_SECTION_EYEBROW = cn(NEXIA_PORTAL_PAGE_EYEBROW, "mb-3 block lg:hidden");

export function getClientStatusLabel(status: ClientStatus | null | undefined): string {
    if (!status) return "—";
    if (status === "active") return "Activo";
    if (status === "paused") return "Pausado";
    if (status === "inactive") return "Baja";
    return "—";
}

export function getClientStatusBadgeClass(status: ClientStatus | null | undefined): string {
    if (!status || status === "active") return CLIENT_LIST_STATUS_BADGE.active;
    if (status === "paused") return CLIENT_LIST_STATUS_BADGE.paused;
    if (status === "inactive") return CLIENT_LIST_STATUS_BADGE.inactive;
    return CLIENT_LIST_STATUS_BADGE.unknown;
}

export type ClientFatigueVariant = keyof typeof CLIENT_LIST_FATIGUE_BADGE;

export function resolveClientFatigueVariant(fatigue: string | null): ClientFatigueVariant {
    if (!fatigue) return "unknown";
    const f = fatigue.toLowerCase();
    if (f.includes("perfect")) return "rested";
    if (f.includes("exhausted")) return "exhausted";
    if (f.includes("slightly") || f.includes("very")) return "tired";
    return "unknown";
}

export function translateClientFatigue(fatigue: string | null): string {
    if (!fatigue) return "Sin datos";
    const f = fatigue.toLowerCase();
    if (f.includes("perfect")) return "Descansado";
    if (f.includes("slightly")) return "Cansado";
    if (f.includes("very")) return "Muy cansado";
    if (f.includes("exhausted")) return "Agotado";
    return fatigue;
}

export function clientListAdherenceTone(value: number | null | undefined): string {
    if (value == null) return "text-muted-foreground";
    if (value >= 75) return "text-success";
    if (value >= 50) return "text-warning";
    return "text-destructive";
}

export const CLIENT_LIST_ADHERENCE_TONE = clientListAdherenceTone;

export function resolveClientAdherenceTrend(
    adherencePercentage: number | null | undefined,
    progressTrend?: ClientProgressTrend | null,
): ClientProgressTrend | null {
    if (progressTrend) return progressTrend;
    if (adherencePercentage == null) return null;
    if (adherencePercentage >= 75) return "up";
    if (adherencePercentage < 50) return "down";
    return null;
}

/** Tendencia derivada del % solo muestra flecha arriba/abajo; explícita del backend también stable. */
export function shouldShowAdherenceTrendIcon(
    trend: ClientProgressTrend | null,
    hasExplicitProgressTrend: boolean,
): trend is ClientProgressTrend {
    if (!trend) return false;
    if (hasExplicitProgressTrend) return true;
    return trend === "up" || trend === "down";
}

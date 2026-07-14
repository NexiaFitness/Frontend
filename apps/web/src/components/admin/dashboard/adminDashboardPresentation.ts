/**
 * adminDashboardPresentation.ts — Tokens dashboard admin premium (experimento F3b).
 * Hereda glass/cyan de DESIGN_MOBILE §6.7 y F3b_PREMIUM_DESIGN_SYSTEM.md
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    ATHLETE_SETTINGS_CARD,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    ATHLETE_DASHBOARD_KPI_HINT,
    ATHLETE_DASHBOARD_KPI_VALUE,
} from "@/components/athlete/dashboard/athleteDashboardPresentation";

/** Contenedor página — móvil estrecho; desktop usa todo el main del shell. */
export const ADMIN_DASHBOARD_PAGE = cn(
    "relative w-full",
    "pb-12 lg:pb-16"
);

/** Stack vertical móvil → rejilla ancha en lg+. */
export const ADMIN_DASHBOARD_STACK = "relative space-y-8 lg:space-y-10";

/** KPIs: 1 col móvil → 3 columnas iguales en escritorio. */
export const ADMIN_DASHBOARD_KPI_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-5",
    "lg:grid-cols-3 lg:gap-6",
    "xl:gap-8"
);

/** Zona inferior: acciones + actividad lado a lado en desktop. */
export const ADMIN_DASHBOARD_LOWER_GRID = cn(
    "grid grid-cols-1 gap-8",
    "lg:grid-cols-12 lg:items-stretch lg:gap-8",
    "xl:gap-10"
);

export const ADMIN_DASHBOARD_ACTIONS_COL = "lg:col-span-5 xl:col-span-4";

export const ADMIN_DASHBOARD_ACTIVITY_COL = "lg:col-span-7 xl:col-span-8";

/** Columna inferior — estira al alto de la fila del grid. */
export const ADMIN_DASHBOARD_LOWER_COL = "flex h-full min-h-0 flex-col";

export const ADMIN_DASHBOARD_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.14),transparent_72%)]";

export const ADMIN_DASHBOARD_KPI_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex h-full min-h-[8.5rem] flex-col justify-end overflow-hidden p-5 lg:p-6"
);

export const ADMIN_DASHBOARD_KPI_VALUE = ATHLETE_DASHBOARD_KPI_VALUE;

export const ADMIN_DASHBOARD_KPI_LABEL = "mt-1 text-sm font-semibold text-foreground";

export const ADMIN_DASHBOARD_KPI_HINT = ATHLETE_DASHBOARD_KPI_HINT;

export const ADMIN_DASHBOARD_ACTIVITY_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex h-full min-h-full w-full cursor-pointer flex-col overflow-hidden p-5 transition-colors lg:p-6",
    "hover:bg-surface-2/50 active:bg-surface-2/70",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100"
);

export const ADMIN_DASHBOARD_ACTIVITY_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const ADMIN_DASHBOARD_ACTIVITY_DESCRIPTION = NEXIA_PORTAL_CARD_DESCRIPTION;

export const ADMIN_DASHBOARD_ACTIVITY_METRIC = ATHLETE_DASHBOARD_KPI_VALUE;

export const ADMIN_DASHBOARD_ACTIVITY_METRICS_GRID = cn(
    "grid grid-cols-3 gap-3",
    "lg:gap-6 xl:gap-8"
);

export const ADMIN_DASHBOARD_SECTION_LABEL = ATHLETE_SECTION_LABEL;

export const ADMIN_DASHBOARD_PRIMARY_CTA = ATHLETE_PRIMARY_CTA;

/**
 * planningShellPresentation.ts — Tokens layout shell F5 (explore · analytics).
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_GLASS_CARD,
} from "@/components/ui/surface/glassSurfacePresentation";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";

export const PLANNING_SHELL_SECTION_CLASS = "space-y-6";

export const PLANNING_SHELL_HEADER_CLASS =
    "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";

export const PLANNING_SHELL_TITLE_CLASS = NEXIA_PORTAL_CARD_TITLE;

export const PLANNING_SHELL_SUBTITLE_CLASS = NEXIA_PORTAL_GREETING_SUBTITLE;

export const PLANNING_PROGRAM_EYEBROW = NEXIA_PORTAL_PAGE_EYEBROW;

export const PLANNING_PROGRAM_SUMMARY_CLASS = NEXIA_PORTAL_GREETING_SUBTITLE;

/** Card resumen plan activo (panel explore). */
export const PLANNING_ACTIVE_PLAN_CARD_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative shrink-0 space-y-3 p-5 pt-6",
);

export const PLANNING_ACTIVE_PLAN_LABEL = PLATFORM_SECTION_LABEL;

export const PLANNING_ACTIVE_PLAN_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const PLANNING_ACTIVE_PLAN_META = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "flex flex-wrap items-center gap-x-1.5 gap-y-0.5",
);

/** Barra resumen programa — informativa, ancho completo, baja altura (hub planificación). */
export const PLANNING_PROGRAM_SUMMARY_CARD_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative w-full min-w-0 px-4 py-3 pt-4 sm:px-5 sm:py-3.5 sm:pt-4",
);

/** Dentro de sección Historial (ya tiene acento azul): sin rim superior en cada ítem. */
export const PLANNING_PROGRAM_SUMMARY_CARD_NESTED = "pt-3 sm:pt-3.5";

/** Lista historial / selector de plan — misma card glass, activable. */
export const PLANNING_PROGRAM_SUMMARY_CARD_ACTIVATABLE = cn(
    "cursor-pointer text-left",
    "transition-[transform,box-shadow,background-color] duration-150",
    "hover:-translate-y-px hover:bg-surface/40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

export const PLANNING_PROGRAM_SUMMARY_PRIMARY_ROW = cn(
    "flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
);

export const PLANNING_PROGRAM_SUMMARY_TITLE_ROW = cn(
    "flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5",
);

export const PLANNING_PROGRAM_SUMMARY_EYEBROW = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "shrink-0 text-[10px] sm:text-[11px]",
);

export const PLANNING_PROGRAM_SUMMARY_TITLE = cn(
    NEXIA_PORTAL_CARD_TITLE,
    "truncate text-base font-semibold leading-tight sm:text-[1.05rem]",
);

export const PLANNING_PROGRAM_SUMMARY_BADGES = "flex shrink-0 flex-wrap items-center gap-1.5";

export const PLANNING_PROGRAM_SUMMARY_META_ROW = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-snug",
);

export const PLANNING_PROGRAM_SUMMARY_META_DOT = "text-muted-foreground/45 select-none";

/** Historial (hermano anterior) + card resumen — botón fuera y encima del `<article>`. */
export const PLANNING_PROGRAM_SUMMARY_STACK = cn(
    "flex w-full min-w-0 flex-col gap-1",
);

export const PLANNING_PLANS_HISTORY_TRIGGER_ROW = "flex justify-end";

export const PLANNING_PLANS_HISTORY_TRIGGER = cn(
    "h-7 gap-1 px-1.5 text-xs font-semibold sm:h-8 sm:gap-1.5 sm:px-2",
    "[&_svg]:text-primary",
);

export const PLANNING_PLAN_STATUS_BADGE: Record<string, string> = {
    active: "border-success/30 bg-success/10 text-success",
    completed: "border-primary/30 bg-primary/10 text-primary",
    paused: "border-warning/30 bg-warning/10 text-warning",
    cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

export const PLANNING_PLAN_STATUS_BADGE_BASE = cn(
    "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1",
    "text-xs font-semibold uppercase tracking-wide",
);

export const PLANNING_PROGRAM_GOAL_BADGE = cn(
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
);

export const PLANNING_PROGRAM_GOAL_BADGE_ICON = "size-3 shrink-0";

/** Calendario explore — glass + rim externo. */
export const PLANNING_CALENDAR_WRAP_CLASS = "relative min-w-0";

export const PLANNING_CALENDAR_SHELL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "space-y-3 p-5 pt-6",
);

/** Empty panel fase — glass con borde discontinuo. */
export const PLANNING_EMPTY_CALLOUT_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col items-center justify-center space-y-3 border-2 border-dashed border-border/50 p-8 text-center",
);

export type PlanningShellSplitVariant = "explore" | "createWhen";

/** Calendario izquierda · panel derecha (desktop). */
export const PLANNING_SHELL_SPLIT_BASE = cn(
    "flex w-full min-w-0 flex-col gap-6",
    "lg:grid lg:items-start",
);

export function planningShellSplitGridClass(variant: PlanningShellSplitVariant): string {
    return cn(
        PLANNING_SHELL_SPLIT_BASE,
        variant === "createWhen"
            ? "lg:grid-cols-[minmax(0,13fr)_minmax(0,7fr)] lg:items-stretch"
            : "lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]",
    );
}

/** Fila superior explore: todas las cards de bloque (scroll horizontal si hace falta). */
export const PLANNING_EXPLORE_BLOCKS_ROW = cn(
    "flex w-full min-w-0 gap-4 overflow-x-auto pb-1",
    "snap-x snap-mandatory scrollbar-primary",
);

/** Columna izquierda del split (solo calendario). */
export const PLANNING_SHELL_MAIN_COLUMN = "min-w-0";

/** Plan activo + guía nuevo bloque (sidebar). */
export const PLANNING_SHELL_PANEL_STACK = "flex min-w-0 flex-col gap-4";

/** Columna lateral createWhen — plan activo arriba, guía nuevo bloque estira. */
export const PLANNING_CREATE_WHEN_SIDEBAR_CLASS = cn(
    PLANNING_SHELL_PANEL_STACK,
    "min-h-0 lg:h-full",
);

/** Panel guía selección rango — altura alineada con calendario en desktop. */
export const PLANNING_CREATE_BLOCK_PANEL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative flex min-h-[18rem] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0",
);

export const PLANNING_CREATE_BLOCK_PANEL_INNER =
    "relative flex min-h-0 flex-1 flex-col p-5 pt-6 sm:p-6";

export const PLANNING_CREATE_BLOCK_META = PLATFORM_SECTION_LABEL;

export const PLANNING_CREATE_BLOCK_IDLE_BODY = cn(
    "flex flex-1 flex-col items-center justify-center px-2 py-6 text-center",
);

export const PLANNING_CREATE_BLOCK_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent";

export const PLANNING_CREATE_BLOCK_ICON_WRAP = cn(
    "relative z-[1] mb-5 flex size-14 items-center justify-center rounded-2xl",
    "border border-primary/30 bg-primary/12 text-primary backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-primary/15 shadow-[0_0_28px_-8px] shadow-primary/35",
);

export const PLANNING_CREATE_BLOCK_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const PLANNING_CREATE_BLOCK_DESCRIPTION = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-2 max-w-[16rem] leading-relaxed",
);

export const PLANNING_CREATE_BLOCK_HINTS = cn(
    "mt-auto w-full space-y-2 border-t border-border/60 pt-5 text-left",
);

export const PLANNING_CREATE_BLOCK_HINT_ITEM = cn(
    "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
);

export const PLANNING_CREATE_BLOCK_HINT_DOT =
    "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70";

export const PLANNING_CREATE_BLOCK_STAT_ROW = cn(
    "flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm",
);

export const PLANNING_CREATE_BLOCK_ACTIVE_HINT = cn(
    "text-xs font-medium text-primary animate-pulse",
);

export const PLANNING_CREATE_BLOCK_FOOTER = "mt-auto flex justify-end pt-4";

export const PLANNING_CREATE_BLOCK_FOOTER_STACK = cn(
    "mt-auto flex w-full flex-col gap-4 border-t border-border/60 pt-5",
);

export const PLANNING_PANEL_CARD_CLASS = cn(NEXIA_GLASS_CARD, "min-w-0 p-5 sm:p-6");

export const PLANNING_FOOTER_ACTIONS_CLASS =
    "flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between";

/** Stack de secciones explore (análisis · ejecución · hitos). */
export const PLANNING_EXPLORE_SECTIONS_STACK = "space-y-3";

/** Card colapsable premium — reposo. */
export const PLANNING_EXPLORE_SECTION_COLLAPSED = cn(
    NEXIA_GLASS_CARD,
    "relative overflow-hidden transition-colors duration-150",
);

/** Card colapsable premium — expandida (rim + borde cyan). */
export const PLANNING_EXPLORE_SECTION_EXPANDED = cn(
    PLANNING_EXPLORE_SECTION_COLLAPSED,
    "border-primary/25 bg-card/35 shadow-[0_4px_24px_-10px] shadow-black/45",
);

export const PLANNING_EXPLORE_SECTION_HEADER = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
    "hover:bg-surface-2/35",
);

export const PLANNING_EXPLORE_SECTION_HEADER_EXPANDED = cn(
    PLANNING_EXPLORE_SECTION_HEADER,
    "bg-surface-2/60 bg-gradient-to-b from-primary/[0.08] to-surface-2/45",
);

export const PLANNING_EXPLORE_SECTION_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const PLANNING_EXPLORE_SECTION_DESCRIPTION = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-0.5 line-clamp-2",
);

export const PLANNING_EXPLORE_SECTION_CHEVRON =
    "size-4 shrink-0 text-muted-foreground transition-transform duration-200";

export const PLANNING_EXPLORE_SECTION_BODY = "space-y-4 px-4 pb-4 pt-1";

export const PLANNING_EXPLORE_SECTION_BODY_DIVIDER_WRAP =
    "relative px-4 pb-1 pt-0";

export const PLANNING_EXPLORE_SECTION_BODY_DIVIDER = NEXIA_DIVIDER_GLOW;

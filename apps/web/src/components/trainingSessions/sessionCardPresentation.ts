/**
 * sessionCardPresentation.ts — Tarjeta sesión (lista cliente / plan).
 *
 * Paridad visual con PeriodBlockCard + planning shell (glass · rim · badges).
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    PERIOD_BLOCK_CARD_HEADER_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS,
} from "@/components/trainingPlans/periodization/periodBlockCardPresentation";

export const SESSION_CARD_SHELL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative w-full min-w-0 overflow-hidden border-primary/20",
    "transition-all duration-200",
    "hover:border-primary/35 hover:shadow-[0_8px_32px_-12px] hover:shadow-primary/15",
);

/** Lista cliente/plan: altura uniforme, ancho fluido (sin max-w de bloque). */
export const SESSION_CARD_SHELL_LIST_CLASS = cn(
    SESSION_CARD_SHELL_CLASS,
    "flex h-full max-w-none flex-col",
);

export const SESSION_CARD_LIST_ITEM_CLASS = "flex min-h-0 h-full min-w-0";

/** Rejilla responsive — columnas 1fr para rellenar fila (sin hueco a la derecha). */
export const SESSION_CARD_LIST_GRID_CLASS = cn(
    "grid w-full min-w-0 gap-4",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
);

export const SESSION_CARD_MAIN_STACK_CLASS = "relative z-[1] flex min-h-0 flex-1 flex-col";

export const SESSION_CARD_BODY_LIST_CLASS = cn(
    "relative z-[1] grid flex-1 grid-cols-2 items-stretch gap-3 px-4 py-3.5",
);

export const SESSION_CARD_CARGA_STACK_CLASS = "flex min-h-[7.25rem] flex-1 flex-col";

export const SESSION_CARD_FOOTER_PIN_CLASS = cn(
    "relative z-[1] mt-auto shrink-0",
);

export const SESSION_CARD_HEADER_CLASS = PERIOD_BLOCK_CARD_HEADER_CLASS;

export const SESSION_CARD_HEADER_MAIN = "flex min-w-0 flex-1 items-start gap-2.5";

export const SESSION_CARD_DOT_CLASS =
    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full";

export const SESSION_CARD_TITLE_CLASS = cn(
    NEXIA_PORTAL_CARD_TITLE,
    "truncate text-sm font-semibold leading-snug sm:text-base",
);

export const SESSION_CARD_HEADER_ACTIONS = "flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center";

export const SESSION_CARD_META_ROW = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-snug",
);

export const SESSION_CARD_META_DOT = "text-muted-foreground/45 select-none";

export const SESSION_CARD_BODY_CLASS = "relative z-[1] space-y-4 px-4 py-4 sm:px-5";

export const SESSION_CARD_METRICS_ROW =
    "flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch";

export const SESSION_CARD_NOTES_SHELL = cn(
    "w-full rounded-lg border border-border/50 bg-surface-2/30 px-3.5 py-3",
);

export const SESSION_CARD_NOTES_LABEL = cn(PLATFORM_SECTION_LABEL, "text-[10px]");

export const SESSION_CARD_FOOTER_ACTIONS =
    "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end";

export const SESSION_CARD_ICON_BTN = PERIOD_BLOCK_CARD_ICON_BTN_CLASS;

export const SESSION_CARD_ICON_BTN_EDIT = PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS;

export const SESSION_CARD_ICON_BTN_DELETE = PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS;

export const SESSION_CARD_STATUS_BADGE_BASE = cn(
    "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1",
    "text-xs font-semibold uppercase tracking-wide",
);

export const SESSION_CARD_STANDALONE_BADGE = cn(
    "inline-flex shrink-0 items-center rounded-md border border-border/60",
    "bg-surface/80 px-2 py-1 text-xs font-medium text-muted-foreground",
);

export const SESSION_CARD_COHERENCE_CHIP = cn(
    "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1",
    "text-xs font-semibold transition-colors",
    "hover:border-primary/45 hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const SESSION_CARD_PLAN_STRIP_CLASS = cn(
    "min-w-0 w-full flex-[2] basis-full sm:basis-[min(100%,20rem)]",
    "rounded-lg border border-primary/30 bg-primary/[0.06]",
    "flex flex-col gap-4 px-4 py-4 md:flex-row md:items-stretch md:gap-5",
);

export const SESSION_CARD_PLAN_STRIP_DIVIDER =
    "hidden md:block w-px shrink-0 self-stretch bg-primary/30";

export const SESSION_CARD_PLAN_STRIP_LABEL = cn(
    PLATFORM_SECTION_LABEL,
    "text-[10px] normal-case tracking-normal",
);

export const SESSION_CARD_DIVIDER_WRAP = "relative z-[1] bg-surface-2/20 px-4 py-0.5";

export const SESSION_CARD_DIVIDER_LINE = NEXIA_DIVIDER_GLOW;

export type SessionCardStatusKey =
    | "planned"
    | "completed"
    | "cancelled"
    | "in_progress"
    | "skipped"
    | "modified";

export interface SessionCardStatusTone {
    dot: string;
    badge: string;
    label: string;
}

export const SESSION_CARD_STATUS_TONE: Record<SessionCardStatusKey, SessionCardStatusTone> = {
    planned: {
        dot: "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]",
        badge: "border-primary/30 bg-primary/10 text-primary",
        label: "Planificada",
    },
    completed: {
        dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.55)]",
        badge: "border-success/30 bg-success/10 text-success",
        label: "Completada",
    },
    cancelled: {
        dot: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.55)]",
        badge: "border-destructive/30 bg-destructive/10 text-destructive",
        label: "Cancelada",
    },
    in_progress: {
        dot: "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.55)]",
        badge: "border-warning/30 bg-warning/10 text-warning",
        label: "En progreso",
    },
    skipped: {
        dot: "bg-muted-foreground",
        badge: "border-border bg-muted/30 text-muted-foreground",
        label: "Saltada",
    },
    modified: {
        dot: "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.55)]",
        badge: "border-warning/30 bg-warning/10 text-warning",
        label: "Modificada",
    },
};

export const SESSION_CARD_DEFAULT_STATUS: SessionCardStatusKey = "planned";

export function resolveSessionCardStatusTone(
    status: string,
): SessionCardStatusTone {
    const key = status as SessionCardStatusKey;
    return SESSION_CARD_STATUS_TONE[key] ?? SESSION_CARD_STATUS_TONE.planned;
}

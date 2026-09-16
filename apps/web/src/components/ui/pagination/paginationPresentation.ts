/**
 * paginationPresentation.ts — Paginación premium (paridad outline-primary / SessionCard CTAs).
 */

import { cn } from "@/lib/utils";

export const PAGINATION_BAR_SHELL = cn(
    "flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between",
);

export const PAGINATION_RANGE_LABEL = "text-center text-sm text-muted-foreground sm:text-left";

export const PAGINATION_NAV = cn(
    "flex items-center justify-center gap-1 overflow-x-auto pb-1 sm:justify-end sm:overflow-visible sm:pb-0",
);

/** Base táctil — alineado con botones sm del dashboard. */
export const PAGINATION_CONTROL_BASE = cn(
    "inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center",
    "text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40 sm:min-h-8 sm:min-w-8",
);

/** Anterior / siguiente — ghost primary suave. */
export const PAGINATION_NAV_BUTTON_CLASS = cn(
    PAGINATION_CONTROL_BASE,
    "rounded-lg border border-border/50 text-muted-foreground",
    "hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
);

/** Página inactiva. */
export const PAGINATION_PAGE_BUTTON_CLASS = cn(
    PAGINATION_CONTROL_BASE,
    "min-w-[2rem] rounded-lg border border-transparent px-2 tabular-nums",
    "text-muted-foreground hover:border-border/60 hover:bg-surface/80 hover:text-foreground",
);

/** Página activa — mismo lenguaje que Button variant outline-primary. */
export const PAGINATION_PAGE_ACTIVE_CLASS = cn(
    PAGINATION_CONTROL_BASE,
    "min-w-[2rem] rounded-lg border border-primary/30 bg-primary/20 px-2 tabular-nums",
    "font-semibold text-primary",
    "shadow-[inset_0_1px_0_hsl(var(--primary)/0.15)]",
);

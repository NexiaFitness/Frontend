/**
 * sessionCalendarPresentation.ts — Calendario mensual de sesiones (glass · planificación).
 */

import { cn } from "@/lib/utils";

export const SESSION_CALENDAR_INNER_CLASS = cn(
    "rounded-none border-0 bg-transparent p-0 shadow-none",
);

export const SESSION_CALENDAR_CELL_BASE = cn(
    "bg-surface/40 min-h-[72px] p-1.5 md:min-h-[88px] md:p-2",
    "flex cursor-pointer flex-col items-center justify-start",
    "border border-transparent transition-colors",
    "hover:border-primary/25 hover:bg-primary/[0.04]",
);

export const SESSION_CALENDAR_CELL_HAS_SESSION = cn(
    "border-primary/20 bg-primary/[0.06]",
    "hover:border-primary/35 hover:bg-primary/[0.1]",
);

export const SESSION_CALENDAR_CELL_TODAY = "ring-2 ring-primary/35 ring-inset";

export const SESSION_CALENDAR_CELL_SELECTED = cn(
    "border-primary/50 bg-primary/[0.1]",
    "ring-2 ring-primary ring-inset",
);

export const SESSION_CALENDAR_DAY_NUM = "mb-1 text-xs font-medium md:text-sm";

export const SESSION_CALENDAR_DAY_NUM_MUTED = "text-muted-foreground";

export const SESSION_CALENDAR_DAY_NUM_ACTIVE = "font-semibold text-foreground";

export const SESSION_CALENDAR_DAY_NUM_TODAY = "font-bold text-primary";

export const SESSION_CALENDAR_BADGE = cn(
    "rounded-full border border-primary/30 bg-primary/15 px-1.5 py-0.5",
    "text-[10px] font-semibold text-primary md:text-[11px]",
);

export const SESSION_CALENDAR_LEGEND = cn(
    "flex flex-wrap items-center gap-4 border-t border-border/40 pt-3",
    "text-xs text-muted-foreground",
);

export const SESSION_CALENDAR_LEGEND_SWATCH = "h-3.5 w-3.5 rounded border";

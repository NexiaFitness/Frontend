/**
 * athletePlanPresentation.ts — Tokens UI Mi plan (V08, §6.7).
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_PROGRESS_FILL,
    ATHLETE_PROGRESS_TRACK,
} from "@/components/athlete/athleteProgressPresentation";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const ATHLETE_PLAN_HERO = cn(NEXIA_GLASS_CARD, "relative space-y-5 p-4 pt-5");

/** Fila / tarjeta compacta calidades (reutilizado en editor plantilla). */
export const ATHLETE_PLAN_QUALITY_ROW = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-3 p-4"
);

export const ATHLETE_PLAN_LOAD_TRACK = ATHLETE_PROGRESS_TRACK;

export const ATHLETE_PLAN_LOAD_FILL_PRIMARY = ATHLETE_PROGRESS_FILL.primary;

export const ATHLETE_PLAN_LOAD_FILL_WARNING = ATHLETE_PROGRESS_FILL.warning;

export const ATHLETE_PLAN_TIMELINE_ITEM = cn(
    "flex min-w-0 flex-col gap-1.5 rounded-lg border px-2 py-2 transition-colors",
    "border-border/60 bg-card/40"
);

export const ATHLETE_PLAN_TIMELINE_MONTH = "text-[10px] font-semibold uppercase tracking-wide";

export const ATHLETE_PLAN_TIMELINE_LOAD_ROW = "flex items-baseline justify-between gap-1";

export const ATHLETE_PLAN_TIMELINE_LOAD_LABEL =
    "text-[9px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ATHLETE_PLAN_TIMELINE_LOAD_VOL =
    "text-[10px] font-bold tabular-nums text-primary";

export const ATHLETE_PLAN_TIMELINE_LOAD_INT =
    "text-[10px] font-bold tabular-nums text-warning";

export const ATHLETE_PLAN_TIMELINE_ITEM_CURRENT = cn(
    ATHLETE_PLAN_TIMELINE_ITEM,
    "border-primary/45 bg-primary/10 shadow-[0_0_16px_-6px] shadow-primary/40"
);

export const ATHLETE_PLAN_LINK = cn(
    "inline-flex min-h-touch-athlete w-full items-center justify-center rounded-lg",
    "border border-primary/30 bg-primary/10 text-sm font-semibold text-primary",
    "transition-colors hover:bg-primary/15 active:bg-primary/20"
);

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

export const ATHLETE_PLAN_RING = "relative flex size-[4.5rem] shrink-0 items-center justify-center";

export const ATHLETE_PLAN_LOAD_TRACK = ATHLETE_PROGRESS_TRACK;

export const ATHLETE_PLAN_LOAD_FILL_PRIMARY = ATHLETE_PROGRESS_FILL.primary;

export const ATHLETE_PLAN_LOAD_FILL_WARNING = ATHLETE_PROGRESS_FILL.warning;

export const ATHLETE_PLAN_QUALITY_ROW = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-2 p-3"
);

export const ATHLETE_PLAN_TIMELINE_ITEM = cn(
    "flex min-w-[3.25rem] flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-center transition-colors",
    "border-border/60 bg-card/40"
);

export const ATHLETE_PLAN_TIMELINE_ITEM_CURRENT = cn(
    ATHLETE_PLAN_TIMELINE_ITEM,
    "border-primary/45 bg-primary/10 shadow-[0_0_16px_-6px] shadow-primary/40"
);

export const ATHLETE_PLAN_LINK = cn(
    "inline-flex min-h-touch-athlete w-full items-center justify-center rounded-lg",
    "border border-primary/30 bg-primary/10 text-sm font-semibold text-primary",
    "transition-colors hover:bg-primary/15 active:bg-primary/20"
);

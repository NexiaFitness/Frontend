/**
 * athleteAgendaPresentation.ts — Tokens agenda unificada y CARGA-1.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import { cn } from "@/lib/utils";
import type { AthleteSessionLoadVisualModel } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";

export const ATHLETE_AGENDA_PAGE = "space-y-6 px-4 pb-24 pt-4 lg:px-8 lg:pb-8";
export const ATHLETE_AGENDA_DAY_CARD =
    "rounded-xl border border-border/60 bg-card/50 p-4";
export const ATHLETE_AGENDA_DAY_CARD_TODAY = "border-primary/40 shadow-sm";
export const ATHLETE_AGENDA_TODAY_BADGE = "ml-2 text-xs font-medium text-primary";
export const ATHLETE_TODAY_APPOINTMENTS_CARD =
    "rounded-xl border border-border/70 bg-card/80 p-4 space-y-3";

export const ATHLETE_LOAD_HIT_TARGET = cn(
    "relative inline-flex min-h-touch-athlete min-w-touch-athlete shrink-0 items-center justify-center rounded-full",
    "transition-transform active:scale-95"
);

export const ATHLETE_LOAD_VOLUME_SIZE: Record<
    AthleteSessionLoadVisualModel["volumeTier"],
    string
> = {
    low: "size-3 min-w-3",
    medium: "size-4 min-w-4",
    high: "size-5 min-w-5",
};

export const ATHLETE_LOAD_INTENSITY_STYLE: Record<
    AthleteSessionLoadVisualModel["intensityTier"],
    { fill: string; ring: string }
> = {
    low: {
        fill: "bg-sky-400/45",
        ring: "ring-2 ring-sky-300/80 ring-offset-2 ring-offset-background",
    },
    medium: {
        fill: "bg-amber-400/50",
        ring: "ring-[3px] ring-amber-300/85 ring-offset-2 ring-offset-background",
    },
    high: {
        fill: "bg-orange-400/55",
        ring: "ring-4 ring-orange-300/90 ring-offset-2 ring-offset-background",
    },
};

export const ATHLETE_EXERCISE_INFO_BUTTON = cn(
    "mt-0.5 flex min-h-touch-athlete min-w-touch-athlete shrink-0 items-center justify-center rounded-full",
    "text-primary hover:bg-primary/10"
);

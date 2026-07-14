/**
 * athleteRatingPresentation.ts — Escala 1–10 premium portal atleta (V07+).
 * Sustituye sliders HTML en feedback; tokens reutilizables.
 */

import { cn } from "@/lib/utils";
import { ATHLETE_PROGRESS_TRACK_SHELL } from "@/components/athlete/athleteProgressPresentation";

export type AthleteRatingColor = "primary" | "warning";

export const ATHLETE_RATING_FIELD = "space-y-3";

export const ATHLETE_RATING_LABEL = "text-sm font-medium text-foreground";

export const ATHLETE_RATING_VALUE_PILL: Record<AthleteRatingColor, string> = {
    primary: cn(
        "inline-flex min-w-[2.75rem] items-center justify-center rounded-lg",
        "border border-primary/30 bg-primary/12 px-2.5 py-1",
        "text-lg font-semibold tabular-nums leading-none text-primary",
        "shadow-[0_0_20px_-6px] shadow-primary/40"
    ),
    warning: cn(
        "inline-flex min-w-[2.75rem] items-center justify-center rounded-lg",
        "border border-warning/30 bg-warning/12 px-2.5 py-1",
        "text-lg font-semibold tabular-nums leading-none text-warning",
        "shadow-[0_0_20px_-6px] shadow-warning/35"
    ),
};

export const ATHLETE_RATING_TRACK = cn(
    ATHLETE_PROGRESS_TRACK_SHELL,
    "rounded-lg p-1"
);

export const ATHLETE_RATING_SEGMENT_ROW = "relative flex gap-0.5";

export const ATHLETE_RATING_SEGMENT = cn(
    "relative z-[1] flex h-10 min-w-0 flex-1 items-center justify-center rounded-md",
    "text-xs font-medium tabular-nums text-muted-foreground/80 transition-all duration-150",
    "motion-safe:active:scale-[0.92] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ATHLETE_RATING_SEGMENT_FILLED: Record<AthleteRatingColor, string> = {
    primary: "bg-primary/10 text-foreground/75",
    warning: "bg-warning/10 text-foreground/75",
};

export const ATHLETE_RATING_SEGMENT_SELECTED: Record<AthleteRatingColor, string> = {
    primary: cn(
        "border border-primary/40 bg-primary/22 font-semibold text-primary",
        "shadow-[0_0_18px_-4px] shadow-primary/50"
    ),
    warning: cn(
        "border border-warning/40 bg-warning/20 font-semibold text-warning",
        "shadow-[0_0_18px_-4px] shadow-warning/45"
    ),
};

export const ATHLETE_RATING_PROGRESS: Record<AthleteRatingColor, string> = {
    primary: "absolute inset-y-1 left-1 rounded-md bg-primary/12",
    warning: "absolute inset-y-1 left-1 rounded-md bg-warning/10",
};

export const ATHLETE_RATING_ANCHOR =
    "flex justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground/55";

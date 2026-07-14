/**
 * athleteProgressViewPresentation.ts — Tokens V10 progreso atleta premium.
 */

import { cn } from "@/lib/utils";
import { ATHLETE_SETTINGS_CARD } from "@/components/athlete/account/athleteSettingsPresentation";

export const ATHLETE_PROGRESS_CHART_HEIGHT = 208;

export const ATHLETE_PROGRESS_CHART_PANEL = cn(
    ATHLETE_SETTINGS_CARD,
    "relative space-y-4 p-4 pt-5"
);

export const ATHLETE_PROGRESS_STAT_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    "relative flex min-h-[7.5rem] flex-col justify-between p-4 pt-5"
);

export const ATHLETE_PROGRESS_LIST_ROW = cn(
    "flex w-full min-h-touch-athlete items-center gap-3 px-4 py-3 text-left",
    "transition-colors hover:bg-surface/30 active:bg-surface/40"
);

export const ATHLETE_PROGRESS_RECORD_ROW = cn(
    ATHLETE_SETTINGS_CARD,
    "relative flex items-start gap-3 p-4 pt-5"
);

export const ATHLETE_PROGRESS_EMPTY = cn(
    "rounded-lg border border-dashed border-border/70 bg-background/25 px-4 py-8 text-center",
    "text-sm leading-relaxed text-muted-foreground"
);

/** Recharts — ejes y grid discretos en dark. */
export const ATHLETE_CHART_AXIS = {
    tick: { fill: "hsl(var(--muted-foreground) / 0.65)", fontSize: 10 },
    stroke: "hsl(var(--border) / 0.35)",
};

export const ATHLETE_CHART_GRID_STROKE = "hsl(var(--border) / 0.22)";

/** Trofeo / PR — dorado (warning), no verde success. */
export const ATHLETE_TROPHY_ICON = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-xl",
    "border border-warning/35 bg-warning/12 text-warning",
    "shadow-[0_0_16px_-6px] shadow-warning/40"
);

export const ATHLETE_TROPHY_BANNER = cn(
    "flex items-center gap-2 rounded-lg border border-warning/30",
    "bg-warning/10 px-3 py-2 text-sm text-warning"
);

export const ATHLETE_TROPHY_ROW_HIGHLIGHT = cn(
    "relative bg-gradient-to-r from-warning/16 via-warning/8 to-transparent",
    "ring-1 ring-inset ring-warning/40 shadow-[0_0_24px_-8px] shadow-warning/35"
);

export const ATHLETE_TROPHY_ROW_ACCENT =
    "pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-warning/95 to-warning/35";

export const ATHLETE_TROPHY_BADGE = cn(
    "inline-flex items-center gap-1 rounded-md border border-warning/40",
    "bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning"
);

export const ATHLETE_TROPHY_TEXT = "text-warning";
export const ATHLETE_TROPHY_TEXT_MUTED = "text-warning/90";

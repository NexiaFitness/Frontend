/**
 * weekStripPresentation.ts — Tokens calendario semanal V01 (Esta semana).
 */

import { cn } from "@/lib/utils";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_PROGRESS_TRACK_SHELL,
} from "@/components/athlete/athleteProgressPresentation";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const WEEK_STRIP_SECTION_LABEL = ATHLETE_SECTION_LABEL;

export const WEEK_STRIP_SHELL = cn(NEXIA_GLASS_CARD, "relative space-y-2.5 p-3 pt-4");

/** Track segmentos sesiones (eco escala rating V07, más compacto). */
export const WEEK_STRIP_SEGMENT_TRACK = cn(
    ATHLETE_PROGRESS_TRACK_SHELL,
    "h-2 rounded-full p-px"
);

export const WEEK_STRIP_SEGMENT_ROW = "flex h-full gap-px";

export const WEEK_STRIP_SEGMENT = cn(
    "h-full min-w-0 flex-1 rounded-[3px] transition-all duration-300 ease-out"
);

export const WEEK_STRIP_SEGMENT_DONE = cn(
    WEEK_STRIP_SEGMENT,
    "bg-gradient-to-r from-primary via-primary/85 to-primary/50",
    "shadow-[0_0_10px_-4px] shadow-primary/45"
);

export const WEEK_STRIP_SEGMENT_PENDING = cn(
    WEEK_STRIP_SEGMENT,
    "bg-primary/12 ring-1 ring-inset ring-primary/25"
);

export const WEEK_STRIP_SEGMENT_EMPTY = cn(WEEK_STRIP_SEGMENT, "bg-muted/30");

export const WEEK_STRIP_RING = "relative flex size-14 shrink-0 items-center justify-center";

export const WEEK_STRIP_RING_TRACK = "stroke-border/55";

export const WEEK_STRIP_RING_PROGRESS_PRIMARY = cn(
    "stroke-primary transition-[stroke-dashoffset] duration-700 ease-out",
    "drop-shadow-[0_0_6px] drop-shadow-primary/35"
);

export const WEEK_STRIP_RING_PROGRESS_SUCCESS = cn(
    "stroke-success transition-[stroke-dashoffset] duration-700 ease-out",
    "drop-shadow-[0_0_6px] drop-shadow-success/35"
);

export const WEEK_STRIP_RING_LABEL_PRIMARY = "text-primary";

export const WEEK_STRIP_RING_LABEL_SUCCESS = "text-success";

/** Máx. segmentos visibles antes de barra lineal única. */
export const WEEK_STRIP_SEGMENT_MAX = 6;

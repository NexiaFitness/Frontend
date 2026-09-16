/**
 * muscleVolumeRowPresentation.ts — Barras de volumen por grupo muscular (constructor / edit sesión).
 *
 * Track y relleno alineados con BlockLevelMeter y QualityShareBar (glass + gradiente suave).
 * @see blockLevelMeterPresentation.ts · qualityShareBarPresentation.ts
 */

import { cn } from "@/lib/utils";
import type { WeeklyVolumeRowStatus } from "@nexia/shared";
import { BLOCK_LEVEL_METER_TRACK_CLASS } from "@/components/trainingPlans/periodization/blockLevelMeterPresentation";

export const MUSCLE_VOLUME_BAR_TRACK_CLASS = BLOCK_LEVEL_METER_TRACK_CLASS;

export const MUSCLE_VOLUME_BAR_FILL_CLASS: Record<WeeklyVolumeRowStatus, string> = {
    deficit: cn(
        "bg-gradient-to-r from-warning/25 via-warning/45 to-warning/60",
        "shadow-[inset_0_1px_0_hsl(var(--warning)/0.25)]",
    ),
    on_target: cn(
        "bg-gradient-to-r from-success/25 via-success/45 to-success/60",
        "shadow-[inset_0_1px_0_hsl(var(--success)/0.25)]",
    ),
    excess: cn(
        "bg-gradient-to-r from-destructive/25 via-destructive/45 to-destructive/55",
        "shadow-[inset_0_1px_0_hsl(var(--destructive)/0.2)]",
    ),
    no_target: cn(
        "bg-gradient-to-r from-primary/20 via-primary/35 to-primary/50",
        "shadow-[inset_0_1px_0_hsl(var(--primary)/0.2)]",
    ),
};

export const MUSCLE_VOLUME_STATUS_BADGE_CLASS: Record<WeeklyVolumeRowStatus, string> = {
    deficit: "border-warning/30 bg-warning/10 text-warning",
    on_target: "border-success/30 bg-success/10 text-success",
    excess: "border-destructive/30 bg-destructive/10 text-destructive",
    no_target: "border-border/50 bg-muted/30 text-muted-foreground",
};

export const MUSCLE_VOLUME_ROW_TITLE_CLASS =
    "text-xs font-semibold text-foreground truncate min-w-0";

export const MUSCLE_VOLUME_ROW_META_CLASS =
    "text-[11px] text-muted-foreground tabular-nums shrink-0";

export const MUSCLE_VOLUME_ROW_STATUS_BADGE =
    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none";

export const MUSCLE_VOLUME_ROW_CONTEXT_CLASS =
    "text-[11px] text-muted-foreground leading-snug block";

export const MUSCLE_VOLUME_ROW_BREAKDOWN_CLASS =
    "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/80 pt-0.5";

export const MUSCLE_VOLUME_ROW_UNCOVERED_SHELL = cn(
    "min-w-0 rounded-lg border border-dashed border-border/55",
    "bg-surface-2/40 px-3 py-2.5 backdrop-blur-sm",
);

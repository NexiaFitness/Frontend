/**
 * sessionValidationReviewPresentation.ts — Tarjetas de validación en página Revisión (premium).
 *
 * Sin border-l grueso; glass + rim. Barras: track compartido con BlockLevelMeter / MuscleVolumeRow.
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
} from "@/components/ui/surface/glassSurfacePresentation";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { BLOCK_LEVEL_METER_TRACK_CLASS } from "@/components/trainingPlans/periodization/blockLevelMeterPresentation";
import { MUSCLE_VOLUME_BAR_FILL_CLASS } from "./muscleVolumeRowPresentation";
export const SESSION_VALIDATION_REVIEW_GRID = cn(
    "grid grid-cols-1 gap-4 md:gap-5",
    "md:grid-cols-2",
);

export const SESSION_VALIDATION_INSIGHT_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden",
);

export const SESSION_VALIDATION_INSIGHT_HEADER = cn(
    "relative z-[1] flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5",
);

export const SESSION_VALIDATION_INSIGHT_TITLE = "text-sm font-semibold text-foreground";

export const SESSION_VALIDATION_INSIGHT_BODY = "relative z-[1] space-y-4 p-4 sm:p-5";

export const SESSION_VALIDATION_VOLUME_FULL = "md:col-span-2";

export const SESSION_VALIDATION_PATTERN_TILE = cn(
    "rounded-lg border border-border/45 bg-surface-2/40 px-3 py-2.5 backdrop-blur-sm",
);

export const SESSION_VALIDATION_PATTERN_TILE_LABEL = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "mb-1.5 block text-[10px]",
);

export const SESSION_VALIDATION_UNCOVERED_SHELL = cn(
    "space-y-2 rounded-xl border border-dashed border-border/50 bg-surface-2/30 px-3 py-3 sm:px-4",
);

export const SESSION_VALIDATION_DEVIATION_TRACK = BLOCK_LEVEL_METER_TRACK_CLASS;

export function sessionValidationDeviationFillClass(percent: number): string {
    const abs = Math.abs(percent);
    if (abs <= 15) return MUSCLE_VOLUME_BAR_FILL_CLASS.on_target;
    if (abs <= 30) return MUSCLE_VOLUME_BAR_FILL_CLASS.deficit;
    return MUSCLE_VOLUME_BAR_FILL_CLASS.excess;
}

export function sessionValidationAxialFillClass(exceeds: boolean): string {
    return exceeds
        ? MUSCLE_VOLUME_BAR_FILL_CLASS.excess
        : MUSCLE_VOLUME_BAR_FILL_CLASS.on_target;
}

export const SESSION_VALIDATION_NOT_APPLICABLE = cn(
    SESSION_VALIDATION_INSIGHT_CARD,
    "relative p-4 sm:p-5",
);

export const SESSION_VALIDATION_SECTION_EYEBROW = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
);

export const SESSION_VALIDATION_EMPTY_HINT = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "rounded-lg border border-border/45 bg-surface-2/35 px-3 py-2.5 text-sm",
);

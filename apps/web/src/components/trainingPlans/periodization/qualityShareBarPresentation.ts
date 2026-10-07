/**
 * qualityShareBarPresentation.ts — Barras de reparto de cualidad física (tinte glass).
 *
 * Misma familia semántica que getPhysicalQualityColor; relleno apagado (no hex sólido).
 */

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { ATHLETE_PROGRESS_TRACK } from "@/components/athlete/athleteProgressPresentation";

/** Track premium (glass) — relleno sigue el hex de cada cualidad. */
export const QUALITY_SHARE_BAR_TRACK_CLASS = cn(
    ATHLETE_PROGRESS_TRACK,
    "min-w-0 flex-1",
);

/** Misma pista premium en overlay editable (sin flex-1). */
export const QUALITY_SHARE_BAR_TRACK_OVERLAY_CLASS = cn(
    ATHLETE_PROGRESS_TRACK,
    "h-2 w-full",
);

/** Contenedor del range sobre la pista glass. */
export const QUALITY_SHARE_BAR_RANGE_WRAP =
    "relative flex h-3.5 min-w-0 flex-1 items-center";

export const QUALITY_SHARE_BAR_FILL_CLASS = cn(
    "relative h-full rounded-full transition-[width] duration-500 ease-out",
    "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-2/5",
    "after:rounded-full after:bg-gradient-to-b after:from-white/22 after:to-transparent",
);

/** Etiqueta fija estrecha (paneles con muchas columnas). */
export const QUALITY_SHARE_BAR_LABEL_CLASS =
    "w-[4.5rem] shrink-0 truncate text-[11px] text-muted-foreground leading-none";

/** Etiqueta legible completa (constructor sesión, tablet). */
export const QUALITY_SHARE_BAR_LABEL_COMFORT_CLASS =
    "min-w-[5.5rem] shrink-0 whitespace-nowrap text-[11px] leading-none sm:min-w-0";

export const QUALITY_SHARE_BAR_PERCENT_CLASS =
    "w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground/90";

export const QUALITY_SHARE_BAR_DOT_CLASS = "h-1.5 w-1.5 shrink-0 rounded-full opacity-80";

/** Relleno por hex de catálogo (sin primary del tema). */
export function qualityShareBarFillStyle(
    hex: string,
    percentage: number,
): CSSProperties {
    const clamped = Math.max(0, Math.min(100, percentage));
    return {
        width: `${clamped}%`,
        background: `linear-gradient(to right, ${hex}40, ${hex}99)`,
        boxShadow: `inset 0 1px 0 ${hex}40`,
    };
}

const QUALITY_SHARE_BAR_RANGE_BASE_CLASS = cn(
    "absolute inset-x-0 top-1/2 z-[1] h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent",
    "[&::-webkit-slider-runnable-track]:bg-transparent",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background/80",
    "[&::-webkit-slider-thumb]:bg-[--quality-accent] [&::-moz-range-thumb]:bg-[--quality-accent]",
    "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_color-mix(in_srgb,var(--quality-accent)_55%,transparent)]",
    "[&::-moz-range-track]:bg-transparent",
    "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
    "disabled:cursor-not-allowed disabled:opacity-60",
);

export function qualityShareBarRangeClass(): string {
    return QUALITY_SHARE_BAR_RANGE_BASE_CLASS;
}

export function qualityShareBarDotStyle(hex: string): CSSProperties {
    return {
        backgroundColor: hex,
        boxShadow: `0 0 6px -1px ${hex}66`,
    };
}

export function qualityShareBarLabelToneStyle(hex: string): CSSProperties {
    return { color: hex, opacity: 0.88 };
}

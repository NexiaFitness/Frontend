/**
 * qualityShareBarPresentation.ts — Barras de reparto de cualidad física (tinte glass).
 *
 * Misma familia semántica que getPhysicalQualityColor; relleno apagado (no hex sólido).
 */

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export const QUALITY_SHARE_BAR_TRACK_CLASS = cn(
    "h-2 flex-1 min-w-0 overflow-hidden rounded-full",
    "border border-border/45 bg-surface-2/70",
);

export const QUALITY_SHARE_BAR_LABEL_CLASS =
    "w-[4.5rem] shrink-0 truncate text-[11px] text-muted-foreground leading-none";

export const QUALITY_SHARE_BAR_PERCENT_CLASS =
    "w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground/90";

export const QUALITY_SHARE_BAR_DOT_CLASS = "h-1.5 w-1.5 shrink-0 rounded-full opacity-80";

/** Relleno con gradiente suave sobre el hex de catálogo (35→65 % opacidad). */
export function qualityShareBarFillStyle(
    hex: string,
    percentage: number,
): CSSProperties {
    const clamped = Math.max(0, Math.min(100, percentage));
    return {
        width: `${clamped}%`,
        background: `linear-gradient(90deg, ${hex}4d, ${hex}99)`,
        boxShadow: `inset 0 1px 0 ${hex}33`,
    };
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

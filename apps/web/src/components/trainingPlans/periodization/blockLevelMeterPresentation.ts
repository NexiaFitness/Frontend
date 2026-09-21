/**
 * blockLevelMeterPresentation.ts — Medidor volumen/intensidad (1–10) estilo glass.
 */

import { cn } from "@/lib/utils";

export type BlockLevelMeterTone = "volume" | "intensity";

export const BLOCK_LEVEL_METER_TRACK_CLASS = cn(
    "h-2 w-full overflow-hidden rounded-full",
    "border border-border/45 bg-surface-2/70",
);

export const BLOCK_LEVEL_METER_FILL_CLASS: Record<BlockLevelMeterTone, string> = {
    volume: cn(
        "bg-gradient-to-r from-primary/25 via-primary/45 to-primary/60",
        "shadow-[inset_0_1px_0_hsl(var(--primary)/0.25)]",
    ),
    intensity: cn(
        "bg-gradient-to-r from-warning/25 via-warning/45 to-warning/60",
        "shadow-[inset_0_1px_0_hsl(var(--warning)/0.25)]",
    ),
};

export const BLOCK_LEVEL_METER_VALUE_CLASS: Record<BlockLevelMeterTone, string> = {
    volume: "text-primary font-bold tabular-nums",
    intensity: "text-warning font-bold tabular-nums",
};

export const BLOCK_LEVEL_METER_PREFIX_CLASS =
    "text-[11px] text-muted-foreground leading-tight";

export const BLOCK_LEVEL_METER_QUALITATIVE_CLASS =
    "text-[11px] font-medium leading-tight";

/** Altura del thumb (h-3.5); la pista sigue siendo h-2 dentro del input. */
export const BLOCK_LEVEL_METER_RANGE_WRAP =
    "flex h-3.5 w-full items-center";

/** Range editable a ancho completo (sin pista decorativa duplicada debajo). */
export const BLOCK_LEVEL_METER_RANGE_EDITABLE_CLASS = cn(
    "h-2 w-full cursor-pointer appearance-none rounded-full",
    "border border-border/45 bg-surface-2/70",
    "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
    "[&::-webkit-slider-thumb]:mt-[calc(0.5rem/2-0.875rem/2)]",
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background/80",
    "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full",
    "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
    "disabled:cursor-not-allowed disabled:opacity-60",
);

export const BLOCK_LEVEL_METER_RANGE_BASE_CLASS = cn(
    "absolute inset-0 z-[1] h-2 w-full cursor-pointer appearance-none bg-transparent",
    "[&::-webkit-slider-runnable-track]:bg-transparent",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background/80",
    "[&::-moz-range-track]:bg-transparent",
    "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
    "disabled:cursor-not-allowed disabled:opacity-60",
);

export function blockLevelMeterRangeEditableClass(tone: BlockLevelMeterTone): string {
    const thumb =
        tone === "volume"
            ? "[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
            : "[&::-webkit-slider-thumb]:bg-warning [&::-moz-range-thumb]:bg-warning";

    const thumbGlow =
        tone === "volume"
            ? "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_hsl(var(--primary)/0.45)]"
            : "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_hsl(var(--warning)/0.45)]";

    return cn(BLOCK_LEVEL_METER_RANGE_EDITABLE_CLASS, thumbGlow, thumb);
}

export function blockLevelMeterRangeClass(tone: BlockLevelMeterTone): string {
    const thumb =
        tone === "volume"
            ? "[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary"
            : "[&::-webkit-slider-thumb]:bg-warning [&::-moz-range-thumb]:bg-warning";

    const thumbGlow =
        tone === "volume"
            ? "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_hsl(var(--primary)/0.45)]"
            : "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_hsl(var(--warning)/0.45)]";

    return cn(BLOCK_LEVEL_METER_RANGE_BASE_CLASS, thumbGlow, thumb);
}

export function blockLevelMeterAccentRangeEditableClass(): string {
    return cn(
        BLOCK_LEVEL_METER_RANGE_EDITABLE_CLASS,
        "[&::-webkit-slider-thumb]:bg-[--meter-accent] [&::-moz-range-thumb]:bg-[--meter-accent]",
        "[&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_color-mix(in_srgb,var(--meter-accent)_55%,transparent)]",
    );
}

export function blockLevelMeterEditableTrackBackground(
    accentHex: string | undefined,
    tone: BlockLevelMeterTone,
    widthPct: number,
): string | undefined {
    if (accentHex) {
        return `linear-gradient(to right, ${accentHex}55 0%, ${accentHex}99 ${widthPct}%, hsl(var(--surface-2) / 0.7) ${widthPct}%)`;
    }
    if (tone === "volume") {
        return `linear-gradient(to right, hsl(var(--primary) / 0.45) 0%, hsl(var(--primary) / 0.6) ${widthPct}%, hsl(var(--surface-2) / 0.7) ${widthPct}%)`;
    }
    return `linear-gradient(to right, hsl(var(--warning) / 0.45) 0%, hsl(var(--warning) / 0.6) ${widthPct}%, hsl(var(--surface-2) / 0.7) ${widthPct}%)`;
}

export function blockLevelMeterAccentFillStyle(
    accentHex: string,
    widthPct: number,
): { width: string; background: string; boxShadow: string } {
    return {
        width: `${widthPct}%`,
        background: `linear-gradient(to right, ${accentHex}40, ${accentHex}99)`,
        boxShadow: `inset 0 1px 0 ${accentHex}40`,
    };
}

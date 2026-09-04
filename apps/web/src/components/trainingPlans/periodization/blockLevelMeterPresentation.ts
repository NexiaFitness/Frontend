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

/**
 * patternBadgePresentation.ts — Chips de patrón de movimiento por ui_bucket.
 *
 * Tokens HSL: `apps/web/src/index.css` (--bucket-*)
 * Taxonomía: `@nexia/shared` → `exerciseUiBucket.ts` (UI_BUCKET_ORDER, UI_BUCKET_LABELS)
 * Componente: `PatternBadge.tsx`
 *
 * Receta: tinte glass (bg 12%, borde 30%, texto del bucket). Sin fondo sólido ni glow.
 */

import type { UiBucketTailwindKey } from "@nexia/shared";

import { cn } from "@/lib/utils";

export const PATTERN_BADGE_BASE_CLASS =
    "inline-flex items-center rounded-md border font-medium transition-colors";

export const patternBadgeSizeClass = (size: "sm" | "md" | "lg"): string => {
    if (size === "sm") return "px-2 py-0.5 text-[11px]";
    if (size === "lg") return "min-h-10 px-3 py-2 text-sm";
    return "px-2.5 py-1 text-xs";
};

export const PATTERN_BADGE_IDLE_CLASS =
    "border-border/60 bg-surface-2/40 text-muted-foreground";

export const PATTERN_BADGE_IDLE_HOVER_CLASS =
    "hover:border-primary/30 hover:bg-surface-2/80 hover:text-foreground";

/** Idle con tinte bucket — modal picker D-PAP. */
export const PATTERN_BADGE_IDLE_BUCKET_CLASS: Record<
    UiBucketTailwindKey,
    string
> = {
    lower: cn(
        "border-bucket-lower/25 bg-bucket-lower/[0.07] text-foreground/90",
        "hover:border-bucket-lower/45 hover:bg-bucket-lower/14 hover:text-bucket-lower",
    ),
    upper: cn(
        "border-bucket-upper/25 bg-bucket-upper/[0.07] text-foreground/90",
        "hover:border-bucket-upper/45 hover:bg-bucket-upper/14 hover:text-bucket-upper",
    ),
    core: cn(
        "border-bucket-core/25 bg-bucket-core/[0.07] text-foreground/90",
        "hover:border-bucket-core/45 hover:bg-bucket-core/14 hover:text-bucket-core",
    ),
    power: cn(
        "border-bucket-power/25 bg-bucket-power/[0.07] text-foreground/90",
        "hover:border-bucket-power/45 hover:bg-bucket-power/14 hover:text-bucket-power",
    ),
    accessory: cn(
        "border-bucket-accessory/25 bg-bucket-accessory/[0.07] text-foreground/90",
        "hover:border-bucket-accessory/45 hover:bg-bucket-accessory/14 hover:text-bucket-accessory",
    ),
};

/** Estado seleccionado/asignado — una clase por bucket Tailwind. */
export const PATTERN_BADGE_SELECTED_BUCKET_CLASS: Record<
    UiBucketTailwindKey,
    string
> = {
    lower: "border-bucket-lower/30 bg-bucket-lower/12 text-bucket-lower",
    upper: "border-bucket-upper/30 bg-bucket-upper/12 text-bucket-upper",
    core: "border-bucket-core/30 bg-bucket-core/12 text-bucket-core",
    power: "border-bucket-power/30 bg-bucket-power/12 text-bucket-power",
    accessory:
        "border-bucket-accessory/30 bg-bucket-accessory/12 text-bucket-accessory",
};

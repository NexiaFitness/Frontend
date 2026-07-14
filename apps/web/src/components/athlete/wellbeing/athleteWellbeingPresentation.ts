/**
 * athleteWellbeingPresentation.ts — Check-in pre-sesión premium (V04).
 * Escala 1–3: Bajo / Normal / Alto → pre_fatigue_level.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export type WellbeingOptionTone = "warning" | "primary";

export const WELLBEING_OPTION_LIST = "grid gap-3";

export const WELLBEING_OPTION_BASE = cn(
    NEXIA_GLASS_CARD,
    "flex w-full items-start gap-3 p-4 text-left transition-all duration-150",
    "min-h-touch-athlete motion-safe:active:scale-[0.985] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "disabled:cursor-not-allowed disabled:opacity-50"
);

export const WELLBEING_OPTION_IDLE =
    "border-border/80 hover:border-primary/35 hover:bg-card/55";

export const WELLBEING_OPTION_SELECTED: Record<WellbeingOptionTone, string> = {
    warning: cn(
        "border-warning/45 bg-warning/10",
        "shadow-[0_0_24px_-6px] shadow-warning/35",
        "ring-1 ring-warning/20"
    ),
    primary: cn(
        "border-primary/45 bg-primary/12",
        "shadow-[0_0_24px_-6px] shadow-primary/40",
        "ring-1 ring-primary/20"
    ),
};

export const WELLBEING_OPTION_ICON_WRAP: Record<WellbeingOptionTone, string> = {
    warning: cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        "border border-warning/30 bg-warning/12",
        "shadow-[inset_0_1px_0] shadow-warning/10"
    ),
    primary: cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        "border border-primary/30 bg-primary/12",
        "shadow-[inset_0_1px_0] shadow-primary/10"
    ),
};

export const WELLBEING_OPTION_ICON: Record<WellbeingOptionTone, string> = {
    warning: "size-5 text-warning",
    primary: "size-5 text-primary",
};

export const WELLBEING_OPTION_LABEL = "block text-sm font-semibold text-foreground";

export const WELLBEING_OPTION_HINT =
    "mt-0.5 block text-xs leading-snug text-muted-foreground";

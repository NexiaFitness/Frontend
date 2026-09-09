/**
 * periodBlockCardPresentation.ts — Tokens visuales tarjeta bloque configurado (planificación F2).
 *
 * Paridad Sparkle Flow: glass + rim, tonos apagados (acordeón semanas / PatternBadge).
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";

/** Shell tarjeta bloque — compacta, glass premium. */
export const PERIOD_BLOCK_CARD_SHELL_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative w-full max-w-[19rem]",
    "border-primary/20",
    "transition-all duration-200",
    "hover:border-primary/35 hover:shadow-[0_8px_32px_-12px] hover:shadow-primary/15",
);

export const PERIOD_BLOCK_CARD_HEADER_CLASS = cn(
    "relative z-[1] flex items-start justify-between gap-2 px-4 py-3",
    "bg-gradient-to-b from-primary/[0.07] to-transparent",
    "border-b border-border/60",
);

export const PERIOD_BLOCK_CARD_DATE_DOT_CLASS =
    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80 shadow-[0_0_6px_hsl(var(--primary)/0.45)]";

export const PERIOD_BLOCK_CARD_DATE_TEXT_CLASS =
    "text-sm font-semibold text-foreground leading-snug";

export const PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS = cn(
    "mt-1 inline-flex items-center rounded-md border border-primary/25",
    "bg-primary/8 px-1.5 py-0.5 text-[10px] font-semibold text-primary tabular-nums",
);

export const PERIOD_BLOCK_CARD_ICON_BTN_CLASS =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors";

export const PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS = cn(
    "border-primary/25 bg-primary/8 text-primary",
    "hover:border-primary/40 hover:bg-primary/15",
);

export const PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS = cn(
    "border-destructive/25 bg-destructive/8 text-destructive",
    "hover:border-destructive/40 hover:bg-destructive/15",
);

export const PERIOD_BLOCK_CARD_BODY_CLASS =
    "relative z-[1] grid grid-cols-2 gap-3 px-4 py-3.5";

export const PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS = cn(
    PLATFORM_SECTION_LABEL,
    "mb-2 text-[10px]",
);

export const PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS = "min-w-0 space-y-2";

export const PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS = "min-w-0 space-y-2.5";

export const PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS =
    "relative z-[1] bg-surface-2/25 px-4 py-0.5";

export const PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS = NEXIA_DIVIDER_GLOW;

export const PERIOD_BLOCK_CARD_FOOTER_CLASS =
    "relative z-[1] flex flex-col gap-2 border-t border-border/50 bg-surface-2/20 px-3 py-3 sm:flex-row";

export const PERIOD_BLOCK_CARD_SESSIONS_CLASS =
    "relative z-[1] border-t border-border/40 px-4 py-2.5";

/** Grid contenedor lista de bloques — auto-fill tarjetas estrechas. */
export const PERIOD_BLOCK_CARD_LIST_GRID_CLASS =
    "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(17rem,19rem))]";

/**
 * blockAuthoringSummaryPresentation.ts — Tokens paso Resumen wizard D-PAP.
 *
 * Paridad: PeriodBlockCard (cualidades + carga), modales premium, paso Patrones.
 */

import { cn } from "@/lib/utils";

import {
    AUTHORING_STEP_INNER_PANEL_CLASS,
    AUTHORING_STEP_SECTION_LABEL_CLASS,
} from "./phaseAuthoringPresentation";
import { PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS } from "./periodBlockCardPresentation";

export const BLOCK_AUTHORING_SUMMARY_STACK_CLASS = "space-y-3";

/** Franja superior — vigencia del bloque (una línea). */
export const BLOCK_AUTHORING_SUMMARY_HERO_CLASS = cn(
    AUTHORING_STEP_INNER_PANEL_CLASS,
    "flex items-center justify-center border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent py-2.5 md:py-3",
);

/** Grid principal: cualidades | carga (como PeriodBlockCard). */
export const BLOCK_AUTHORING_SUMMARY_MAIN_GRID_CLASS =
    "grid grid-cols-1 gap-3 md:grid-cols-2";

export const BLOCK_AUTHORING_SUMMARY_SECTION_CLASS = cn(
    AUTHORING_STEP_INNER_PANEL_CLASS,
    "space-y-2 p-3 md:p-3.5",
);

export const BLOCK_AUTHORING_SUMMARY_SECTION_HEADER_CLASS =
    "flex items-center justify-between gap-2";

export const BLOCK_AUTHORING_SUMMARY_SECTION_LABEL_CLASS =
    PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS;

export const BLOCK_AUTHORING_SUMMARY_QUALITIES_STACK_CLASS = "space-y-1.5";

export const BLOCK_AUTHORING_SUMMARY_LOAD_STACK_CLASS = "space-y-2";

/** Días activos — fila compacta de chips (solo lectura). */
export const BLOCK_AUTHORING_SUMMARY_DAYS_ROW_CLASS =
    "flex flex-wrap items-center gap-1.5";

export const BLOCK_AUTHORING_SUMMARY_DAY_CHIP_CLASS = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-full border",
    "border-primary/30 bg-primary/10 text-xs font-semibold text-primary",
    "shadow-[0_0_14px_-6px_hsl(var(--primary)/0.5)]",
);

/** Patrones por día — grid compacto para evitar scroll vertical. */
export const BLOCK_AUTHORING_SUMMARY_PATTERN_GRID_CLASS =
    "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3";

export const BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_CLASS = cn(
    "rounded-lg border border-border/50 bg-surface-2/25 p-2.5 space-y-1.5",
);

export const BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_TITLE_CLASS =
    "text-xs font-semibold tracking-tight text-foreground";

export const BLOCK_AUTHORING_SUMMARY_PATTERN_BADGES_CLASS =
    "flex flex-wrap gap-1 min-w-0";

export const BLOCK_AUTHORING_SUMMARY_PATTERN_EMPTY_CLASS =
    "text-[11px] leading-relaxed text-muted-foreground/90";

/** Meta intro legacy (constructor no-wizard). */
export const BLOCK_AUTHORING_SUMMARY_INTRO_CLASS =
    AUTHORING_STEP_SECTION_LABEL_CLASS;

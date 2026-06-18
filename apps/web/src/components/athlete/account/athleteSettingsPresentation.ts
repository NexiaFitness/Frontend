/**
 * athleteSettingsPresentation.ts — Superficies glass atleta (cuenta, dashboard, sheets).
 * DESIGN_MOBILE §6.7
 */

import { cn } from "@/lib/utils";

/** Contenedor glass — listas settings, acciones, cards en sheet. */
export const ATHLETE_SETTINGS_CARD =
    "overflow-hidden rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm";

/** CTA principal atleta (footer fijo, sheets). */
export const ATHLETE_PRIMARY_CTA = cn(
    "min-h-touch-athlete w-full text-base font-semibold",
    "shadow-[0_8px_28px_-10px] shadow-primary/35",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
);

/** Etiqueta sección uppercase atleta. */
export const ATHLETE_SECTION_LABEL =
    "text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/75";

export const ATHLETE_DIVIDER =
    "h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent";

/** Card táctil en sheet (sesiones, etc.). */
export const ATHLETE_SURFACE_CARD_INTERACTIVE = cn(
    ATHLETE_SETTINGS_CARD,
    "p-4 text-left transition-colors",
    "hover:bg-surface-2/60 active:bg-surface-2 active:scale-[0.995] motion-reduce:active:scale-100"
);

/** Bloque cita / respuesta entrenador dentro de card. */
export const ATHLETE_TRAINER_QUOTE_BLOCK = cn(
    "relative overflow-hidden rounded-lg border border-primary/25",
    "bg-gradient-to-br from-primary/12 via-primary/8 to-transparent",
    "p-3.5 backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-primary/10"
);

export const ATHLETE_TRAINER_QUOTE_LABEL =
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/85";

/** Badge respondido — cyan glass (no verde plano en peek). */
export const ATHLETE_FEEDBACK_RESPONDED_BADGE = cn(
    "inline-flex items-center rounded-full border border-primary/30 bg-primary/10",
    "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
);

/** Card historial feedback (página + peek). */
export const ATHLETE_FEEDBACK_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    "relative backdrop-blur-md p-4 pt-5",
    "shadow-[0_12px_40px_-16px] shadow-black/45",
    "shadow-[inset_0_1px_0] shadow-primary/8"
);

/** Bloque mensaje del atleta — misma receta que entrenador, token `warning` (≠ cyan). */
export const ATHLETE_ATHLETE_MESSAGE_BLOCK = cn(
    "relative overflow-hidden rounded-lg border border-warning/25",
    "bg-gradient-to-br from-warning/12 via-warning/8 to-transparent",
    "p-3.5 backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-warning/10"
);

export const ATHLETE_ATHLETE_MESSAGE_LABEL =
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-warning/85";

export const ATHLETE_ATHLETE_MESSAGE_ACCENT =
    "pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-warning/80 to-warning/20";

/** Pill métrica esfuerzo/fatiga. */
export const ATHLETE_FEEDBACK_METRIC_PILL = cn(
    "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8",
    "px-2.5 py-1 text-xs"
);

export const ATHLETE_FEEDBACK_METRIC_VALUE = "font-semibold tabular-nums text-foreground";

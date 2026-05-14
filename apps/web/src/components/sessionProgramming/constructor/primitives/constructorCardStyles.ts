/**
 * constructorCardStyles.ts — Tokens de estilo compartidos (referencia Lovable).
 * Contexto: cards del constructor por tipo de serie; DESIGN.md tokens semánticos.
 * @author Frontend Team
 * @since v5.3.0
 */

/** Contenedor exterior de cada bloque-card del constructor */
export const CONSTRUCTOR_CARD_CLASS =
    "rounded-lg border border-primary/25 border-l-[3px] border-l-primary bg-card text-card-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.08),inset_3px_0_12px_-8px_hsl(var(--primary)/0.35)] overflow-hidden";

/** Cabecera: bloque + selector tipo serie en la misma línea */
export const CONSTRUCTOR_CARD_HEADER_CLASS =
    "flex items-center justify-between gap-3 border-b border-border/50 bg-surface/40 px-4 py-2";

/** Grupo izquierdo de cabecera (bloque + tipo serie, sin wrap) */
export const CONSTRUCTOR_CARD_HEADER_LEFT_CLASS =
    "flex items-center gap-2";

/** Botón icono de acciones en cabecera */
export const CONSTRUCTOR_HEADER_ICON_BTN_CLASS =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

/** Barra de parámetros de grupo (series, descanso…) */
export const CONSTRUCTOR_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-primary/10 bg-primary/[0.06] px-4 py-2.5";

/** Badge de grupo (SUPERSET A, S1…) */
export const CONSTRUCTOR_GROUP_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase";

/** Etiqueta de campo en barra de grupo */
export const CONSTRUCTOR_FIELD_LABEL_CLASS =
    "text-[11px] text-muted-foreground whitespace-nowrap";

/** Cabecera de columnas de ejercicios */
export const CONSTRUCTOR_COLUMN_HEADER_CLASS =
    "hidden sm:grid gap-3 px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80";

/** Pie de ayuda del grupo */
export const CONSTRUCTOR_FOOTER_HINT_CLASS =
    "border-t border-border/50 px-4 py-2 text-[10px] italic text-muted-foreground/90";

/** Select compacto tipo serie (cabecera) */
export const CONSTRUCTOR_SET_TYPE_SELECT_CLASS =
    "!h-8 !min-h-8 w-[118px] shrink-0 !bg-surface !border-border/70 !text-[11px] !shadow-none hover:!border-primary/40";

/** Punto de estado del bloque (cabecera Lovable) */
export const CONSTRUCTOR_BLOCK_DOT_CLASS =
    "h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]";

/** Combobox compacto en filas de ejercicio */
export const CONSTRUCTOR_MINI_COMBO_CLASS =
    "w-[58px] shrink-0 [&_button]:text-xs [&_button]:px-1.5";

/** Par combo + valor (ancho fijo para alinear filas) */
export const CONSTRUCTOR_FIELD_PAIR_CLASS =
    "flex h-8 w-[102px] shrink-0 items-center gap-1";

/** Input numérico compacto en filas de ejercicio */
export const CONSTRUCTOR_MINI_INPUT_CLASS =
    "h-8 w-[44px] shrink-0 rounded-md border border-border/60 bg-surface px-1.5 py-0 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]";

/** Anillo A1/A2 / S1… */
export const CONSTRUCTOR_SLOT_RING_CLASS =
    "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/45 bg-primary/[0.08] text-[10px] font-bold text-primary";

/** Línea conectora entre anillos */
export const CONSTRUCTOR_SLOT_CONNECTOR_CLASS =
    "absolute left-1/2 top-9 bottom-0 w-px -translate-x-1/2 bg-primary/25";

/** Anillo numerado for_time (verde / emerald) */
export const CONSTRUCTOR_FOR_TIME_SLOT_RING_CLASS =
    "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-500/45 bg-emerald-500/[0.08] text-[10px] font-bold text-emerald-700 dark:text-emerald-400";

export const CONSTRUCTOR_FOR_TIME_SLOT_CONNECTOR_CLASS =
    "absolute left-1/2 top-9 bottom-0 w-px -translate-x-1/2 bg-emerald-500/25";

/** Anillo A1… giant_set (azul primary, mismo acento que superset) */
export const CONSTRUCTOR_GIANT_SET_SLOT_RING_CLASS = CONSTRUCTOR_SLOT_RING_CLASS;

export const CONSTRUCTOR_GIANT_SET_SLOT_CONNECTOR_CLASS = CONSTRUCTOR_SLOT_CONNECTOR_CLASS;

/** Card dropset — acento azul (primary) */
export const CONSTRUCTOR_DROPSET_CARD_CLASS = CONSTRUCTOR_CARD_CLASS;

/** Barra de grupo dropset */
export const CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS = CONSTRUCTOR_GROUP_BAR_CLASS;

/** Badge DROP SET A */
export const CONSTRUCTOR_DROPSET_BADGE_CLASS = CONSTRUCTOR_GROUP_BADGE_CLASS;

/** Anillo MAIN */
export const CONSTRUCTOR_DROP_MAIN_RING_CLASS =
    "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/[0.1] text-[8px] font-bold uppercase tracking-wide text-primary";

/** Anillo DROP n (DROP + número en dos líneas) */
export const CONSTRUCTOR_DROP_STEP_RING_CLASS =
    "z-10 flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full border-2 border-primary/35 bg-primary/[0.06] text-primary";

/** Conector vertical entre drops */
export const CONSTRUCTOR_DROP_CONNECTOR_CLASS =
    "pointer-events-none absolute left-1/2 top-10 bottom-0 w-px -translate-x-1/2 bg-primary/25";

/** Card giant set — acento azul (primary) */
export const CONSTRUCTOR_GIANT_SET_CARD_CLASS = CONSTRUCTOR_CARD_CLASS;

/** Barra de grupo giant set */
export const CONSTRUCTOR_GIANT_SET_GROUP_BAR_CLASS = CONSTRUCTOR_GROUP_BAR_CLASS;

/** Badge GIANT SET A */
export const CONSTRUCTOR_GIANT_SET_BADGE_CLASS = CONSTRUCTOR_GROUP_BADGE_CLASS;

/** Contenedor interior del grupo de ejercicios */
export const CONSTRUCTOR_GIANT_SET_INNER_CLASS =
    "mx-4 mb-3 rounded-md border border-primary/20 bg-primary/[0.04] px-3 pb-3 pt-2";

/** Card for_time — acento verde (emerald) */
export const CONSTRUCTOR_FOR_TIME_CARD_CLASS =
    "rounded-lg border border-emerald-500/25 border-l-[3px] border-l-emerald-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(160_84%_39%/0.08),inset_3px_0_12px_-8px_hsl(160_84%_39%/0.35)] overflow-hidden";

export const CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-emerald-500/10 bg-emerald-500/[0.06] px-4 py-2.5";

export const CONSTRUCTOR_FOR_TIME_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400";

export const CONSTRUCTOR_FOR_TIME_INNER_CLASS =
    "mx-4 mb-3 rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-3 pb-3 pt-2";

/** Card emom — acento púrpura */
export const CONSTRUCTOR_EMOM_CARD_CLASS =
    "rounded-lg border border-purple-500/25 border-l-[3px] border-l-purple-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(280_70%_50%/0.08),inset_3px_0_12px_-8px_hsl(280_70%_50%/0.35)] overflow-hidden";

export const CONSTRUCTOR_EMOM_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-purple-500/10 bg-purple-500/[0.06] px-4 py-2.5";

export const CONSTRUCTOR_EMOM_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-purple-500/35 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-700 uppercase dark:text-purple-400";

export const CONSTRUCTOR_EMOM_INNER_CLASS =
    "mx-4 mb-3 pt-2";

export const CONSTRUCTOR_EMOM_WINDOW_CLASS =
    "rounded-md border border-purple-500/20 bg-purple-500/[0.04] px-3 pb-3 pt-1";

export const CONSTRUCTOR_EMOM_WINDOW_LABEL_CLASS =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-purple-500/35 bg-purple-500/10 text-[10px] font-bold text-purple-700 dark:text-purple-400";

/** Card amrap — acento rojo */
export const CONSTRUCTOR_AMRAP_CARD_CLASS =
    "rounded-lg border border-red-500/25 border-l-[3px] border-l-red-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(0_72%_51%/0.08),inset_3px_0_12px_-8px_hsl(0_72%_51%/0.35)] overflow-hidden";

export const CONSTRUCTOR_AMRAP_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-red-500/10 bg-red-500/[0.06] px-4 py-2.5";

export const CONSTRUCTOR_AMRAP_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase dark:text-red-400";

export const CONSTRUCTOR_AMRAP_SLOT_RING_CLASS =
    "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500/45 bg-red-500/[0.08] text-[10px] font-bold text-red-700 dark:text-red-400";

export const CONSTRUCTOR_AMRAP_SLOT_CONNECTOR_CLASS =
    "absolute left-1/2 top-9 bottom-0 w-px -translate-x-1/2 bg-red-500/25";

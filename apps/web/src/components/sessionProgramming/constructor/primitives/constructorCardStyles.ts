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

/** Card dropset — acento naranja (borde izquierdo y sombra) */
export const CONSTRUCTOR_DROPSET_CARD_CLASS =
    "rounded-lg border border-orange-500/25 border-l-[3px] border-l-orange-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(24_95%_53%/0.08),inset_3px_0_12px_-8px_hsl(24_95%_53%/0.35)] overflow-hidden";

/** Barra de grupo dropset */
export const CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-orange-500/10 bg-orange-500/[0.06] px-4 py-2.5";

/** Badge DROP SET A */
export const CONSTRUCTOR_DROPSET_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-orange-500/35 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400";

/** Anillo MAIN */
export const CONSTRUCTOR_DROP_MAIN_RING_CLASS =
    "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-orange-500/50 bg-orange-500/[0.1] text-[8px] font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400";

/** Anillo DROP n (DROP + número en dos líneas) */
export const CONSTRUCTOR_DROP_STEP_RING_CLASS =
    "z-10 flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full border-2 border-orange-500/35 bg-orange-500/[0.06] text-orange-600 dark:text-orange-400";

/** Conector vertical entre drops */
export const CONSTRUCTOR_DROP_CONNECTOR_CLASS =
    "pointer-events-none absolute left-1/2 top-10 bottom-0 w-px -translate-x-1/2 bg-orange-500/25";

/** Card giant set — acento cyan/teal (borde izquierdo y sombra) */
export const CONSTRUCTOR_GIANT_SET_CARD_CLASS =
    "rounded-lg border border-cyan-500/25 border-l-[3px] border-l-cyan-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(189_94%_43%/0.08),inset_3px_0_12px_-8px_hsl(189_94%_43%/0.35)] overflow-hidden";

/** Barra de grupo giant set */
export const CONSTRUCTOR_GIANT_SET_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-cyan-500/10 bg-cyan-500/[0.06] px-4 py-2.5";

/** Badge GIANT SET A */
export const CONSTRUCTOR_GIANT_SET_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-cyan-700 uppercase dark:text-cyan-400";

/** Contenedor interior del grupo de ejercicios */
export const CONSTRUCTOR_GIANT_SET_INNER_CLASS =
    "mx-4 mb-3 rounded-md border border-cyan-500/20 bg-cyan-500/[0.04] px-3 pb-3 pt-2";

/** Card for_time — acento violeta */
export const CONSTRUCTOR_FOR_TIME_CARD_CLASS =
    "rounded-lg border border-violet-500/25 border-l-[3px] border-l-violet-500 bg-card text-card-foreground shadow-[0_0_0_1px_hsl(263_70%_50%/0.08),inset_3px_0_12px_-8px_hsl(263_70%_50%/0.35)] overflow-hidden";

export const CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS =
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-violet-500/10 bg-violet-500/[0.06] px-4 py-2.5";

export const CONSTRUCTOR_FOR_TIME_BADGE_CLASS =
    "inline-flex shrink-0 items-center rounded-md border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 uppercase dark:text-violet-400";

export const CONSTRUCTOR_FOR_TIME_INNER_CLASS =
    "mx-4 mb-3 rounded-md border border-violet-500/20 bg-violet-500/[0.04] px-3 pb-3 pt-2";

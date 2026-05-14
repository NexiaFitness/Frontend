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
    "flex min-w-0 flex-1 items-center gap-2";

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
    "w-[52px] shrink-0 [&_button]:text-xs";

/** Input numérico compacto en filas de ejercicio */
export const CONSTRUCTOR_MINI_INPUT_CLASS =
    "h-8 w-[44px] shrink-0 rounded-md border border-border/60 bg-surface px-1.5 py-0 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]";

/** Anillo A1/A2 / S1… */
export const CONSTRUCTOR_SLOT_RING_CLASS =
    "z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/45 bg-primary/[0.08] text-[10px] font-bold text-primary";

/** Línea conectora entre anillos */
export const CONSTRUCTOR_SLOT_CONNECTOR_CLASS =
    "absolute left-1/2 top-9 bottom-0 w-px -translate-x-1/2 bg-primary/25";

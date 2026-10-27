/**
 * exercisePickerPresentation.ts — Copy y clases de las filas del selector de ejercicios.
 *
 * Contexto: ExercisePickerRow (selector del constructor de sesión). H4: tres estados de
 * seguridad con significado propio. Contraindicado = destructive en tinte glass; no
 * verificable = warning en tinte glass y con texto (nunca solo color); seguro = añadir.
 * Notas de mantenimiento: receta de tinte de DESIGN_PREMIUM §3.1 (borde /30-/40, fondo
 * /10-/20); sin colores sueltos en el componente.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import { cn } from "@/lib/utils";

export const EXERCISE_PICKER_COPY = {
    unsafeBadge: "LESIÓN",
    unverifiableBadge: "SIN VERIFICAR",
    unsafeTitle: "Contraindicado",
    unverifiableTitle: "No se puede comprobar con la lesión",
    unsafeFallback: "Contraindicado por lesión activa",
    unverifiableFallback: "El ejercicio no tiene acciones articulares en el catálogo.",
    showAlternatives: "Ver alternativas",
    addWithCaution: "Añadir con precaución",
    addUnverified: "Añadir sin verificar",
    batchFailed: "No se pudo comprobar la seguridad. Ningún ejercicio se marca como seguro.",
    retry: "Reintentar",
    uncheckedLabel: "Seguridad sin comprobar",
} as const;

export const EXERCISE_PICKER_ROW =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-2";

export const EXERCISE_PICKER_ROW_FLAGGED = "cursor-pointer opacity-90";

export const EXERCISE_PICKER_ROW_NAME = "flex-1 truncate text-xs";

export const EXERCISE_PICKER_ROW_ADD_ICON = "h-3.5 w-3.5 shrink-0 text-muted-foreground";

/** Sin comprobar (falló el lote): icono neutro, nunca el «+» de un ejercicio seguro. */
export const EXERCISE_PICKER_ROW_UNCHECKED_ICON = "h-3.5 w-3.5 shrink-0 text-muted-foreground/70";

export const EXERCISE_PICKER_ROW_ICON = "h-3 w-3 shrink-0";

export const EXERCISE_PICKER_ROW_ICON_UNSAFE = cn(EXERCISE_PICKER_ROW_ICON, "text-destructive");

export const EXERCISE_PICKER_ROW_ICON_UNVERIFIABLE = cn(EXERCISE_PICKER_ROW_ICON, "text-warning");

const BADGE = "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1";

export const EXERCISE_PICKER_BADGE_UNSAFE = cn(
    BADGE,
    "bg-destructive/20 text-destructive ring-destructive/40"
);

export const EXERCISE_PICKER_BADGE_UNVERIFIABLE = cn(BADGE, "bg-warning/15 text-warning ring-warning/40");

const DETAIL = "mx-1 mb-1 space-y-2 rounded-md border p-2";

export const EXERCISE_PICKER_DETAIL_UNSAFE = cn(
    DETAIL,
    "border-destructive/30 bg-destructive/10 text-destructive"
);

export const EXERCISE_PICKER_DETAIL_UNVERIFIABLE = cn(
    DETAIL,
    "border-warning/30 bg-warning/10 text-warning"
);

export const EXERCISE_PICKER_DETAIL_HEAD = "flex items-start gap-2";

export const EXERCISE_PICKER_DETAIL_BODY = "min-w-0";

export const EXERCISE_PICKER_DETAIL_ICON = "mt-0.5 h-3.5 w-3.5 shrink-0";

export const EXERCISE_PICKER_DETAIL_TITLE = "text-[11px] font-semibold";

export const EXERCISE_PICKER_DETAIL_TEXT = "text-[11px] leading-snug opacity-80";

export const EXERCISE_PICKER_DETAIL_ACTIONS = "flex flex-col gap-2";

const ACTION =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors";

export const EXERCISE_PICKER_ACTION_ALTERNATIVES = cn(
    ACTION,
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
);

export const EXERCISE_PICKER_ACTION_CAUTION = cn(
    ACTION,
    "border-warning/40 bg-warning/10 text-warning hover:bg-warning/20"
);

export const EXERCISE_PICKER_BATCH_ALERT = "mx-3 mt-2 text-xs";

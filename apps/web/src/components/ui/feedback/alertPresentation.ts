/**
 * alertPresentation.ts — Tokens visuales del Alert unificado.
 *
 * Contexto: DESIGN_PREMIUM.md §3 (semántica), §5.2 (icono en trazo, panel tint),
 * §4.4 / 05_ACTION_HIERARCHY.md (acción interna = ghost-primary, nunca outline-primary).
 * Sin shell glass alrededor del icono; sin rojo sólido.
 *
 * Notas de mantenimiento: estilos solo aquí; contrato ARIA en alertContract.ts.
 *
 * @author Frontend Team
 * @since v9.2.0
 * @updated v9.2.1 — slots 1ª línea, dismiss 48px, acción ghost-primary
 */

import { cn } from "@/lib/utils";

import type { AlertVariant } from "./alertContract";

/** Altura de la primera línea de texto (text-sm leading-snug ≈ 1.25rem). */
export const ALERT_FIRST_LINE_SLOT_CLASS =
    "flex h-5 shrink-0 items-center justify-center";

export const ALERT_ROOT_BASE_CLASS = "relative flex items-start gap-3 rounded-lg border p-4";

/** Callout denso (lesiones atleta, filas bajo ejercicio). DESIGN_PREMIUM §2 mobile-first. */
export const ALERT_ROOT_COMPACT_CLASS =
    "relative flex items-start gap-2.5 rounded-lg border px-3 py-2.5";

export const ALERT_BODY_CLASS = "min-w-0 flex-1 text-sm leading-snug text-foreground";

export const ALERT_TITLE_CLASS = "font-medium text-foreground";

export const ALERT_DESCRIPTION_CLASS = "mt-1 text-sm leading-snug text-muted-foreground";

/**
 * Columna cuerpo + acción: en estrecho la acción baja bajo el texto;
 * en sm+ acción a la derecha (05_ACTION_HIERARCHY / §5.2).
 */
export const ALERT_CONTENT_COLUMN_CLASS =
    "flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4";

export const ALERT_ACTION_SLOT_CLASS =
    "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end";

/** Icono Lucide 16px en la acción del Alert (← Volver, reinicio, →). */
export const ALERT_ACTION_ICON_CLASS = "size-4 shrink-0";

/**
 * Hint de variante Button para la única acción del Alert.
 * @see design/platform/05_ACTION_HIERARCHY.md — Acciones dentro de Alert
 */
export const ALERT_ACTION_BUTTON_VARIANT = "ghost-primary" as const;

const VARIANT_CONTAINER: Record<AlertVariant, string> = {
    info: "bg-primary/10 border-primary/30",
    success: "bg-success/10 border-success/30",
    warning: "bg-warning/10 border-warning/30",
    error: "bg-destructive/10 border-destructive/30",
};

const VARIANT_DISMISS: Record<AlertVariant, string> = {
    info: "text-primary/80 hover:text-primary",
    success: "text-success/80 hover:text-success",
    warning: "text-warning/80 hover:text-warning",
    error: "text-destructive/80 hover:text-destructive",
};

export function alertRootClass(
    variant: AlertVariant,
    className?: string,
    compact = false,
): string {
    return cn(
        compact ? ALERT_ROOT_COMPACT_CLASS : ALERT_ROOT_BASE_CLASS,
        VARIANT_CONTAINER[variant],
        className,
    );
}

/** Botón cerrar: X sola; touch 48px móvil; foco visible. */
export function alertDismissButtonClass(variant: AlertVariant): string {
    return cn(
        "inline-flex min-h-touch-athlete min-w-touch-athlete items-center justify-center rounded-md",
        "text-sm transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        VARIANT_DISMISS[variant],
    );
}

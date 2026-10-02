/**
 * alertPresentation.ts — Tokens visuales del Alert unificado.
 *
 * Contexto: DESIGN_PREMIUM.md §3 (semántica) y §5.2 (icono en trazo, panel tint /10).
 * Sin shell glass alrededor del icono; sin rojo sólido.
 *
 * Notas de mantenimiento: estilos solo aquí; el contrato ARIA vive en alertContract.ts.
 *
 * @author Frontend Team
 * @since v9.2.0
 */

import { cn } from "@/lib/utils";

import type { AlertVariant } from "./alertContract";

export const ALERT_ROOT_BASE_CLASS =
    "relative flex items-start gap-3 rounded-lg border p-4";

/** Callout denso (lesiones atleta, filas bajo ejercicio). DESIGN_PREMIUM §2 mobile-first. */
export const ALERT_ROOT_COMPACT_CLASS =
    "relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5";

export const ALERT_BODY_CLASS = "min-w-0 flex-1 text-sm leading-snug text-foreground";

export const ALERT_TITLE_CLASS = "font-medium text-foreground";

export const ALERT_DESCRIPTION_CLASS = "mt-1 text-sm leading-snug text-muted-foreground";

export const ALERT_ACTION_ROW_CLASS =
    "flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4";

export const ALERT_ACTION_SLOT_CLASS =
    "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end";

export const ALERT_ICON_WRAP_CLASS = "mt-0.5 shrink-0";

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

export function alertDismissButtonClass(variant: AlertVariant): string {
    return cn("absolute top-3 right-3 text-sm", VARIANT_DISMISS[variant]);
}

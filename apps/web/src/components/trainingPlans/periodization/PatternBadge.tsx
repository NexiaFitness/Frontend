/**
 * PatternBadge.tsx — Chip/badge reutilizable para patrones de movimiento.
 *
 * Estilo unificado en azul primary (HSL 190 100% 50%), independiente del
 * `ui_bucket`. La diferenciacion ahora es solo por estado:
 * - active:   azul solido (bg-primary + texto sobre primary).
 * - inactive: azul outline (bg-primary/10 + texto primary + ring primary).
 *
 * La prop `uiBucket` se conserva por compatibilidad de la API con los
 * callers existentes, pero no afecta a la apariencia.
 *
 * @author Frontend Team
 * @since Fase C — FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { MovementPatternUiBucket } from "@nexia/shared/types/exercise";

export interface PatternBadgeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    name: string;
    /** Conservado por compatibilidad; no se usa para color (estilo unico azul primary). */
    uiBucket?: MovementPatternUiBucket | string;
    active?: boolean;
    /** Renderizar como span (no interactivo) en lugar de button. Default: button. */
    as?: "button" | "span";
}

const ACTIVE_CLASS =
    "bg-primary text-primary-foreground ring-1 ring-primary";
const INACTIVE_CLASS =
    "bg-primary/10 text-primary ring-1 ring-primary/40 hover:bg-primary/20";

export const PatternBadge = React.forwardRef<HTMLButtonElement | HTMLSpanElement, PatternBadgeProps>(
    ({ name, active = false, uiBucket: _uiBucket, as = "button", className, ...props }, ref) => {
        const baseClasses = cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            as === "button" && "cursor-pointer",
            active ? ACTIVE_CLASS : INACTIVE_CLASS,
            className
        );

        if (as === "span") {
            return (
                <span ref={ref as React.Ref<HTMLSpanElement>} className={baseClasses} {...props}>
                    {name}
                </span>
            );
        }

        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type="button"
                className={baseClasses}
                aria-pressed={active}
                {...props}
            >
                {name}
            </button>
        );
    }
);

PatternBadge.displayName = "PatternBadge";

/**
 * AddPill.tsx — Pill reutilizable «+ etiqueta» para añadir ítems a una lista.
 *
 * H10: reenvía la ref y los atributos ARIA del botón, para servir de disparador de un
 * selector (NexiaSearchPicker: aria-haspopup, aria-expanded, foco de vuelta al cerrar).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    addPillItemClass,
    type AddPillVariant,
} from "./addPillPresentation";

export interface AddPillProps
    extends Pick<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "aria-expanded" | "aria-haspopup" | "aria-controls" | "aria-label" | "id"
    > {
    label: string;
    onClick: () => void;
    variant?: AddPillVariant;
    /** En grid premium, la pill ocupa el ancho de la celda. */
    fullWidth?: boolean;
    disabled?: boolean;
    className?: string;
    /** Prefijo visual antes del label. Default «+». */
    prefix?: string;
}

export const AddPill = React.forwardRef<HTMLButtonElement, AddPillProps>(
    (
        {
            label,
            onClick,
            variant = "premium",
            fullWidth = false,
            disabled = false,
            className,
            prefix = "+",
            ...aria
        },
        ref
    ) => (
        <button
            ref={ref}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                addPillItemClass(variant, fullWidth),
                disabled && "pointer-events-none opacity-45",
                className,
            )}
            {...aria}
        >
            {prefix ? `${prefix} ${label}` : label}
        </button>
    )
);

AddPill.displayName = "AddPill";

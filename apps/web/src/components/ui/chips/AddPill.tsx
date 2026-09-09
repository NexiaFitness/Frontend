/**
 * AddPill.tsx — Pill reutilizable «+ etiqueta» para añadir ítems a una lista.
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    addPillItemClass,
    type AddPillVariant,
} from "./addPillPresentation";

export interface AddPillProps {
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

export const AddPill: React.FC<AddPillProps> = ({
    label,
    onClick,
    variant = "premium",
    fullWidth = false,
    disabled = false,
    className,
    prefix = "+",
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
            addPillItemClass(variant, fullWidth),
            disabled && "pointer-events-none opacity-45",
            className,
        )}
    >
        {prefix ? `${prefix} ${label}` : label}
    </button>
);

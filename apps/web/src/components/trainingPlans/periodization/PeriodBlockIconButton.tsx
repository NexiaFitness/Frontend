/**
 * PeriodBlockIconButton.tsx — Botón icono premium reutilizable (tarjeta bloque, wizard D-PAP).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_DISCARD_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS,
} from "./periodBlockCardPresentation";

export type PeriodBlockIconButtonVariant = "edit" | "delete" | "discard";

const VARIANT_CLASS: Record<PeriodBlockIconButtonVariant, string> = {
    edit: PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS,
    delete: PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS,
    discard: PERIOD_BLOCK_CARD_ICON_BTN_DISCARD_CLASS,
};

export interface PeriodBlockIconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: PeriodBlockIconButtonVariant;
}

export const PeriodBlockIconButton: React.FC<PeriodBlockIconButtonProps> = ({
    variant,
    className,
    type = "button",
    children,
    ...props
}) => (
    <button
        type={type}
        className={cn(
            PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
            VARIANT_CLASS[variant],
            className,
        )}
        {...props}
    >
        {children}
    </button>
);

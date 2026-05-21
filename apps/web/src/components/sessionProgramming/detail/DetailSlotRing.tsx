/**
 * DetailSlotRing.tsx — Anillo identificador de slot (A1, S1, V1, MAIN, DROP…).
 *
 * Reutiliza los tokens de `constructorCardStyles.ts`, solo cambia el variant
 * (primary / for_time / amrap / emom_window / dropset_main / dropset_step).
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { slotTokens, type DetailSlotVariant } from "./detailStyles";

export interface DetailSlotRingProps {
    variant?: DetailSlotVariant;
    /** Etiqueta breve (S1, A2, V1, MAIN…). */
    label: string;
    /** Sub-etiqueta (segunda línea, ej. "1" en dropset). */
    subLabel?: string;
    /** Si true, dibuja conector vertical inferior. */
    withConnector?: boolean;
    className?: string;
}

export const DetailSlotRing: React.FC<DetailSlotRingProps> = ({
    variant = "primary",
    label,
    subLabel,
    withConnector = false,
    className,
}) => {
    const { ringClass, connectorClass } = slotTokens(variant);

    return (
        <div className="relative flex flex-col items-center">
            <div className={cn(ringClass, className)}>
                <span className="leading-none">{label}</span>
                {subLabel && <span className="text-[9px] leading-none">{subLabel}</span>}
            </div>
            {withConnector && connectorClass && (
                <span className={connectorClass} aria-hidden />
            )}
        </div>
    );
};

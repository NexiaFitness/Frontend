/**
 * SatisfactionIcon — Icono de satisfacción (Smile / Meh / Frown)
 *
 * Especificación: VISTA_CLIENTES_SPEC — mapeo por level (API): happy→Smile/success,
 * neutral→Meh/warning, unhappy→Frown/destructive, null→Meh/warning. Si se pasa level, se usa;
 * si no, value 1–10 (legacy): ≥7 Smile, ≥4 Meh, <4 Frown.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SatisfactionLevel } from "@nexia/shared/types/client";

export interface SatisfactionIconProps {
    /** Nivel del API (prioritario si se pasa). Frontend solo renderiza; no calcula. */
    level?: SatisfactionLevel | null;
    /** Satisfacción 1–10 (legacy: 7+ = Smile, 4+ = Meh, <4 = Frown). Usado si level no se pasa. */
    value?: number;
    className?: string;
}

export const SatisfactionIcon: React.FC<SatisfactionIconProps> = ({ level, value = 5, className }) => {
    if (level != null) {
        if (level === "happy") return <Smile className={cn("h-4 w-4 text-success", className)} aria-hidden />;
        if (level === "unhappy") return <Frown className={cn("h-4 w-4 text-destructive", className)} aria-hidden />;
        return <Meh className={cn("h-4 w-4 text-warning", className)} aria-hidden />;
    }
    const clamped = Math.min(10, Math.max(1, value));
    if (clamped >= 7) return <Smile className={cn("h-4 w-4 text-success", className)} aria-hidden />;
    if (clamped >= 4) return <Meh className={cn("h-4 w-4 text-warning", className)} aria-hidden />;
    return <Frown className={cn("h-4 w-4 text-destructive", className)} aria-hidden />;
};

/**
 * SatisfactionIcon — Icono de satisfacción (Smile / Meh / Frown)
 *
 * Especificación: Card de cliente — Mis clientes. value 1–10:
 * ≥7 Smile (success), ≥4 Meh (warning), <4 Frown (destructive).
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SatisfactionIconProps {
    /** Satisfacción 1–10 (7+ = Smile, 4+ = Meh, <4 = Frown) */
    value: number;
    className?: string;
}

export const SatisfactionIcon: React.FC<SatisfactionIconProps> = ({ value, className }) => {
    const clamped = Math.min(10, Math.max(1, value));
    if (clamped >= 7) return <Smile className={cn("h-4 w-4 text-success", className)} aria-hidden />;
    if (clamped >= 4) return <Meh className={cn("h-4 w-4 text-warning", className)} aria-hidden />;
    return <Frown className={cn("h-4 w-4 text-destructive", className)} aria-hidden />;
};

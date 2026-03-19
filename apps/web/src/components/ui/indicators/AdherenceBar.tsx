/**
 * AdherenceBar — Barra de adherencia (0–100%)
 *
 * Especificación: DASHBOARD_LAYOUT_SPEC / Card de cliente — Mis clientes.
 * Colores por token: ≥75 success, ≥50 warning, <50 destructive.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface AdherenceBarProps {
    /** Porcentaje 0–100 */
    value: number;
    className?: string;
}

export const AdherenceBar: React.FC<AdherenceBarProps> = ({ value, className }) => {
    const clamped = Math.min(100, Math.max(0, value));
    const colorClass =
        clamped >= 75 ? "bg-success" : clamped >= 50 ? "bg-warning" : "bg-destructive";

    return (
        <div
            className={cn("h-1.5 w-20 overflow-hidden rounded-full bg-surface-2", className)}
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={cn("h-full rounded-full transition-all", colorClass)}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
};

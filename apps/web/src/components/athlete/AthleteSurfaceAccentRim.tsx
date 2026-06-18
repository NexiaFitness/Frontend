/**
 * AthleteSurfaceAccentRim.tsx — Línea cyan superior (§6.7, reutilizable).
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface AthleteSurfaceAccentRimProps {
    className?: string;
}

export const AthleteSurfaceAccentRim: React.FC<AthleteSurfaceAccentRimProps> = ({
    className,
}) => (
    <div
        className={cn(
            "pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-xl",
            className
        )}
        aria-hidden
    >
        <div className="h-3 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent shadow-[0_0_12px_1px] shadow-primary/25" />
    </div>
);

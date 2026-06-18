/**
 * NexiaGlassAccentRim.tsx — Línea cyan superior card glass (§6.7).
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface NexiaGlassAccentRimProps {
    className?: string;
    /** Ocultar en desktop (p. ej. card auth en lg). */
    mobileOnly?: boolean;
}

export const NexiaGlassAccentRim: React.FC<NexiaGlassAccentRimProps> = ({
    className,
    mobileOnly = false,
}) => (
    <div
        className={cn(
            "pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-xl",
            mobileOnly && "lg:hidden",
            className
        )}
        aria-hidden
    >
        <div className="h-3 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent shadow-[0_0_14px_1px] shadow-primary/30" />
    </div>
);

/**
 * NexiaGlassAccentRim.tsx — Línea cyan superior card glass (§6.7).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER_GLOW, NEXIA_DIVIDER_GLOW_BAND } from "./nexiaDividerPresentation";

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
        <div className={NEXIA_DIVIDER_GLOW_BAND} />
        <div className={cn("absolute inset-x-3 top-0", NEXIA_DIVIDER_GLOW)} />
    </div>
);

/**
 * HintTooltip — Tooltip en hover/focus (D4 Mis clientes).
 * align end/start evita recorte en columnas estrechas del dashboard.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type HintTooltipAlign = "center" | "start" | "end";

export interface HintTooltipProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    side?: "top" | "bottom";
    align?: HintTooltipAlign;
}

const ALIGN_CLASSES: Record<HintTooltipAlign, string> = {
    center: "left-1/2 -translate-x-1/2",
    start: "left-0",
    end: "right-0",
};

export const HintTooltip: React.FC<HintTooltipProps> = ({
    label,
    children,
    className,
    side = "top",
    align = "center",
}) => {
    const [open, setOpen] = useState(false);

    return (
        <span
            className={cn("relative inline-flex max-w-full overflow-visible", className)}
            aria-label={label}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
        >
            {children}
            <span
                role="tooltip"
                className={cn(
                    "pointer-events-none absolute z-[60] w-max max-w-[min(240px,calc(100vw-2rem))]",
                    ALIGN_CLASSES[align],
                    "rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-[10px] leading-snug text-foreground shadow-lg",
                    "whitespace-normal",
                    "transition-opacity duration-150",
                    open ? "opacity-100" : "opacity-0",
                    side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
                )}
            >
                {label}
            </span>
        </span>
    );
};

/**
 * PatternBadge.tsx — Chip/badge reutilizable para patrones de movimiento
 *
 * Muestra un patrón con color visual según su `ui_bucket`.
 * Diseñado para usarse en selectors de patrones (WeeklyStructureEditor, etc.).
 *
 * Tokens: usa las utilidades `bucket-*` definidas en tailwind.config.js / index.css.
 *
 * @author Frontend Team
 * @since Fase C — FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { MovementPatternUiBucket } from "@nexia/shared/types/exercise";

export interface PatternBadgeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    name: string;
    uiBucket: MovementPatternUiBucket | string;
    active?: boolean;
}

const bucketActiveClasses: Record<string, string> = {
    LOWER: "bg-bucket-lower text-bucket-lower-foreground ring-1 ring-bucket-lower",
    UPPER: "bg-bucket-upper text-bucket-upper-foreground ring-1 ring-bucket-upper",
    CORE: "bg-bucket-core text-bucket-core-foreground ring-1 ring-bucket-core",
    POWER_LOCOMOTION: "bg-bucket-power text-bucket-power-foreground ring-1 ring-bucket-power",
    ACCESSORY: "bg-bucket-accessory text-bucket-accessory-foreground ring-1 ring-bucket-accessory",
};

const bucketInactiveClasses: Record<string, string> = {
    LOWER: "bg-bucket-lower/15 text-bucket-lower hover:bg-bucket-lower/25",
    UPPER: "bg-bucket-upper/15 text-bucket-upper hover:bg-bucket-upper/25",
    CORE: "bg-bucket-core/15 text-bucket-core hover:bg-bucket-core/25",
    POWER_LOCOMOTION: "bg-bucket-power/15 text-bucket-power hover:bg-bucket-power/25",
    ACCESSORY: "bg-bucket-accessory/15 text-bucket-accessory hover:bg-bucket-accessory/25",
};

function getBucketKey(raw: string | null | undefined): string {
    if (!raw) return "ACCESSORY";
    const key = String(raw).trim().toUpperCase();
    if (key in bucketActiveClasses) return key;
    return "ACCESSORY";
}

export const PatternBadge = React.forwardRef<HTMLButtonElement, PatternBadgeProps>(
    ({ name, uiBucket, active = false, className, ...props }, ref) => {
        const bucketKey = getBucketKey(uiBucket);
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
                    active ? bucketActiveClasses[bucketKey] : bucketInactiveClasses[bucketKey],
                    className
                )}
                aria-pressed={active}
                {...props}
            >
                {name}
            </button>
        );
    }
);

PatternBadge.displayName = "PatternBadge";

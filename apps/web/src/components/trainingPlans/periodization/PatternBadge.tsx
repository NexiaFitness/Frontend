/**
 * PatternBadge.tsx — Chip de patrón de movimiento por ui_bucket (tokens bucket-*).
 */

import React from "react";

import { uiBucketToTailwindKey, type UiBucketTailwindKey } from "@nexia/shared";

import { cn } from "@/lib/utils";

interface Props {
    name: string;
    uiBucket: string;
    selected?: boolean;
    onClick?: () => void;
    size?: "sm" | "md";
    className?: string;
}

const SELECTED_BUCKET_CLASS: Record<UiBucketTailwindKey, string> = {
    lower: "border-bucket-lower/50 bg-bucket-lower text-bucket-lower-foreground shadow-[0_0_12px_-6px_hsl(var(--bucket-lower)/0.65)]",
    upper: "border-bucket-upper/50 bg-bucket-upper text-bucket-upper-foreground shadow-[0_0_12px_-6px_hsl(var(--bucket-upper)/0.65)]",
    core: "border-bucket-core/50 bg-bucket-core text-bucket-core-foreground shadow-[0_0_12px_-6px_hsl(var(--bucket-core)/0.65)]",
    power: "border-bucket-power/50 bg-bucket-power text-bucket-power-foreground shadow-[0_0_12px_-6px_hsl(var(--bucket-power)/0.65)]",
    accessory:
        "border-bucket-accessory/50 bg-bucket-accessory text-bucket-accessory-foreground shadow-[0_0_12px_-6px_hsl(var(--bucket-accessory)/0.65)]",
};

export const PatternBadge: React.FC<Props> = ({
    name,
    uiBucket,
    selected = false,
    onClick,
    size = "sm",
    className,
}) => {
    const bucketKey = uiBucketToTailwindKey(uiBucket);
    const Component = onClick ? "button" : "span";

    return (
        <Component
            type={onClick ? "button" : undefined}
            onClick={onClick}
            className={cn(
                "inline-flex items-center rounded-md border font-medium transition-colors",
                size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
                selected
                    ? SELECTED_BUCKET_CLASS[bucketKey]
                    : cn(
                          "border-border/60 bg-surface-2/40 text-muted-foreground",
                          onClick &&
                              "hover:border-primary/30 hover:bg-surface-2/80 hover:text-foreground",
                      ),
                className,
            )}
        >
            {name}
        </Component>
    );
};

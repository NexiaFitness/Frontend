/**
 * PatternBadge.tsx — Chip de patrón de movimiento por ui_bucket (tokens bucket-*).
 */

import React from "react";

import { uiBucketToTailwindKey } from "@nexia/shared";

import { cn } from "@/lib/utils";

import {
    PATTERN_BADGE_BASE_CLASS,
    PATTERN_BADGE_IDLE_CLASS,
    PATTERN_BADGE_IDLE_HOVER_CLASS,
    PATTERN_BADGE_SELECTED_BUCKET_CLASS,
    patternBadgeSizeClass,
} from "./patternBadgePresentation";

interface Props {
    name: string;
    uiBucket: string;
    selected?: boolean;
    onClick?: () => void;
    size?: "sm" | "md";
    className?: string;
}

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
                PATTERN_BADGE_BASE_CLASS,
                patternBadgeSizeClass(size),
                selected
                    ? PATTERN_BADGE_SELECTED_BUCKET_CLASS[bucketKey]
                    : cn(
                          PATTERN_BADGE_IDLE_CLASS,
                          onClick && PATTERN_BADGE_IDLE_HOVER_CLASS,
                      ),
                className,
            )}
        >
            {name}
        </Component>
    );
};

/**
 * AthleteEmptyState.tsx — Empty state glass premium reutilizable (portal atleta).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { AthleteEmptyStateIllustration } from "./AthleteEmptyStateIllustration";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_CARD,
    ATHLETE_EMPTY_STATE_CARD_COMPACT,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_PRESETS,
    ATHLETE_EMPTY_STATE_TITLE,
    type AthleteEmptyStateVariant,
} from "./athleteEmptyStatePresentation";

export interface AthleteEmptyStateProps {
    variant: AthleteEmptyStateVariant;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    /** Menos padding — sheets y paneles estrechos. */
    compact?: boolean;
    className?: string;
}

export const AthleteEmptyState: React.FC<AthleteEmptyStateProps> = ({
    variant,
    title,
    description,
    action,
    compact = false,
    className,
}) => {
    const preset = ATHLETE_EMPTY_STATE_PRESETS[variant];

    return (
        <div
            className={cn(
                compact ? ATHLETE_EMPTY_STATE_CARD_COMPACT : ATHLETE_EMPTY_STATE_CARD,
                className
            )}
            role="status"
        >
            <NexiaGlassAccentRim />
            <div className={ATHLETE_EMPTY_STATE_GLOW} aria-hidden />
            <AthleteEmptyStateIllustration variant={variant} />
            <h3 className={cn(ATHLETE_EMPTY_STATE_TITLE, "relative z-[1]")}>
                {title ?? preset.title}
            </h3>
            <p className={cn(ATHLETE_EMPTY_STATE_DESCRIPTION, "relative z-[1]")}>
                {description ?? preset.description}
            </p>
            {action && (
                <div className={ATHLETE_EMPTY_STATE_ACTION}>{action}</div>
            )}
        </div>
    );
};

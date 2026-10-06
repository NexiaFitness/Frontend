/**
 * TrainerWellbeingCheckInBadge — TR-1 chip for pre-session athlete triage.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { useOptionalWellbeingCheckIn } from "@/hooks/trainer/useOptionalWellbeingCheckIn";
import type { WellbeingCheckIn } from "@nexia/shared/types/trainingSessions";
import { wellbeingCheckInShortLabel } from "@nexia/shared/utils/athlete/wellbeingCheckInLabels";
import { cn } from "@/lib/utils";

function toneForLevel(level: number): BadgeVariant {
    if (level <= 1) return "subtle-warning";
    if (level >= 3) return "subtle-success";
    return "subtle";
}

export interface TrainerWellbeingCheckInBadgeViewProps {
    checkIn: WellbeingCheckIn | null | undefined;
    isLoading: boolean;
    isError: boolean;
    className?: string;
    showPending?: boolean;
}

export const TrainerWellbeingCheckInBadgeView: React.FC<
    TrainerWellbeingCheckInBadgeViewProps
> = ({ checkIn, isLoading, isError, className, showPending = true }) => {
    if (isLoading) {
        return (
            <span className={cn("text-xs text-muted-foreground", className)} aria-hidden>
                …
            </span>
        );
    }

    if (isError) {
        return (
            <Badge variant="subtle-warning" className={cn("text-xs font-medium", className)}>
                No se pudo cargar el check-in
            </Badge>
        );
    }

    if (checkIn == null) {
        if (!showPending) return null;
        return (
            <Badge variant="subtle-secondary" className={cn("text-xs font-medium", className)}>
                Sin check-in
            </Badge>
        );
    }

    const level = checkIn.pre_fatigue_level;
    return (
        <Badge
            variant={toneForLevel(level)}
            className={cn("text-xs font-medium", className)}
            aria-label={`Check-in: ${wellbeingCheckInShortLabel(level)}`}
        >
            Check-in: {wellbeingCheckInShortLabel(level)}
        </Badge>
    );
};

export interface TrainerWellbeingCheckInBadgeProps {
    sessionId: number;
    className?: string;
    showPending?: boolean;
}

export const TrainerWellbeingCheckInBadge: React.FC<TrainerWellbeingCheckInBadgeProps> = ({
    sessionId,
    className,
    showPending = true,
}) => {
    const state = useOptionalWellbeingCheckIn(sessionId);
    return (
        <TrainerWellbeingCheckInBadgeView
            {...state}
            className={className}
            showPending={showPending}
        />
    );
};

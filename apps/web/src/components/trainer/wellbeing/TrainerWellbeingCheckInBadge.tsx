/**
 * TrainerWellbeingCheckInBadge — TR-1 chip for pre-session athlete triage.
 */

import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { useOptionalWellbeingCheckIn } from "@/hooks/trainer/useOptionalWellbeingCheckIn";
import { wellbeingCheckInShortLabel } from "@nexia/shared/utils/athlete/wellbeingCheckInLabels";
import { cn } from "@/lib/utils";

function toneForLevel(level: number): BadgeVariant {
    if (level <= 1) return "subtle-warning";
    if (level >= 3) return "subtle-success";
    return "subtle";
}

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
    const { checkIn, isLoading } = useOptionalWellbeingCheckIn(sessionId);

    if (isLoading) {
        return (
            <span className={cn("text-xs text-muted-foreground", className)} aria-hidden>
                …
            </span>
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

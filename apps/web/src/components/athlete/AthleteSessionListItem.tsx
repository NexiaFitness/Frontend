/**
 * AthleteSessionListItem.tsx — Fila sesión premium en lista V02.
 */

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    ATHLETE_SESSION_COMPLETION_BADGE,
    ATHLETE_SESSION_LIST_ITEM,
    ATHLETE_SESSION_LIST_ITEM_TODAY,
    ATHLETE_SESSION_PROGRESS_FILL,
    ATHLETE_SESSION_PROGRESS_TRACK,
    ATHLETE_SESSION_STATUS_BADGE,
    resolveAthleteSessionStatusBadge,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    formatAthleteDate,
    getCompletedSessionCompletionPercent,
    getSessionStatusLabel,
    isPartiallyClosedSession,
    isSessionToday,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface AthleteSessionListItemProps {
    session: TrainingSession;
    onSelect: (sessionId: number) => void;
}

function statusBadgeVariant(session: TrainingSession) {
    return resolveAthleteSessionStatusBadge(session);
}

function completionTone(
    completion: number,
    isPartial: boolean
): "success" | "warning" | "primary" {
    if (isPartial) return "warning";
    if (completion >= 90) return "success";
    if (completion >= 70) return "primary";
    return "warning";
}

export const AthleteSessionListItem: React.FC<AthleteSessionListItemProps> = ({
    session,
    onSelect,
}) => {
    const statusLabel = getSessionStatusLabel(session);
    const completion = getCompletedSessionCompletionPercent(session);
    const isPartial = isPartiallyClosedSession(session);
    const isToday = isSessionToday(session);
    const tone = completion != null ? completionTone(completion, isPartial) : null;
    const statusVariant = statusBadgeVariant(session);

    return (
        <button
            type="button"
            onClick={() => onSelect(session.id)}
            className={cn(
                ATHLETE_SESSION_LIST_ITEM,
                isToday && cn(ATHLETE_SESSION_LIST_ITEM_TODAY, "pt-5"),
                !isToday && "pt-4"
            )}
        >
            {isToday && <NexiaGlassAccentRim />}

            <div className="relative min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={ATHLETE_SESSION_STATUS_BADGE[statusVariant]}>
                        {statusLabel}
                    </span>
                    {session.session_date && (
                        <span className="text-caption text-muted-foreground">
                            {formatAthleteDate(session.session_date)}
                        </span>
                    )}
                    {completion != null && tone && (
                        <span className={ATHLETE_SESSION_COMPLETION_BADGE[tone]}>
                            {Math.round(completion)}%
                        </span>
                    )}
                </div>

                <p className="truncate text-left font-semibold leading-snug text-foreground">
                    {session.session_name}
                </p>

                {session.planned_duration != null && (
                    <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
                        <Clock className="size-3.5 text-primary/60" aria-hidden />
                        {session.planned_duration} min
                    </p>
                )}

                {completion != null && tone && (
                    <div
                        className={ATHLETE_SESSION_PROGRESS_TRACK}
                        aria-label={`Cumplimiento ${Math.round(completion)} por ciento`}
                    >
                        <div
                            className={ATHLETE_SESSION_PROGRESS_FILL[tone]}
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                )}
            </div>

            <ChevronRight
                className="relative size-5 shrink-0 text-primary/55"
                aria-hidden
            />
        </button>
    );
};

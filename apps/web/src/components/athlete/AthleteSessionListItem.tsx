/**
 * AthleteSessionListItem.tsx — Fila sesión en lista V02.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    formatAthleteDate,
    getSessionStatusLabel,
    isSessionToday,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface AthleteSessionListItemProps {
    session: TrainingSession;
    onSelect: (sessionId: number) => void;
}

function statusVariant(session: TrainingSession): "default" | "secondary" | "outline" | "destructive" {
    if (isSessionToday(session)) return "default";
    if (session.status === "completed") return "secondary";
    if (session.status === "skipped") return "destructive";
    return "outline";
}

export const AthleteSessionListItem: React.FC<AthleteSessionListItemProps> = ({
    session,
    onSelect,
}) => {
    const statusLabel = getSessionStatusLabel(session);

    return (
        <button
            type="button"
            onClick={() => onSelect(session.id)}
            className={cn(
                "flex w-full min-h-touch-athlete items-center gap-3 rounded-lg border border-border bg-card p-4 text-left",
                "transition-colors hover:bg-surface-2 active:bg-surface-2"
            )}
        >
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(session)}>{statusLabel}</Badge>
                    {session.session_date && (
                        <span className="text-caption text-muted-foreground">
                            {formatAthleteDate(session.session_date)}
                        </span>
                    )}
                </div>
                <p className="truncate font-semibold text-foreground">{session.session_name}</p>
                {session.planned_duration != null && (
                    <p className="flex items-center gap-1 text-caption text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden />
                        {session.planned_duration} min
                    </p>
                )}
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
    );
};

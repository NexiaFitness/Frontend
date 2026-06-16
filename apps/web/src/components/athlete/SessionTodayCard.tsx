/**
 * SessionTodayCard.tsx — Hero sesión de hoy / descanso.
 * Contexto: portal atleta F0, V01 UX.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { Clock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";

export interface SessionTodayCardProps {
    session: TrainingSession | undefined;
    nextSession: TrainingSession | undefined;
    planProgressPercent: number | null;
    isRestDay: boolean;
    hasActivePlan: boolean;
    onStart: (sessionId: number) => void;
}

export const SessionTodayCard: React.FC<SessionTodayCardProps> = ({
    session,
    nextSession,
    planProgressPercent,
    isRestDay,
    hasActivePlan,
    onStart,
}) => {
    if (!hasActivePlan) {
        return (
            <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                    Tu entrenador te asignará un plan pronto. Mientras tanto, revisa tu cuenta o
                    contacta con tu entrenador.
                </p>
            </div>
        );
    }

    if (isRestDay || !session) {
        return (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <Badge variant="secondary">Día de descanso</Badge>
                <h2 className="text-lg font-bold text-foreground">Recupera bien hoy</h2>
                {nextSession?.session_date ? (
                    <p className="text-sm text-muted-foreground">
                        Próxima sesión:{" "}
                        <span className="font-medium text-foreground">
                            {nextSession.session_name} · {formatAthleteDateLong(nextSession.session_date)}
                        </span>
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">No hay sesiones programadas.</p>
                )}
            </div>
        );
    }

    const progressLabel =
        planProgressPercent != null ? `${Math.round(planProgressPercent)}% del plan` : null;

    return (
        <div
            className={cn(
                "rounded-lg border bg-card p-4 space-y-4",
                "border-primary/30"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                    <Badge variant="default">Hoy</Badge>
                    <h2 className="text-xl font-bold text-foreground">{session.session_name}</h2>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {session.planned_duration != null && (
                    <span className="inline-flex items-center gap-1">
                        <Clock className="size-4" aria-hidden />
                        {session.planned_duration} min
                    </span>
                )}
                <span className="inline-flex items-center gap-1">
                    <Dumbbell className="size-4" aria-hidden />
                    {session.session_type}
                </span>
            </div>

            {progressLabel && (
                <div className="space-y-1">
                    <div className="flex justify-between text-caption text-muted-foreground">
                        <span>Progreso del plan</span>
                        <span>{progressLabel}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, planProgressPercent ?? 0)}%` }}
                        />
                    </div>
                </div>
            )}

            <Button
                variant="primary"
                className="min-h-touch-athlete w-full"
                onClick={() => onStart(session.id)}
            >
                Empezar sesión
            </Button>
        </div>
    );
};

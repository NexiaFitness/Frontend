/**
 * AthleteSessionPeekSheet.tsx — Preview rápido sesión desde swipe V02 (UX-FE-06).
 * Contexto: portal atleta F3b, móvil `< lg`.
 * Contratos: 09_UX §10.2, agent.md §5
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import { Clock, Dumbbell } from "lucide-react";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    formatAthleteDateLong,
    getCompletedSessionCompletionPercent,
    getSessionStatusLabel,
    isPartiallyClosedSession,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";

export interface AthleteSessionPeekSheetProps {
    session: TrainingSession | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenSession: (sessionId: number) => void;
}

function primaryCtaLabel(session: TrainingSession): string {
    if (session.status === "completed") return "Ver sesión";
    return "Empezar";
}

export const AthleteSessionPeekSheet: React.FC<AthleteSessionPeekSheetProps> = ({
    session,
    isOpen,
    onClose,
    onOpenSession,
}) => {
    if (!session) return null;

    const completion = getCompletedSessionCompletionPercent(session);
    const isPartial = isPartiallyClosedSession(session);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Vista rápida"
            footer={
                <Button
                    variant="primary"
                    className="min-h-touch-athlete w-full"
                    onClick={() => {
                        onClose();
                        onOpenSession(session.id);
                    }}
                >
                    {primaryCtaLabel(session)}
                </Button>
            }
        >
            <div className="space-y-3 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant={
                            isPartial
                                ? "subtle-warning"
                                : session.status === "completed"
                                  ? "secondary"
                                  : "outline"
                        }
                    >
                        {getSessionStatusLabel(session)}
                    </Badge>
                    {session.session_date && (
                        <span className="text-caption text-muted-foreground">
                            {formatAthleteDateLong(session.session_date)}
                        </span>
                    )}
                    {completion != null && (
                        <span
                            className={
                                isPartial
                                    ? "text-caption font-medium text-warning"
                                    : "text-caption font-medium text-success"
                            }
                        >
                            {Math.round(completion)}% cumplimiento
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                    {session.session_name}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {session.planned_duration != null && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-4" aria-hidden />
                            {session.planned_duration} min
                        </span>
                    )}
                    {session.session_type && (
                        <span className="inline-flex items-center gap-1.5 capitalize">
                            <Dumbbell className="size-4" aria-hidden />
                            {session.session_type.replace(/_/g, " ")}
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Desliza para ver un resumen sin salir de la lista. Abre la sesión completa
                    para ver ejercicios y entrenar.
                </p>
            </div>
        </BottomSheet>
    );
};

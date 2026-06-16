/**
 * AthleteSessionPreviewPage.tsx — Vista previa sesión atleta (F1).
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { getBlockDisplayName } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    formatAthleteDateLong,
    getSessionStatusLabel,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

export const AthleteSessionPreviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();

    const { data: session, isLoading: loadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const isLoading = loadingSession || loadingStructure;
    const canStart = session?.status !== "completed" && view.totalExercises > 0;

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="space-y-4 px-4 pb-24 pt-4">
                <Alert variant="error">
                    <p className="font-medium">Sesión no encontrada</p>
                    <p className="mt-1 text-muted-foreground">Vuelve a la lista e inténtalo de nuevo.</p>
                </Alert>
                <Button variant="secondary" onClick={() => navigate("/dashboard/sessions")}>
                    Mis sesiones
                </Button>
            </div>
        );
    }

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 lg:pb-8`}>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex min-h-touch-athlete items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Volver
            </button>

            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <Badge variant="outline">{getSessionStatusLabel(session)}</Badge>
                    <h1 className="text-2xl font-bold text-foreground">{session.session_name}</h1>
                    {session.session_date && (
                        <p className="text-sm text-muted-foreground">
                            {formatAthleteDateLong(session.session_date)}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {session.planned_duration != null && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-4" aria-hidden />
                            {session.planned_duration} min estimados
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Dumbbell className="size-4" aria-hidden />
                        {view.totalExercises} ejercicios · {view.totalSets} series
                    </span>
                </div>

                {session.notes && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="text-caption font-medium text-muted-foreground">Notas del entrenador</p>
                        <p className="mt-1 text-sm text-foreground">{session.notes}</p>
                    </div>
                )}

                {view.blocks.length > 0 ? (
                    <div className="space-y-3">
                        {view.blocks.map((block) => (
                            <div
                                key={block.blockId}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <p className="text-sm font-semibold text-foreground">
                                    {getBlockDisplayName(block.blockTypeName)}
                                </p>
                                <ul className="mt-2 space-y-1">
                                    {block.groups.flatMap((group) =>
                                        group.slots.map((slot) => (
                                            <li
                                                key={`${group.groupId}-${slot.slotLabel}`}
                                                className="text-sm text-muted-foreground"
                                            >
                                                {slot.exerciseName}
                                                {slot.sets.length > 1 && (
                                                    <span className="text-caption">
                                                        {" "}
                                                        · {slot.sets.length} series
                                                    </span>
                                                )}
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Alert variant="info">
                        <p className="font-medium">Sin ejercicios todavía</p>
                        <p className="mt-1 text-muted-foreground">
                            Tu entrenador aún no ha publicado el contenido de esta sesión.
                        </p>
                    </Alert>
                )}
            </div>

            <AthleteFixedFooter size="single">
                {session.status === "completed" ? (
                    <Button
                        variant="primary"
                        className="min-h-touch-athlete w-full"
                        onClick={() => navigate(`/dashboard/sessions/${sessionId}/feedback`)}
                    >
                        Enviar feedback
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        className="min-h-touch-athlete w-full"
                        disabled={!canStart}
                        onClick={() => navigate(`/dashboard/sessions/${sessionId}/run`)}
                    >
                        Empezar entrenamiento
                    </Button>
                )}
            </AthleteFixedFooter>
        </div>
    );
};

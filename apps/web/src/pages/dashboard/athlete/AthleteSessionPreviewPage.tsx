/**
 * AthleteSessionPreviewPage.tsx — Vista previa sesión atleta (F1 / F3b-FE-01).
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { getBlockDisplayName } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    formatAthleteDateLong,
    getSessionStatusLabel,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import {
    buildPreviewConflictSummary,
    collectSessionExerciseRefs,
    formatInjuryPrecautionCount,
    injuryAlertIsDanger,
} from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import { AthleteContextStrip } from "@/components/athlete/AthleteContextStrip";
import { AthleteInjuriesBanner } from "@/components/athlete/AthleteInjuriesBanner";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { WellbeingCheckInModal } from "@/components/athlete/WellbeingCheckInModal";
import { useWellbeingCheckIn } from "@/hooks/athlete/useWellbeingCheckIn";
import { useAthleteInjuries } from "@/hooks/athlete/useAthleteInjuries";
import { useAthleteSessionInjuryAlerts } from "@/hooks/athlete/useAthleteSessionInjuryAlerts";
import { cn } from "@/lib/utils";

export const AthleteSessionPreviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [wellbeingOpen, setWellbeingOpen] = useState(false);
    const [injurySheetOpen, setInjurySheetOpen] = useState(false);
    const { submit, isLoading: submittingWellbeing } = useWellbeingCheckIn(sessionId);
    const { clientId } = useAthleteContext();
    const { activeInjuries, isLoading: loadingInjuries } = useAthleteInjuries();
    const isDesktop = useIsAthleteDesktopLayout();

    const { data: session, isLoading: loadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const sessionExercises = useMemo(() => collectSessionExerciseRefs(view), [view]);
    const hasActiveInjuries = activeInjuries.length > 0;

    const { conflicts, conflictByExerciseId, isChecking } = useAthleteSessionInjuryAlerts(
        clientId,
        sessionExercises,
        hasActiveInjuries && sessionExercises.length > 0
    );

    const conflictCount = conflicts.length;
    const hasDangerConflict = conflicts.some((c) => injuryAlertIsDanger(c.alert));

    const showMobileSoftStrip =
        !isDesktop && hasActiveInjuries && !isChecking && conflictCount === 0;
    const showMobileConflictSummary =
        !isDesktop && hasActiveInjuries && !isChecking && conflictCount > 0;

    const mobileConflictSummary = showMobileConflictSummary
        ? buildPreviewConflictSummary(conflictCount, activeInjuries)
        : null;

    const trainerNote =
        session?.notes && hasHumanTrainerNote(session.notes)
            ? formatTrainerNoteForAthlete(session.notes)
            : null;

    const isLoading = loadingSession || loadingStructure || loadingInjuries;
    const canStart = session?.status !== "completed" && view.totalExercises > 0;

    const handleOpenInjurySheet = () => {
        setInjurySheetOpen(true);
    };

    const handleStartClick = () => {
        setWellbeingOpen(true);
    };

    const handleWellbeingSubmit = async (level: 1 | 2 | 3) => {
        try {
            await submit(level);
            setWellbeingOpen(false);
            navigate(`/dashboard/sessions/${sessionId}/run`);
        } catch {
            showToast("error", "No se pudo guardar el check-in");
        }
    };

    if (isLoading) {
        return <AthletePageLoading variant="session-preview" />;
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

                {!loadingInjuries &&
                    (isDesktop ? (
                        hasActiveInjuries && (
                            <AthleteInjuriesBanner
                                injuries={activeInjuries}
                                conflicts={conflicts}
                                isCheckingConflicts={isChecking}
                                onConsultTrainer={handleOpenInjurySheet}
                            />
                        )
                    ) : (
                        showMobileSoftStrip && (
                            <AthleteContextStrip
                                isOnline
                                pendingCount={0}
                                injuries={activeInjuries}
                            />
                        )
                    ))}

                {trainerNote && (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="text-caption font-medium text-muted-foreground">
                            Notas del entrenador
                        </p>
                        <p className="mt-1 text-sm text-foreground">{trainerNote}</p>
                    </div>
                )}

                {view.blocks.length > 0 ? (
                    <div className="space-y-3">
                        {view.blocks.map((block, blockIndex) => (
                            <div
                                key={block.blockId}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {getBlockDisplayName(block.blockTypeName)}
                                    </p>
                                    {blockIndex === 0 &&
                                        showMobileConflictSummary &&
                                        conflictCount > 0 && (
                                            <span className="text-caption font-medium text-warning">
                                                {formatInjuryPrecautionCount(conflictCount)}
                                            </span>
                                        )}
                                </div>

                                {blockIndex === 0 && showMobileConflictSummary && mobileConflictSummary && (
                                    <AthleteInjuryCallout
                                        className="mt-3"
                                        message={mobileConflictSummary}
                                        isDanger={hasDangerConflict}
                                        onConsult={handleOpenInjurySheet}
                                    />
                                )}

                                <ul className="mt-2 space-y-1">
                                    {block.groups.flatMap((group) =>
                                        group.slots.map((slot) => {
                                            const conflict = conflictByExerciseId.get(
                                                slot.exerciseId
                                            );
                                            return (
                                                <li
                                                    key={`${group.groupId}-${slot.slotLabel}`}
                                                    className={cn(
                                                        "flex items-start gap-2 rounded-md py-1 text-sm",
                                                        conflict
                                                            ? "border-l-2 border-warning/60 pl-2 text-warning"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {conflict && (
                                                        <AlertTriangle
                                                            className="mt-0.5 size-4 shrink-0"
                                                            aria-label="Posible conflicto con lesión"
                                                        />
                                                    )}
                                                    <span>
                                                        {slot.exerciseName}
                                                        {slot.sets.length > 1 && (
                                                            <span className="text-caption">
                                                                {" "}
                                                                · {slot.sets.length} series
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })
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
                        onClick={handleStartClick}
                    >
                        Empezar entrenamiento
                    </Button>
                )}
            </AthleteFixedFooter>

            <WellbeingCheckInModal
                isOpen={wellbeingOpen}
                onClose={() => setWellbeingOpen(false)}
                onSubmit={handleWellbeingSubmit}
                isSubmitting={submittingWellbeing}
            />

            {hasActiveInjuries && (
                <AthleteInjuryConsultSheet
                    isOpen={injurySheetOpen}
                    onClose={() => setInjurySheetOpen(false)}
                    injuries={activeInjuries}
                />
            )}
        </div>
    );
};

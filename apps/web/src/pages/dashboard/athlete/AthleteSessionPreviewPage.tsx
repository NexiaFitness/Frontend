/**
 * AthleteSessionPreviewPage.tsx — Vista previa sesión atleta (F1 / F3b-FE-01).
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useGetClientFeedbackQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import {
    buildPreviewConflictSummary,
    collectSessionExerciseRefs,
    injuryAlertIsDanger,
} from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import { sessionHasClientFeedback } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";
import { AthleteContextStrip } from "@/components/athlete/AthleteContextStrip";
import { AthleteInjuriesBanner } from "@/components/athlete/AthleteInjuriesBanner";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PRIMARY_CTA,
    ATHLETE_TRAINER_QUOTE_BLOCK,
    ATHLETE_TRAINER_QUOTE_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { AthleteSessionPreviewHeader, AthleteSessionExercisesLabel } from "@/components/athlete/sessions/AthleteSessionPreviewHeader";
import { AthleteSessionExerciseList } from "@/components/athlete/sessions/AthleteSessionExerciseList";
import { AthleteSessionLoadsPanel } from "@/components/athlete/sessions/AthleteSessionLoadsPanel";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import {
    ATHLETE_PAGE,
    ATHLETE_STICKY_FOOTER_SPACER,
} from "@/components/athlete/layout/athleteLayoutClasses";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { WellbeingCheckInSheet } from "@/components/athlete/wellbeing/WellbeingCheckInSheet";
import { useWellbeingCheckIn } from "@/hooks/athlete/useWellbeingCheckIn";
import { useAthleteInjuries } from "@/hooks/athlete/useAthleteInjuries";
import { useAthleteSessionInjuryAlerts } from "@/hooks/athlete/useAthleteSessionInjuryAlerts";
import { useAthleteSessionLoads } from "@/hooks/athlete/useAthleteSessionLoads";
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

    const sessionLoads = useAthleteSessionLoads(
        session?.status === "completed" ? session.session_date : null
    );
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const { data: feedbackList = [] } = useGetClientFeedbackQuery(
        { clientId: clientId ?? 0, limit: 50 },
        { skip: !clientId }
    );
    const hasSessionFeedback = sessionHasClientFeedback(sessionId, feedbackList);

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
            <div className={cn(ATHLETE_PAGE, "space-y-4")}>
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
        <div className={cn(ATHLETE_PAGE, "flex min-h-full flex-col")}>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className={cn(ATHLETE_BACK_LINK, "mb-4")}
            >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Volver
            </button>

            <div
                className={cn(
                    "flex-1 space-y-4",
                    ATHLETE_STICKY_FOOTER_SPACER.single
                )}
            >
                <AthleteSessionPreviewHeader
                    session={session}
                    exerciseCount={view.totalExercises}
                    setCount={view.totalSets}
                />

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
                    <div className={ATHLETE_TRAINER_QUOTE_BLOCK}>
                        <div
                            className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary/80 to-primary/20"
                            aria-hidden
                        />
                        <p className={ATHLETE_TRAINER_QUOTE_LABEL}>Notas del entrenador</p>
                        <p className="mt-1.5 pl-2 text-sm leading-relaxed text-foreground">
                            {trainerNote}
                        </p>
                    </div>
                )}

                {view.blocks.length > 0 ? (
                    <div className="space-y-3">
                        <AthleteSessionExercisesLabel />
                        <AthleteSessionExerciseList
                            blocks={view.blocks}
                            conflictByExerciseId={conflictByExerciseId}
                            conflictCount={conflictCount}
                            showConflictSummary={showMobileConflictSummary}
                            mobileConflictSummary={mobileConflictSummary}
                            hasDangerConflict={hasDangerConflict}
                            onConsult={handleOpenInjurySheet}
                        />
                    </div>
                ) : (
                    <Alert variant="info">
                        <p className="font-medium">Sin ejercicios todavía</p>
                        <p className="mt-1 text-muted-foreground">
                            Tu entrenador aún no ha publicado el contenido de esta sesión.
                        </p>
                    </Alert>
                )}

                {session.status === "completed" && (
                    <AthleteSessionLoadsPanel
                        loads={sessionLoads.loads}
                        previousSession={sessionLoads.previousSession}
                    />
                )}
            </div>

            <AthleteFixedFooter size="single">
                {session.status === "completed" ? (
                    <Button
                        variant="primary"
                        className={ATHLETE_PRIMARY_CTA}
                        onClick={() =>
                            navigate(
                                hasSessionFeedback
                                    ? "/dashboard/feedback"
                                    : `/dashboard/sessions/${sessionId}/feedback`
                            )
                        }
                    >
                        {hasSessionFeedback ? "Ver lo que enviaste" : "Enviar feedback"}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        className={ATHLETE_PRIMARY_CTA}
                        disabled={!canStart}
                        onClick={handleStartClick}
                    >
                        Empezar entrenamiento
                    </Button>
                )}
            </AthleteFixedFooter>

            <WellbeingCheckInSheet
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
                    sessionId={sessionId}
                    sessionCompleted={session.status === "completed"}
                    hasSessionFeedback={hasSessionFeedback}
                />
            )}
        </div>
    );
};

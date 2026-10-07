/**
 * AthleteSessionPreviewPage.tsx — Vista previa sesión atleta (F1 / F3b-FE-01).
 */

import React, { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useGetClientFeedbackQuery } from "@nexia/shared/api/clientsApi";
import {
    useGetTrainingSessionQuery,
    useGetWellbeingCheckInQuery,
} from "@nexia/shared/api/trainingSessionsApi";
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
import { ATHLETE_SESSION_BACK_FROM_AGENDA_LABEL } from "@/components/athlete/sessions/athleteSessionsPresentation";
import { ATHLETE_SESSION_NAV_FROM_AGENDA } from "@nexia/shared/utils/athlete/athleteAgendaNavigation";
import { AthleteSessionPrescriptionMap } from "@/components/athlete/sessions/AthleteSessionPrescriptionMap";
import { AthleteSessionLogBlockList } from "@/components/athlete/sessions/AthleteSessionLogBlockList";
import { AthleteSessionLogBlockSheet } from "@/components/athlete/sessions/AthleteSessionLogBlockSheet";
import { useAthleteSessionLog } from "@/hooks/athlete/useAthleteSessionLog";
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
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import {
    isPastSessionDate,
    shouldFetchAthleteSessionLogProgress,
} from "@nexia/shared/utils/athlete/athleteSessionRegistrationPolicy";
import { resolveAgendaTrainingHeadline } from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import { cn } from "@/lib/utils";

export const AthleteSessionPreviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const backLabel =
        (location.state as { from?: string } | null)?.from === ATHLETE_SESSION_NAV_FROM_AGENDA
            ? ATHLETE_SESSION_BACK_FROM_AGENDA_LABEL
            : "Volver";
    const { showToast } = useToast();
    const [wellbeingOpen, setWellbeingOpen] = useState(false);
    const [wellbeingAfterAction, setWellbeingAfterAction] = useState<"run" | "log" | null>(
        null
    );
    const [injurySheetOpen, setInjurySheetOpen] = useState(false);
    const [terminateConfirmOpen, setTerminateConfirmOpen] = useState(false);
    const terminateSubtitleId = useId();
    const terminateBodyId = useId();
    const terminateDescribedBy = `${terminateSubtitleId} ${terminateBodyId}`;
    const { submit, isLoading: submittingWellbeing } = useWellbeingCheckIn(sessionId);
    const { clientId } = useAthleteContext();
    const { activeInjuries, isLoading: loadingInjuries } = useAthleteInjuries();
    const isDesktop = useIsAthleteDesktopLayout();

    const { data: session, isLoading: loadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });

    const skipWellbeingLookup =
        !sessionId ||
        !session ||
        session.status === "completed" ||
        isPastSessionDate(session.session_date);
    const { data: wellbeingCheckIn, isFetching: loadingWellbeingCheckIn } =
        useGetWellbeingCheckInQuery(sessionId, { skip: skipWellbeingLookup });

    const sessionLoads = useAthleteSessionLoads(
        session?.status === "completed" ? session.session_date : null
    );
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const sessionLog = useAthleteSessionLog({
        sessionId,
        view,
        sessionName: session?.session_name ?? "Sesión",
        sessionDate: session?.session_date ?? null,
        enabled: shouldFetchAthleteSessionLogProgress(
            sessionId,
            session?.status,
            session?.session_date
        ),
    });

    const { enterLogMode, registrationEditable: logRegistrationEditable } = sessionLog;

    const needsWellbeingBeforeLog =
        !skipWellbeingLookup && !wellbeingCheckIn && !loadingWellbeingCheckIn;

    const requestEnterLogMode = React.useCallback(() => {
        if (!logRegistrationEditable) {
            enterLogMode();
            return;
        }
        if (needsWellbeingBeforeLog) {
            setWellbeingAfterAction("log");
            setWellbeingOpen(true);
            return;
        }
        enterLogMode();
    }, [needsWellbeingBeforeLog, enterLogMode, logRegistrationEditable]);

    const autoLogFromQueryRef = React.useRef(false);
    useEffect(() => {
        if (searchParams.get("mode") !== "log") {
            autoLogFromQueryRef.current = false;
            return;
        }
        if (!logRegistrationEditable || autoLogFromQueryRef.current) {
            return;
        }
        if (!skipWellbeingLookup && loadingWellbeingCheckIn) {
            return;
        }
        autoLogFromQueryRef.current = true;
        requestEnterLogMode();
    }, [
        searchParams,
        logRegistrationEditable,
        skipWellbeingLookup,
        loadingWellbeingCheckIn,
        requestEnterLogMode,
    ]);

    const { data: feedbackList = [] } = useGetClientFeedbackQuery(
        { clientId: clientId ?? 0, limit: 50 },
        { skip: !clientId }
    );
    const hasSessionFeedback = sessionHasClientFeedback(sessionId, feedbackList);

    const sessionHeadline = useMemo(
        () => (session ? resolveAgendaTrainingHeadline(session) : null),
        [session]
    );

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

    const isLoading =
        loadingSession || loadingStructure || loadingInjuries || sessionLog.isProgressLoading;
    const canStart = session?.status !== "completed" && view.totalExercises > 0;
    const hasPartialLogProgress = useMemo(
        () =>
            sessionLog.logBlocks.some((b) => b.status === "registered") &&
            sessionLog.logBlocks.some((b) => b.status === "pending"),
        [sessionLog.logBlocks]
    );
    const showLogFooter =
        session?.status !== "completed" &&
        sessionLog.registrationEditable &&
        (sessionLog.logMode || hasPartialLogProgress);

    const handleOpenInjurySheet = () => {
        setInjurySheetOpen(true);
    };

    const handleStartClick = () => {
        setWellbeingAfterAction("run");
        setWellbeingOpen(true);
    };

    const goToRun = () => {
        navigate(`/dashboard/sessions/${sessionId}/run`);
    };

    const handleWellbeingSubmit = async (level: 1 | 2 | 3) => {
        const after = wellbeingAfterAction ?? "run";
        const result = await submit(level);
        setWellbeingOpen(false);
        setWellbeingAfterAction(null);
        if (result === "failed") {
            showToast(
                "warning",
                "No se pudo guardar el check-in. Puedes entrenar igualmente."
            );
        }
        if (after === "log") {
            sessionLog.enterLogMode();
        } else {
            goToRun();
        }
    };

    const handleWellbeingSkip = () => {
        const after = wellbeingAfterAction ?? "run";
        setWellbeingOpen(false);
        setWellbeingAfterAction(null);
        if (after === "log") {
            sessionLog.enterLogMode();
        } else {
            goToRun();
        }
    };

    if (isLoading) {
        return <AthletePageLoading variant="session-preview" />;
    }

    if (!session) {
        return (
            <div className={cn(ATHLETE_PAGE, "space-y-4")}>
                <Alert
                    variant="error"
                    title="Sesión no encontrada"
                    description="Vuelve a la lista e inténtalo de nuevo."
                />
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
                className={cn(ATHLETE_BACK_LINK, "mb-4 self-start")}
            >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{backLabel}</span>
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

                {session.status !== "completed" && !sessionLog.registrationEditable ? (
                    <Alert
                        variant="warning"
                        title="Plazo de registro cerrado"
                        description="Solo puedes registrar o editar una sesión hasta 7 días después de su fecha."
                    />
                ) : null}

                {sessionLog.saveError && !sessionLog.activeBlock ? (
                    <Alert variant="error" title="Registro" description={sessionLog.saveError} />
                ) : null}

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

                {!isDesktop && (sessionLog.syncPendingCount > 0 || !sessionLog.isOnline) ? (
                    <AthleteContextStrip
                        isOnline={sessionLog.isOnline}
                        pendingCount={sessionLog.syncPendingCount}
                        injuries={activeInjuries}
                    />
                ) : null}

                {view.blocks.length > 0 ? (
                    <div className="space-y-3">
                        <AthleteSessionExercisesLabel />
                        {sessionLog.logMode ? (
                            <AthleteSessionLogBlockList
                                blocks={sessionLog.logBlocks}
                                onBlockPress={sessionLog.openBlock}
                            />
                        ) : (
                            <AthleteSessionPrescriptionMap
                                blocks={view.blocks}
                                sessionHeadline={sessionHeadline}
                                conflictByExerciseId={conflictByExerciseId}
                                conflictCount={conflictCount}
                                showConflictSummary={showMobileConflictSummary}
                                mobileConflictSummary={mobileConflictSummary}
                                hasDangerConflict={hasDangerConflict}
                                onConsult={handleOpenInjurySheet}
                            />
                        )}
                    </div>
                ) : (
                    <Alert
                        variant="info"
                        title="Sin ejercicios todavía"
                        description="Tu entrenador aún no ha publicado el contenido de esta sesión."
                    />
                )}

                {session.status === "completed" && (
                    <>
                        <AthleteSessionLoadsPanel
                            loads={sessionLoads.loads}
                            previousSession={sessionLoads.previousSession}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => navigate(`/dashboard/sessions/${sessionId}/summary`)}
                        >
                            Ver resumen de la sesión
                        </Button>
                    </>
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
                ) : showLogFooter ? (
                    <div className="flex w-full flex-col gap-2">
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            onClick={() => {
                                if (!sessionLog.logMode) requestEnterLogMode();
                                else if (sessionLog.pendingBlockCount === 0) {
                                    void sessionLog
                                        .completeSessionIfReady()
                                        .then((ok) => {
                                            if (ok) {
                                                navigate(
                                                    `/dashboard/sessions/${sessionId}/feedback`
                                                );
                                            }
                                        });
                                }
                            }}
                        >
                            {sessionLog.logMode && sessionLog.pendingBlockCount === 0
                                ? "Ir al feedback"
                                : `Completar registro (${sessionLog.pendingBlockCount})`}
                        </Button>
                        {!sessionLog.logMode ? (
                            <Button
                                variant="secondary"
                                className="min-h-touch-athlete w-full"
                                disabled={!canStart}
                                onClick={handleStartClick}
                            >
                                Empezar entrenamiento
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                className="min-h-touch-athlete w-full text-muted-foreground"
                                onClick={sessionLog.exitLogMode}
                            >
                                Ver detalle de la sesión
                            </Button>
                        )}
                        {sessionLog.logMode && sessionLog.pendingBlockCount > 0 ? (
                            <Button
                                variant="ghost"
                                className="min-h-touch-athlete w-full text-muted-foreground"
                                onClick={() => setTerminateConfirmOpen(true)}
                            >
                                Terminar sesión
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-2">
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            disabled={!canStart}
                            onClick={handleStartClick}
                        >
                            Empezar entrenamiento
                        </Button>
                        {sessionLog.registrationEditable ? (
                            <Button
                                variant="secondary"
                                className="min-h-touch-athlete w-full"
                                disabled={!canStart}
                                onClick={requestEnterLogMode}
                            >
                                Registrar al terminar
                            </Button>
                        ) : null}
                    </div>
                )}
            </AthleteFixedFooter>

            <AthleteSessionLogBlockSheet
                isOpen={sessionLog.activeBlock != null}
                block={sessionLog.activeBlock}
                draft={sessionLog.blockDraft}
                onDraftChange={sessionLog.setBlockDraft}
                onClose={sessionLog.closeBlock}
                onSave={() => void sessionLog.saveActiveBlock()}
                onMarkNotPerformed={() => void sessionLog.markBlockNotPerformed()}
                isSaving={sessionLog.isSavingBlock}
                errorMessage={sessionLog.saveError}
                isOnline={sessionLog.isOnline}
            />

            <BottomSheet
                isOpen={terminateConfirmOpen}
                onClose={() => setTerminateConfirmOpen(false)}
                title="¿Terminar igualmente?"
                subtitleId={terminateSubtitleId}
                subtitle={
                    sessionLog.pendingBlockCount === 1
                        ? "Queda 1 bloque sin registrar. Los bloques pendientes seguirán marcados como no registrados."
                        : `Quedan ${sessionLog.pendingBlockCount} bloques sin registrar. Los bloques pendientes seguirán marcados como no registrados.`
                }
                footer={
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            aria-describedby={terminateDescribedBy}
                            onClick={() => {
                                void sessionLog.forceCompleteSession().then((ok) => {
                                    if (ok) {
                                        setTerminateConfirmOpen(false);
                                        navigate(`/dashboard/sessions/${sessionId}/feedback`);
                                    }
                                });
                            }}
                        >
                            Terminar e ir al feedback
                        </Button>
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => setTerminateConfirmOpen(false)}
                        >
                            Seguir registrando
                        </Button>
                    </div>
                }
            >
                <p id={terminateBodyId} className="px-1 text-sm text-muted-foreground">
                    Podrás volver más tarde desde «Mis sesiones» para completar el registro.
                </p>
            </BottomSheet>

            <WellbeingCheckInSheet
                isOpen={wellbeingOpen}
                onClose={() => {
                    setWellbeingOpen(false);
                    setWellbeingAfterAction(null);
                }}
                onSubmit={handleWellbeingSubmit}
                onSkip={handleWellbeingSkip}
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

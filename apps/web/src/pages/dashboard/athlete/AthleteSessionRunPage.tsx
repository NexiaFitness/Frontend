/**
 * AthleteSessionRunPage.tsx — Ejecución sesión atleta (F1 100%, DESIGN §7.4, §5a/B.2 rest).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import { AthletePrBanner } from "@/components/athlete/AthletePrBanner";
import { OfflineSessionBadge } from "@/components/athlete/OfflineSessionBadge";
import { ExerciseStepView } from "@/components/athlete/execution/ExerciseStepView";
import { GroupRoundStepView } from "@/components/athlete/execution/GroupRoundStepView";
import { TimedBlockStepView } from "@/components/athlete/execution/TimedBlockStepView";
import { AthleteRunStepShell } from "@/components/athlete/execution/AthleteRunStepShell";
import { AthleteExerciseTechniqueSheet } from "@/components/athlete/execution/AthleteExerciseTechniqueSheet";
import type { AthleteExerciseTechniqueTarget } from "@/components/athlete/execution/athleteExerciseTechniqueUtils";
import { RestTimerOverlay } from "@/components/athlete/execution/RestTimerOverlay";
import { Button } from "@/components/ui/buttons";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteRunChromeHeader } from "@/components/athlete/execution/AthleteRunChromeHeader";
import { useAthleteInjuries } from "@/hooks/athlete/useAthleteInjuries";
import { useAthleteSessionInjuryAlerts } from "@/hooks/athlete/useAthleteSessionInjuryAlerts";
import { useAthleteSessionRun } from "@/hooks/athlete/useAthleteSessionRun";
import { useAthleteRunExerciseNotes } from "@/hooks/athlete/useAthleteRunExerciseNotes";
import { useGetAthleteRunProgressQuery } from "@nexia/shared/api/athleteApi";
import { useOnlineStatus } from "@nexia/shared/hooks/offline/useOnlineStatus";
import { blockExerciseIdsForRunStep } from "@nexia/shared/utils/athlete/resolveRunStepBlockExerciseIds";
import { useAthleteRunSessionMenu } from "@/hooks/athlete/useAthleteRunSessionMenu";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_PAGE_X,
    ATHLETE_RUN_STICKY_FOOTER_CONTENT_PB,
} from "@/components/athlete/layout/athleteLayoutClasses";

export const AthleteSessionRunPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isDesktop = useIsAthleteDesktopLayout();
    const { clientId } = useAthleteContext();
    const { activeInjuries, hasActiveInjuries } = useAthleteInjuries();
    const [injurySheetOpen, setInjurySheetOpen] = useState(false);
    const [techniqueTarget, setTechniqueTarget] = useState<AthleteExerciseTechniqueTarget | null>(
        null
    );

    const { data: runProgressForNotes } = useGetAthleteRunProgressQuery(sessionId, {
        skip: !sessionId,
    });
    const isOnlineStatus = useOnlineStatus();
    const exerciseNotes = useAthleteRunExerciseNotes({
        sessionId,
        progress: runProgressForNotes,
        registrationEditable: runProgressForNotes?.registration_editable !== false,
        isOnline: isOnlineStatus,
    });
    const persistNoteSlotIdsRef = useRef<number[]>([]);
    const afterStepConfirm = useCallback(async () => {
        await exerciseNotes.persistSlots(persistNoteSlotIdsRef.current);
    }, [exerciseNotes.persistSlots]);

    const {
        isOnline,
        pendingCount,
        runSteps,
        step,
        currentRunStep,
        isGroupRound,
        isTimedBlock,
        current,
        weight,
        reps,
        rpe,
        setWeight,
        setReps,
        setRpe,
        slotLogs,
        updateSlotLog,
        roundRpe,
        setRoundRpe,
        amrapRounds,
        setAmrapRounds,
        amrapPartialReps,
        updateAmrapPartialReps,
        amrapValidationVisible,
        resetAmrapValidation,
        convertAmrapPartialToFullRound,
        emomAsPlanned,
        setEmomAsPlanned,
        emomAthleteNote,
        setEmomAthleteNote,
        emomTemplateSlots,
        emomIntervalLabel,
        emomTechniqueSlots,
        forTimeRoundLabel,
        forTimeRoundTotal,
        forTimeTotalSeconds,
        onForTimeTotalSecondsChange,
        forTimeTechniqueSlots,
        blockTimer,
        blockWorkIsReady,
        saving,
        completing,
        restFlow,
        groupContext,
        handleFinish,
        isLoading,
        isLastStep,
        showStepActions,
        isCurrentStepSaved,
        prCelebration,
        runReference,
        isRunReferenceLoading,
        timedRunReference,
        isTimedRunReferenceLoading,
        slotReferences,
        isSlotReferencesLoading,
        applyReferenceValues,
        applySuggestionValues,
        progressPendingStepCount,
        sessionName,
        finishSession,
    } = useAthleteSessionRun({
        sessionId,
        afterStepConfirm,
        onSetSaved: (result, { isGroupRound, isTimedBlock, groupKind }) => {
            if (typeof navigator !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                navigator.vibrate?.(20);
            }
            const isDropset = groupKind === "dropset";
            const isAmrap = groupKind === "amrap";
            const isEmom = groupKind === "emom";
            const isForTime = groupKind === "for_time";
            const savedLabel = isTimedBlock
                ? isAmrap
                    ? "AMRAP registrado"
                    : isEmom
                      ? "EMOM registrado"
                      : isForTime
                        ? "FOR TIME registrado"
                        : "Bloque registrado"
                : isGroupRound
                  ? isDropset
                      ? "Dropset registrado"
                      : "Ronda registrada"
                  : "Serie registrada";
            const savedLocalLabel = isTimedBlock
                ? isAmrap
                    ? "AMRAP guardado localmente"
                    : isEmom
                      ? "EMOM guardado localmente"
                      : isForTime
                        ? "FOR TIME guardado localmente"
                        : "Bloque guardado localmente"
                : isGroupRound
                  ? isDropset
                      ? "Dropset guardado localmente"
                      : "Ronda guardada localmente"
                  : "Serie guardada localmente";
            const queuedLabel = isTimedBlock
                ? isAmrap
                    ? "AMRAP en cola — se sincronizará pronto"
                    : isEmom
                      ? "EMOM en cola — se sincronizará pronto"
                      : isForTime
                        ? "FOR TIME en cola — se sincronizará pronto"
                        : "Bloque en cola — se sincronizará pronto"
                : isGroupRound
                  ? isDropset
                      ? "Dropset en cola — se sincronizará pronto"
                      : "Ronda en cola — se sincronizará pronto"
                  : "Serie en cola — se sincronizará pronto";

            if (result === "offline") {
                showToast("info", savedLocalLabel);
            } else if (result === "queued") {
                showToast("info", queuedLabel);
            } else {
                showToast("success", savedLabel);
            }
        },
        onSyncSuccess: () => showToast("success", "Sesión sincronizada"),
        onSessionFinished: (result) => {
            if (result === "offline" || result === "queued") {
                showToast("info", "Sesión guardada localmente. Se sincronizará al reconectar.");
            }
        },
        onConflict: () =>
            showToast("error", "Conflicto al sincronizar. Revisa la sesión con tu entrenador."),
        onError: (message) => showToast("error", message),
    });

    useEffect(() => {
        persistNoteSlotIdsRef.current = blockExerciseIdsForRunStep(currentRunStep, current);
    }, [currentRunStep, current]);

    const noteSlotIds = useMemo(
        () => blockExerciseIdsForRunStep(currentRunStep, current),
        [currentRunStep, current]
    );
    const exerciseNoteDisabled = !exerciseNotes.registrationEditable;

    const runMenu = useAthleteRunSessionMenu({
        sessionId,
        isOnline,
        syncPendingCount: pendingCount,
        progressPendingStepCount,
        finishSession,
        onFinishNavigate: (result) => {
            if (result === "offline" || result === "queued") {
                showToast("info", "Sesión guardada localmente. Se sincronizará al reconectar.");
            }
        },
        onError: (message) => showToast("error", message),
    });

    const pageBottomPadding = isDesktop
        ? "lg:pb-8"
        : ATHLETE_RUN_STICKY_FOOTER_CONTENT_PB;

    useEffect(() => {
        if (!prCelebration || isDesktop) return;
        const prev =
            prCelebration.previousMaxWeight != null
                ? ` (antes ${prCelebration.previousMaxWeight} kg)`
                : "";
        showToast(
            "warning",
            `¡Nuevo récord! ${prCelebration.exerciseName}: ${prCelebration.weight} kg${prev}`
        );
        navigator.vibrate?.(50);
    }, [prCelebration, isDesktop, showToast]);

    const currentExerciseRef = useMemo(() => {
        if (!currentRunStep) return [];
        if (isGroupRound && currentRunStep.slots?.length) {
            return currentRunStep.slots.map((slot) => ({
                exerciseId: slot.exerciseId,
                exerciseName: slot.exerciseName,
            }));
        }
        if (isTimedBlock && currentRunStep.slots?.length) {
            return currentRunStep.slots.map((slot) => ({
                exerciseId: slot.exerciseId,
                exerciseName: slot.exerciseName,
            }));
        }
        return [{ exerciseId: currentRunStep.exerciseId, exerciseName: currentRunStep.exerciseName }];
    }, [currentRunStep, isGroupRound, isTimedBlock]);

    const { conflictByExerciseId } = useAthleteSessionInjuryAlerts(
        clientId,
        currentExerciseRef,
        hasActiveInjuries && currentRunStep != null
    );

    const handleConsultTrainer = () => {
        setInjurySheetOpen(true);
    };

    const desktopInjuryConflict =
        !isGroupRound && !isTimedBlock && current
            ? conflictByExerciseId.get(current.exerciseId)
            : undefined;

    const mobileInjuryConflicts = useMemo(() => {
        if (isDesktop || (!isGroupRound && !isTimedBlock)) return undefined;
        const map = new Map<
            number,
            { alert: NonNullable<ReturnType<typeof conflictByExerciseId.get>>["alert"]; onConsultTrainer: () => void }
        >();
        for (const [exerciseId, conflict] of conflictByExerciseId) {
            map.set(exerciseId, { alert: conflict.alert, onConsultTrainer: handleConsultTrainer });
        }
        return map;
    }, [conflictByExerciseId, isDesktop, isGroupRound, isTimedBlock]);

    if (isLoading) {
        return <AthletePageLoading variant="session-run" />;
    }

    if (runSteps.length === 0) {
        return (
            <div className="space-y-4 px-4 pb-24 pt-4">
                <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />
                <p className="text-sm text-muted-foreground">
                    {isOnline
                        ? "Esta sesión no tiene ejercicios configurados todavía."
                        : "Sin conexión y sin datos guardados de esta sesión. Conéctate para cargarla."}
                </p>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    Volver
                </Button>
            </div>
        );
    }

    if (!currentRunStep) {
        return null;
    }

    const showFinishSession = isLastStep && isCurrentStepSaved;

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 ${pageBottomPadding}`}>
            {isDesktop ? (
                <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />
            ) : (
                <AthleteRunChromeHeader
                    sessionName={sessionName}
                    step={step}
                    totalSteps={runSteps.length}
                    onExit={runMenu.exitToSessionPreview}
                    onOpenMenu={() => runMenu.setMenuOpen(true)}
                />
            )}

            {isDesktop && prCelebration && (
                <AthletePrBanner
                    exerciseName={prCelebration.exerciseName}
                    weight={prCelebration.weight}
                    previousMaxWeight={prCelebration.previousMaxWeight}
                />
            )}

            {isDesktop && hasActiveInjuries && desktopInjuryConflict && current && (
                <AthleteExerciseInjuryAlert
                    exerciseName={current.name}
                    alert={desktopInjuryConflict.alert}
                    onConsultTrainer={handleConsultTrainer}
                />
            )}

            <AthleteRunStepShell
                dockStickyToScreenBottom={!isDesktop}
                showRestChip={restFlow.showRestChip}
                remainingSeconds={restFlow.remainingSeconds}
                onSkipRest={restFlow.showRestChip ? restFlow.skipRest : undefined}
                stickyPrimaryLabel={
                    showStepActions ? restFlow.stickyPrimaryLabel : undefined
                }
                stickyPrimaryDisabled={restFlow.stickyPrimaryDisabled}
                stickyPrimaryLoading={restFlow.stickyPrimaryLoading || saving}
                onStickyPrimary={
                    showStepActions ? restFlow.stickyPrimaryAction : undefined
                }
                stickyPrimaryGlow={
                    showStepActions &&
                    restFlow.phase === "doing" &&
                    restFlow.hasRestTimer
                }
                secondaryLabel={showFinishSession ? "Finalizar sesión" : undefined}
                secondaryDisabled={completing}
                secondaryLoading={completing}
                onSecondary={showFinishSession ? handleFinish : undefined}
            >
                {isTimedBlock && groupContext ? (
                    <TimedBlockStepView
                        runStep={currentRunStep}
                        step={step}
                        totalSteps={runSteps.length}
                        groupContext={groupContext}
                        slotLogs={slotLogs}
                        onSlotChange={updateSlotLog}
                        roundRpe={roundRpe}
                        onRoundRpeChange={setRoundRpe}
                        amrapRounds={amrapRounds}
                        onAmrapRoundsChange={setAmrapRounds}
                        amrapPartialReps={amrapPartialReps}
                        onAmrapPartialRepsChange={updateAmrapPartialReps}
                        amrapValidationVisible={amrapValidationVisible}
                        onAmrapValidationReset={resetAmrapValidation}
                        onAmrapConvertPartialToFullRound={convertAmrapPartialToFullRound}
                        emomAsPlanned={emomAsPlanned}
                        onEmomAsPlannedChange={setEmomAsPlanned}
                        emomAthleteNote={emomAthleteNote}
                        onEmomAthleteNoteChange={setEmomAthleteNote}
                        emomTemplateSlots={emomTemplateSlots}
                        emomIntervalLabel={emomIntervalLabel}
                        emomTechniqueSlots={emomTechniqueSlots}
                        forTimeRoundLabel={forTimeRoundLabel}
                        forTimeRoundTotal={forTimeRoundTotal}
                        forTimeTotalSeconds={forTimeTotalSeconds}
                        onForTimeTotalSecondsChange={onForTimeTotalSecondsChange}
                        forTimeTechniqueSlots={forTimeTechniqueSlots}
                        blockTimer={blockTimer}
                        blockWorkIsReady={blockWorkIsReady}
                        restPhase={restFlow.phase}
                        showLogger={restFlow.showLogger}
                        onViewTechnique={setTechniqueTarget}
                        injuryConflicts={mobileInjuryConflicts}
                        sessionReadyToFinish={showFinishSession}
                        runReference={timedRunReference}
                        isRunReferenceLoading={isTimedRunReferenceLoading}
                        exerciseNoteSlotIds={noteSlotIds}
                        getExerciseNote={exerciseNotes.getDraftForSlot}
                        onExerciseNoteChange={exerciseNotes.setDraftForSlot}
                        exerciseNoteDisabled={exerciseNoteDisabled}
                    />
                ) : isGroupRound && groupContext ? (
                    <GroupRoundStepView
                        runStep={currentRunStep}
                        step={step}
                        totalSteps={runSteps.length}
                        groupContext={groupContext}
                        slotLogs={slotLogs}
                        onSlotChange={updateSlotLog}
                        roundRpe={roundRpe}
                        onRoundRpeChange={setRoundRpe}
                        restPhase={restFlow.phase}
                        showLogger={restFlow.showLogger}
                        onViewTechnique={setTechniqueTarget}
                        injuryConflicts={mobileInjuryConflicts}
                        sessionReadyToFinish={showFinishSession}
                        slotReferences={slotReferences}
                        isSlotReferencesLoading={isSlotReferencesLoading}
                        exerciseNoteSlotIds={noteSlotIds}
                        getExerciseNote={exerciseNotes.getDraftForSlot}
                        onExerciseNoteChange={exerciseNotes.setDraftForSlot}
                        exerciseNoteDisabled={exerciseNoteDisabled}
                    />
                ) : current ? (
                    <ExerciseStepView
                        exercise={current}
                        step={step}
                        totalSteps={runSteps.length}
                        weight={weight}
                        reps={reps}
                        rpe={rpe}
                        onWeightChange={setWeight}
                        onRepsChange={setReps}
                        onRpeChange={setRpe}
                        inputMode={current.inputMode}
                        plannedWeight={current.plannedWeight}
                        referenceWeightKg={runReference?.reference?.weight_kg ?? null}
                        restPhase={restFlow.phase}
                        injuryConflict={
                            !isDesktop && desktopInjuryConflict
                                ? {
                                      alert: desktopInjuryConflict.alert,
                                      onConsultTrainer: handleConsultTrainer,
                                  }
                                : undefined
                        }
                        runReference={runReference}
                        isRunReferenceLoading={isRunReferenceLoading}
                        onApplyReference={applyReferenceValues}
                        onApplySuggestion={applySuggestionValues}
                        groupContext={groupContext}
                        showLogger={restFlow.showLogger}
                        onViewTechnique={setTechniqueTarget}
                        sessionReadyToFinish={showFinishSession}
                        exerciseNote={
                            noteSlotIds[0] != null
                                ? exerciseNotes.getDraftForSlot(noteSlotIds[0])
                                : ""
                        }
                        onExerciseNoteChange={
                            noteSlotIds[0] != null
                                ? (value) => exerciseNotes.setDraftForSlot(noteSlotIds[0], value)
                                : undefined
                        }
                        exerciseNoteDisabled={exerciseNoteDisabled}
                    />
                ) : null}
            </AthleteRunStepShell>

            {restFlow.showRestOverlay ? (
                <RestTimerOverlay
                    remainingSeconds={restFlow.remainingSeconds}
                    totalSeconds={restFlow.restTotalSeconds}
                    onSkip={restFlow.skipRest}
                />
            ) : null}

            {hasActiveInjuries && (
                <AthleteInjuryConsultSheet
                    isOpen={injurySheetOpen}
                    onClose={() => setInjurySheetOpen(false)}
                    injuries={activeInjuries}
                    sessionId={sessionId}
                    sessionCompleted={false}
                />
            )}

            <AthleteExerciseTechniqueSheet
                target={techniqueTarget}
                onClose={() => setTechniqueTarget(null)}
            />

            <BottomSheet
                isOpen={runMenu.menuOpen}
                onClose={() => runMenu.setMenuOpen(false)}
                title="Opciones de sesión"
            >
                <div className="flex flex-col gap-2 px-1 pb-2">
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full justify-start"
                        onClick={runMenu.switchToManualLog}
                    >
                        Pasar a registro manual
                    </Button>
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full justify-start text-destructive"
                        onClick={runMenu.requestTerminateSession}
                    >
                        Terminar sesión
                    </Button>
                </div>
            </BottomSheet>

            <BottomSheet
                isOpen={runMenu.terminateConfirmOpen}
                onClose={() => runMenu.setTerminateConfirmOpen(false)}
                title="¿Terminar igualmente?"
                subtitle={
                    runMenu.pendingStepCount === 1
                        ? "Queda 1 paso sin registrar en esta sesión."
                        : `Quedan ${runMenu.pendingStepCount} pasos sin registrar en esta sesión.`
                }
                footer={
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            disabled={runMenu.isFinishing}
                            onClick={() => void runMenu.confirmTerminateSession()}
                        >
                            {runMenu.isFinishing ? "Finalizando…" : "Terminar e ir al feedback"}
                        </Button>
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => runMenu.setTerminateConfirmOpen(false)}
                        >
                            Seguir entrenando
                        </Button>
                    </div>
                }
            >
                <p className="px-1 text-sm text-muted-foreground">
                    Podrás completar lo pendiente desde la vista de la sesión en modo registrar.
                </p>
            </BottomSheet>
        </div>
    );
};

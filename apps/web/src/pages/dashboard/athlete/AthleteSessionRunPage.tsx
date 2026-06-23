/**
 * AthleteSessionRunPage.tsx — Ejecución sesión atleta (F1 100%, DESIGN §7.4, §5a/B.2 rest).
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AthleteContextStrip } from "@/components/athlete/AthleteContextStrip";
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
import { useToast } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useAthleteInjuries } from "@/hooks/athlete/useAthleteInjuries";
import { useAthleteSessionInjuryAlerts } from "@/hooks/athlete/useAthleteSessionInjuryAlerts";
import { useAthleteSessionRun } from "@/hooks/athlete/useAthleteSessionRun";
import { formatAthleteLastPerformanceDate } from "@/utils/athlete/formatAthleteLastPerformanceDate";
import { hasAthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import {
    ATHLETE_PAGE_X,
    ATHLETE_STICKY_FOOTER_CONTENT_PB,
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
        amrapPartialOpen,
        setAmrapPartialOpen,
        emomAsPlanned,
        setEmomAsPlanned,
        emomFailedCount,
        setEmomFailedCount,
        emomFailureEntries,
        updateEmomFailureEntry,
        emomTemplateSlots,
        emomIntervalLabel,
        emomTechniqueSlots,
        forTimeRoundLabel,
        forTimeRoundIndex,
        forTimeRoundTotal,
        forTimeSplitViews,
        forTimeRoundAdvanceCue,
        forTimeCumulativeSplits,
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
        lastPerformance,
        applyLastPerformance,
        suggestedLoad,
        applySuggestedLoad,
    } = useAthleteSessionRun({
        sessionId,
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

    const lastPerformanceDateLabel =
        hasAthleteLastPerformance(lastPerformance) && lastPerformance.performed_at
            ? formatAthleteLastPerformanceDate(lastPerformance.performed_at)
            : null;

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
                {isDesktop ? (
                    <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />
                ) : (
                    <AthleteContextStrip
                        isOnline={isOnline}
                        pendingCount={pendingCount}
                        injuries={activeInjuries}
                    />
                )}
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

    const contextStripInjuries: typeof activeInjuries = [];

    return (
        <div
            className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 ${ATHLETE_STICKY_FOOTER_CONTENT_PB} lg:pb-8`}
        >
            {isDesktop ? (
                <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />
            ) : (
                <AthleteContextStrip
                    isOnline={isOnline}
                    pendingCount={pendingCount}
                    injuries={contextStripInjuries}
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
                showRestChip={restFlow.showRestChip}
                remainingSeconds={restFlow.remainingSeconds}
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
                        amrapPartialOpen={amrapPartialOpen}
                        onAmrapPartialOpenChange={setAmrapPartialOpen}
                        emomAsPlanned={emomAsPlanned}
                        onEmomAsPlannedChange={setEmomAsPlanned}
                        emomFailedCount={emomFailedCount}
                        onEmomFailedCountChange={setEmomFailedCount}
                        emomFailureEntries={emomFailureEntries}
                        onEmomFailureEntryChange={updateEmomFailureEntry}
                        emomTemplateSlots={emomTemplateSlots}
                        emomIntervalLabel={emomIntervalLabel}
                        emomTechniqueSlots={emomTechniqueSlots}
                        forTimeRoundLabel={forTimeRoundLabel}
                        forTimeRoundIndex={forTimeRoundIndex}
                        forTimeRoundTotal={forTimeRoundTotal}
                        forTimeSplitViews={forTimeSplitViews}
                        forTimeRoundAdvanceCue={forTimeRoundAdvanceCue}
                        forTimeCumulativeSplits={forTimeCumulativeSplits}
                        forTimeTechniqueSlots={forTimeTechniqueSlots}
                        blockTimer={blockTimer}
                        blockWorkIsReady={blockWorkIsReady}
                        restPhase={restFlow.phase}
                        showLogger={restFlow.showLogger}
                        onViewTechnique={setTechniqueTarget}
                        injuryConflicts={mobileInjuryConflicts}
                        sessionReadyToFinish={showFinishSession}
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
                        restPhase={restFlow.phase}
                        injuryConflict={
                            !isDesktop && desktopInjuryConflict
                                ? {
                                      alert: desktopInjuryConflict.alert,
                                      onConsultTrainer: handleConsultTrainer,
                                  }
                                : undefined
                        }
                        lastPerformance={lastPerformance}
                        lastPerformanceDateLabel={lastPerformanceDateLabel}
                        onApplyLastPerformance={applyLastPerformance}
                        suggestedLoad={suggestedLoad}
                        onApplySuggestedLoad={applySuggestedLoad}
                        groupContext={groupContext}
                        showLogger={restFlow.showLogger}
                        onViewTechnique={setTechniqueTarget}
                        sessionReadyToFinish={showFinishSession}
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
        </div>
    );
};

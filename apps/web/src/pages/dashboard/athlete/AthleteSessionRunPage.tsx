/**
 * AthleteSessionRunPage.tsx — Ejecución sesión atleta (F1 100%, DESIGN §7.4).
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AthleteContextStrip } from "@/components/athlete/AthleteContextStrip";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import { AthletePrBanner } from "@/components/athlete/AthletePrBanner";
import { OfflineSessionBadge } from "@/components/athlete/OfflineSessionBadge";
import { ExerciseStepView } from "@/components/athlete/execution/ExerciseStepView";
import { RestTimerOverlay } from "@/components/athlete/execution/RestTimerOverlay";
import { AthleteStickyActionBar } from "@/components/athlete/layout/AthleteStickyActionBar";
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
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
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

    const {
        isOnline,
        pendingCount,
        flatExercises,
        step,
        current,
        weight,
        reps,
        rpe,
        setWeight,
        setReps,
        setRpe,
        saving,
        completing,
        restSeconds,
        setRestSeconds,
        groupContext,
        handleSaveSet,
        handleRestComplete,
        handleFinish,
        isLoading,
        isLastStep,
        showSaveSetButton,
        prCelebration,
        lastPerformance,
        applyLastPerformance,
        suggestedLoad,
        applySuggestedLoad,
    } = useAthleteSessionRun({
        sessionId,
        onSetSaved: (result) => {
            if (typeof navigator !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                navigator.vibrate?.(20);
            }
            if (result === "offline") {
                showToast("info", "Serie guardada localmente");
            } else if (result === "queued") {
                showToast("info", "Serie en cola — se sincronizará pronto");
            } else {
                showToast("success", "Serie registrada");
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

    const currentExerciseRef = useMemo(
        () =>
            current
                ? [{ exerciseId: current.exerciseId, exerciseName: current.name }]
                : [],
        [current]
    );

    const { conflictByExerciseId } = useAthleteSessionInjuryAlerts(
        clientId,
        currentExerciseRef,
        hasActiveInjuries && current != null
    );

    const currentConflict = current
        ? conflictByExerciseId.get(current.exerciseId)
        : undefined;

    const handleConsultTrainer = () => {
        setInjurySheetOpen(true);
    };

    const lastPerformanceDateLabel =
        hasAthleteLastPerformance(lastPerformance) && lastPerformance.performed_at
            ? formatAthleteLastPerformanceDate(lastPerformance.performed_at)
            : null;

    if (isLoading) {
        return <AthletePageLoading variant="session-run" />;
    }

    if (flatExercises.length === 0) {
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

    if (!current) {
        return null;
    }

    // V05: strip móvil solo offline/sync — lesión ya informada en preview; conflicto → callout bajo título
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

            {isDesktop && hasActiveInjuries && currentConflict && (
                <AthleteExerciseInjuryAlert
                    exerciseName={current.name}
                    alert={currentConflict.alert}
                    onConsultTrainer={handleConsultTrainer}
                />
            )}

            <ExerciseStepView
                exercise={current}
                step={step}
                totalSteps={flatExercises.length}
                weight={weight}
                reps={reps}
                rpe={rpe}
                onWeightChange={setWeight}
                onRepsChange={setReps}
                onRpeChange={setRpe}
                injuryConflict={
                    !isDesktop && currentConflict
                        ? {
                              alert: currentConflict.alert,
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
            />

            <AthleteStickyActionBar
                primaryLabel={showSaveSetButton ? "Serie completada" : undefined}
                primaryDisabled={saving}
                primaryLoading={saving}
                onPrimary={showSaveSetButton ? handleSaveSet : undefined}
                primaryClassName={ATHLETE_PRIMARY_CTA}
                secondaryLabel={isLastStep ? "Finalizar sesión" : undefined}
                secondaryDisabled={completing}
                secondaryLoading={completing}
                onSecondary={isLastStep ? handleFinish : undefined}
            />

            {restSeconds != null && restSeconds > 0 && (
                <RestTimerOverlay
                    seconds={restSeconds}
                    onComplete={handleRestComplete}
                    onSkip={() => {
                        setRestSeconds(null);
                        handleRestComplete();
                    }}
                />
            )}

            {hasActiveInjuries && (
                <AthleteInjuryConsultSheet
                    isOpen={injurySheetOpen}
                    onClose={() => setInjurySheetOpen(false)}
                    injuries={activeInjuries}
                    sessionId={sessionId}
                    sessionCompleted={false}
                />
            )}
        </div>
    );
};

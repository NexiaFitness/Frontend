/**
 * AthleteSessionRunPage.tsx — Ejecución sesión atleta (F1 100%, DESIGN §7.4).
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OfflineSessionBadge } from "@/components/athlete/OfflineSessionBadge";
import { ExerciseStepView } from "@/components/athlete/execution/ExerciseStepView";
import { RestTimerOverlay } from "@/components/athlete/execution/RestTimerOverlay";
import { AthleteStickyActionBar } from "@/components/athlete/layout/AthleteStickyActionBar";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, useToast } from "@/components/ui/feedback";
import { useAthleteSessionRun } from "@/hooks/athlete/useAthleteSessionRun";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

export const AthleteSessionRunPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();

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
        handleSaveSet,
        handleRestComplete,
        handleFinish,
        isLoading,
        isLastStep,
    } = useAthleteSessionRun({
        sessionId,
        onSetSaved: (result) => {
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

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (flatExercises.length === 0) {
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

    if (!current) {
        return null;
    }

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 lg:pb-8`}>
            <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />

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
            />

            <AthleteStickyActionBar
                primaryLabel="Serie completada"
                primaryDisabled={saving}
                primaryLoading={saving}
                onPrimary={handleSaveSet}
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
        </div>
    );
};

/**
 * AthleteSessionRunPage.tsx — Ejecución sesión atleta (V05 MVP F1 + offline).
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { OfflineSessionBadge } from "@/components/athlete/OfflineSessionBadge";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, useToast } from "@/components/ui/feedback";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useUpdateSessionBlockExerciseMutation } from "@nexia/shared/api/sessionProgrammingApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useOfflineSessionLog } from "@nexia/shared/hooks/offline";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import type { AthleteFlatExercise } from "@nexia/shared/offline";

export const AthleteSessionRunPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { clientId } = useAthleteContext();

    const { data: session, isLoading: loadingSession } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId,
    });
    const { view, isLoading: loadingStructure } = useSessionStructureView(sessionId);

    const [updateExercise] = useUpdateSessionBlockExerciseMutation();
    const [updateSession] = useUpdateTrainingSessionMutation();

    const flatExercisesFromApi = useMemo((): AthleteFlatExercise[] => {
        const items: AthleteFlatExercise[] = [];
        for (const block of view.blocks) {
            for (const group of block.groups) {
                for (const slot of group.slots) {
                    const firstSet = slot.sets[0];
                    if (!firstSet) continue;
                    const parts: string[] = [];
                    if (firstSet.plannedReps) parts.push(`${firstSet.plannedReps} reps`);
                    if (firstSet.plannedWeight) parts.push(`@ ${firstSet.plannedWeight} kg`);
                    items.push({
                        blockExerciseId: firstSet.sourceLineId,
                        name: slot.exerciseName,
                        plannedLabel: parts.join(" · ") || "Según prescripción",
                        defaultWeight: firstSet.plannedWeight ?? 0,
                        defaultReps: Number.parseInt(String(firstSet.plannedReps ?? "8"), 10) || 8,
                    });
                }
            }
        }
        return items;
    }, [view]);

    const adapter = useMemo(
        () => ({
            updateExercise: async (
                blockExerciseId: number,
                data: Parameters<typeof updateExercise>[0]["data"]
            ) => {
                await updateExercise({ id: blockExerciseId, data }).unwrap();
            },
            completeSession: async (sid: number) => {
                await updateSession({ id: sid, body: { status: "completed" } }).unwrap();
            },
        }),
        [updateExercise, updateSession]
    );

    const {
        isOnline,
        pendingCount,
        cachedSnapshot,
        isUsingCache,
        logSet,
        finishSession,
    } = useOfflineSessionLog({
        sessionId,
        clientId,
        sessionName: session?.session_name ?? "Entrenamiento",
        flatExercises: flatExercisesFromApi,
        adapter,
        onSynced: ({ syncedLogs, syncedCompletes }) => {
            if (syncedLogs > 0 || syncedCompletes > 0) {
                showToast("success", "Sesión sincronizada");
            }
        },
        onConflict: () => {
            showToast(
                "error",
                "Conflicto al sincronizar. Revisa la sesión con tu entrenador."
            );
        },
    });

    const flatExercises =
        flatExercisesFromApi.length > 0
            ? flatExercisesFromApi
            : isUsingCache
              ? (cachedSnapshot?.flatExercises ?? [])
              : [];

    const [step, setStep] = useState(0);
    const current = flatExercises[step];
    const [weight, setWeight] = useState(0);
    const [reps, setReps] = useState(8);
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);

    React.useEffect(() => {
        setStep(0);
    }, [sessionId]);

    React.useEffect(() => {
        if (current) {
            setWeight(current.defaultWeight);
            setReps(current.defaultReps);
        }
    }, [current]);

    const handleSaveSet = useCallback(async () => {
        if (!current) return;
        setSaving(true);
        try {
            const result = await logSet(current.blockExerciseId, {
                actual_weight: weight,
                actual_reps: String(reps),
                actual_sets: 1,
            });
            if (result === "offline") {
                showToast("info", "Serie guardada localmente");
            } else if (result === "queued") {
                showToast("info", "Serie en cola — se sincronizará pronto");
            } else {
                showToast("success", "Serie registrada");
            }
            if (step < flatExercises.length - 1) {
                setStep((s) => s + 1);
            }
        } catch {
            showToast("error", "No se pudo guardar la serie");
        } finally {
            setSaving(false);
        }
    }, [current, flatExercises.length, logSet, reps, showToast, step, weight]);

    const handleFinish = useCallback(async () => {
        setCompleting(true);
        try {
            const result = await finishSession();
            if (result === "synced") {
                navigate(`/dashboard/sessions/${sessionId}/feedback`);
            } else {
                showToast(
                    "info",
                    "Sesión guardada localmente. Se sincronizará al reconectar."
                );
                navigate("/dashboard/sessions");
            }
        } catch {
            showToast("error", "No se pudo completar la sesión");
        } finally {
            setCompleting(false);
        }
    }, [finishSession, navigate, sessionId, showToast]);

    const loadingFromNetwork = loadingSession || loadingStructure;
    const waitingForCache = !isOnline && loadingFromNetwork && !cachedSnapshot;

    if (loadingFromNetwork && !isUsingCache && isOnline) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (waitingForCache) {
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

    return (
        <div className="flex min-h-full flex-col px-4 pb-32 pt-4">
            <OfflineSessionBadge isOnline={isOnline} pendingCount={pendingCount} />

            <p className="text-caption text-muted-foreground">
                Ejercicio {step + 1} / {flatExercises.length}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{current.name}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{current.plannedLabel}</p>

            <div className="mt-8 space-y-6">
                <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Peso (kg)</p>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="min-h-touch-athlete min-w-touch-athlete"
                            onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
                        >
                            <Minus className="size-5" />
                        </Button>
                        <span className="min-w-[4rem] text-center text-2xl font-bold tabular-nums">
                            {weight}
                        </span>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="min-h-touch-athlete min-w-touch-athlete"
                            onClick={() => setWeight((w) => w + 2.5)}
                        >
                            <Plus className="size-5" />
                        </Button>
                    </div>
                </div>
                <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Reps</p>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="min-h-touch-athlete min-w-touch-athlete"
                            onClick={() => setReps((r) => Math.max(1, r - 1))}
                        >
                            <Minus className="size-5" />
                        </Button>
                        <span className="min-w-[4rem] text-center text-2xl font-bold tabular-nums">
                            {reps}
                        </span>
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="min-h-touch-athlete min-w-touch-athlete"
                            onClick={() => setReps((r) => r + 1)}
                        >
                            <Plus className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-16 z-30 space-y-2 border-t border-border bg-background/95 p-4">
                <Button
                    variant="primary"
                    className="min-h-touch-athlete w-full"
                    disabled={saving}
                    onClick={handleSaveSet}
                >
                    Serie completada
                </Button>
                {step === flatExercises.length - 1 && (
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full"
                        disabled={completing}
                        onClick={handleFinish}
                    >
                        Finalizar sesión
                    </Button>
                )}
            </div>
        </div>
    );
};

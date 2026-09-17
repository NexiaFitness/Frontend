/**
 * Edición de sesión suelta: metadatos + constructor de ejercicios (contratos BE existentes).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input, FormCombobox, Textarea } from "@/components/ui/forms";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useGetStandaloneSessionQuery,
    useUpdateStandaloneSessionMutation,
    useDeleteStandaloneSessionMutation,
    useGetStandaloneSessionExercisesQuery,
    useCreateStandaloneSessionExerciseMutation,
    useUpdateStandaloneSessionExerciseMutation,
    useDeleteStandaloneSessionExerciseMutation,
} from "@nexia/shared/api/standaloneSessionsApi";
import { useGetTrainingBlockTypesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { navigateDashboardBack, readSafeReturnTo } from "@/lib/sessionDetailNavigation";
import { SESSION_TYPES } from "@/pages/sessionProgramming/sessionFormConstants";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import {
    applyExercisePickerSelection,
    ConstructorValidationProvider,
    formatConstructorValidationToast,
} from "@/components/sessionProgramming/constructor";
import { useConstructorValidation } from "@/hooks/useConstructorValidation";
import { useScrollToConstructorValidationIssue } from "@/hooks/useScrollToConstructorValidationIssue";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import { syncStandaloneSessionExercises } from "@/pages/sessionProgramming/persistCreateSessionContent";
import {
    buildStandaloneExerciseLinesFromConstructor,
    hydrateConstructorRowsFromStandaloneExercises,
} from "./standaloneSessionExerciseLines";

const DEFAULT_BACK = "/dashboard/sessions";

export const EditStandaloneSession: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const backTarget = readSafeReturnTo(location.state) ?? null;
    const goBack = useCallback(() => {
        navigateDashboardBack(navigate, location.state, DEFAULT_BACK);
    }, [navigate, location.state]);

    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id ?? 0;

    const { data: session, isLoading, isError } = useGetStandaloneSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });
    const { data: sessionExercises = [], isLoading: exercisesLoading } =
        useGetStandaloneSessionExercisesQuery(sessionId, {
            skip: !sessionId || Number.isNaN(sessionId),
        });
    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const { data: exercisesData } = useGetExercisesQuery({ skip: 0, limit: 1000 });

    const [updateSession, { isLoading: isSaving }] = useUpdateStandaloneSessionMutation();
    const [deleteSession, { isLoading: isDeleting }] = useDeleteStandaloneSessionMutation();
    const [createStandaloneExercise] = useCreateStandaloneSessionExerciseMutation();
    const [updateStandaloneExercise] = useUpdateStandaloneSessionExerciseMutation();
    const [deleteStandaloneExercise] = useDeleteStandaloneSessionExerciseMutation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isPersistingExercises, setIsPersistingExercises] = useState(false);

    const [sessionName, setSessionName] = useState("");
    const [sessionType, setSessionType] = useState("strength");
    const [plannedDuration, setPlannedDuration] = useState("");
    const [notes, setNotes] = useState("");
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);
    const [targetExerciseSlotId, setTargetExerciseSlotId] = useState<string | null>(null);
    const exercisesHydratedRef = useRef(false);

    const constructorValidation = useConstructorValidation();
    const scrollToConstructorIssue = useScrollToConstructorValidationIssue();

    const defaultBlockTypeId = blockTypes[0]?.id ?? 0;
    const exerciseNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const ex of exercisesData?.exercises ?? []) {
            map.set(ex.id, exerciseDisplayName(ex));
        }
        return map;
    }, [exercisesData?.exercises]);

    useEffect(() => {
        exercisesHydratedRef.current = false;
        setConstructorRows([]);
    }, [sessionId]);

    useEffect(() => {
        if (!session) return;
        setSessionName(session.session_name ?? "");
        setSessionType(session.session_type ?? "strength");
        setPlannedDuration(
            session.planned_duration != null ? String(session.planned_duration) : "",
        );
        setNotes(session.notes ?? "");
    }, [session]);

    useEffect(() => {
        if (exercisesHydratedRef.current || exercisesLoading || !defaultBlockTypeId) return;
        exercisesHydratedRef.current = true;
        setConstructorRows(
            hydrateConstructorRowsFromStandaloneExercises({
                exercises: sessionExercises,
                defaultBlockTypeId,
                exerciseNameById,
            }),
        );
    }, [sessionExercises, exercisesLoading, defaultBlockTypeId, exerciseNameById]);

    const handleAddExerciseRequest = useCallback(
        (rowId: string, exerciseSlotId?: string) => {
            setTargetRowIdForPicker(rowId);
            setTargetExerciseSlotId(exerciseSlotId ?? null);
            setShowExercisePickerModal(true);
        },
        [],
    );

    const handleSelectFromPicker = useCallback(
        (exercise: Exercise) => {
            if (!targetRowIdForPicker) return;
            setConstructorRows((prev) =>
                applyExercisePickerSelection(
                    prev,
                    targetRowIdForPicker,
                    { id: exercise.id, name: exerciseDisplayName(exercise) },
                    targetExerciseSlotId,
                ),
            );
            setShowExercisePickerModal(false);
            setTargetRowIdForPicker(null);
            setTargetExerciseSlotId(null);
        },
        [targetRowIdForPicker, targetExerciseSlotId],
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;

        if (constructorRows.length > 0) {
            const ctorResult = constructorValidation.validate(constructorRows);
            if (!ctorResult.valid) {
                showError(formatConstructorValidationToast(ctorResult.issues), 6000);
                scrollToConstructorIssue(ctorResult.issues);
                return;
            }
        }

        setIsPersistingExercises(true);
        try {
            await updateSession({
                sessionId: session.id,
                body: {
                    session_name: sessionName.trim() || session.session_name,
                    session_type: sessionType,
                    planned_duration: plannedDuration ? Number(plannedDuration) : null,
                    notes: notes.trim() || null,
                },
            }).unwrap();

            const desired = buildStandaloneExerciseLinesFromConstructor(constructorRows);
            const syncResult = await syncStandaloneSessionExercises({
                sessionId: session.id,
                desired,
                existingServerIds: sessionExercises.map((ex) => ex.id),
                createStandaloneExercise: (args) =>
                    createStandaloneExercise({
                        ...args,
                        clientId: session.client_id,
                    }),
                updateStandaloneExercise: (args) =>
                    updateStandaloneExercise({
                        ...args,
                        sessionId: session.id,
                        clientId: session.client_id,
                    }),
                deleteStandaloneExercise: (exerciseId) =>
                    deleteStandaloneExercise({
                        exerciseId,
                        sessionId: session.id,
                        clientId: session.client_id,
                    }),
            });

            if (!syncResult.ok) {
                showError(
                    `${syncResult.message} Los metadatos se guardaron; revisa el constructor.`,
                    8000,
                );
                return;
            }

            showSuccess("Sesión y ejercicios actualizados.");
            navigate(`/dashboard/standalone-sessions/${session.id}`, {
                state: location.state,
            });
        } catch {
            showError("No se pudo guardar la sesión.");
        } finally {
            setIsPersistingExercises(false);
        }
    };

    const handleCancelSession = async () => {
        if (!session || session.status === "cancelled") return;
        try {
            await updateSession({
                sessionId: session.id,
                body: { status: "cancelled" },
            }).unwrap();
            showSuccess("Sesión cancelada.");
            navigate(`/dashboard/standalone-sessions/${session.id}`, { state: location.state });
        } catch {
            showError("No se pudo cancelar la sesión.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!session || !trainerId) return;
        try {
            await deleteSession({
                sessionId: session.id,
                clientId: session.client_id,
                trainerId,
            }).unwrap();
            setShowDeleteModal(false);
            showSuccess("Sesión eliminada.");
            goBack();
        } catch {
            showError("No se pudo eliminar la sesión.");
        }
    };

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de sesión inválido</Alert>
            </div>
        );
    }

    if (isLoading || exercisesLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="p-6 space-y-4">
                <Alert variant="error">No se pudo cargar la sesión.</Alert>
                <Button variant="outline" onClick={goBack}>
                    Volver
                </Button>
            </div>
        );
    }

    const isCancelled = session.status === "cancelled" || session.status === "skipped";
    const isCompleted = session.status === "completed";
    const isBusy = isSaving || isPersistingExercises;

    return (
            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        {backTarget ? "Volver" : "Sesiones"}
                    </Button>
                </div>

                <div>
                    <h1 className="text-xl font-bold">Editar sesión suelta</h1>
                    <p className="text-sm text-muted-foreground">
                        Fecha: {session.session_date} · No editable en standalone (contrato BE)
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                        <div>
                            <label className="text-sm font-medium">Nombre</label>
                            <Input
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                className="mt-1"
                                disabled={isCancelled}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Tipo</label>
                            <FormCombobox
                                value={sessionType}
                                onChange={setSessionType}
                                options={SESSION_TYPES}
                                placeholder="Tipo"
                                ariaLabel="Tipo de sesión"
                                disabled={isCancelled}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Duración (min)</label>
                            <Input
                                type="number"
                                value={plannedDuration}
                                onChange={(e) => setPlannedDuration(e.target.value)}
                                className="mt-1 max-w-[8rem]"
                                disabled={isCancelled}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notas</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-1"
                                rows={3}
                                disabled={isCancelled}
                            />
                        </div>
                    </div>

                    {!isCancelled ? (
                        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                            <h2 className="text-lg font-semibold">Ejercicios</h2>
                            <TrainingBlockSelector
                                selectedBlockTypeIds={[
                                    ...new Set(
                                        constructorRows
                                            .map((r) => r.blockTypeId)
                                            .filter(Boolean),
                                    ),
                                ]}
                                onSelect={(blockTypeId) => {
                                    if (
                                        !blockTypeId ||
                                        !blockTypes.some((bt) => bt.id === blockTypeId)
                                    ) {
                                        return;
                                    }
                                    setConstructorRows((rows) => [
                                        ...rows,
                                        {
                                            id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                                            blockTypeId,
                                            setType: SET_TYPE.SINGLE_SET,
                                            sets: 3,
                                            rounds: null,
                                            timeCap: null,
                                            intervalSeconds: null,
                                            rest: 60,
                                            repsTipo: "reps",
                                            exercises: [],
                                        },
                                    ]);
                                }}
                            />
                            <ConstructorValidationProvider
                                issuesByKey={constructorValidation.issuesByKey}
                                onClearField={constructorValidation.clearFieldError}
                            >
                                <SessionConstructor
                                    rows={constructorRows}
                                    blockTypes={blockTypes}
                                    onRowsChange={setConstructorRows}
                                    onAddExerciseRequest={handleAddExerciseRequest}
                                    activePickerRowId={targetRowIdForPicker}
                                    exercisePickerPanel={
                                        showExercisePickerModal ? (
                                            <ExercisePickerPanel
                                                mode="inline"
                                                isOpen={true}
                                                onClose={() => {
                                                    setShowExercisePickerModal(false);
                                                    setTargetRowIdForPicker(null);
                                                }}
                                                onSelect={handleSelectFromPicker}
                                                clientId={session.client_id}
                                            />
                                        ) : null
                                    }
                                />
                            </ConstructorValidationProvider>
                            {constructorRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Añade un bloque y ejercicios para prescribir la sesión.
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" variant="primary" disabled={isBusy || isCancelled}>
                            Guardar
                        </Button>
                        {!isCancelled && !isCompleted ? (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isBusy}
                                onClick={handleCancelSession}
                            >
                                Cancelar sesión
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Eliminar
                        </Button>
                    </div>
                </form>

                <NexiaPremiumConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => {
                        if (!isDeleting) setShowDeleteModal(false);
                    }}
                    onConfirm={handleConfirmDelete}
                    title="Eliminar sesión suelta"
                    description="Esta acción no se puede deshacer. Se eliminará la sesión y sus ejercicios asociados."
                    confirmLabel="Eliminar"
                    isLoading={isDeleting}
                    loadingConfirmLabel="Eliminando…"
                    closeOnBackdrop={!isDeleting}
                    closeOnEsc={!isDeleting}
                />
            </div>
    );
};

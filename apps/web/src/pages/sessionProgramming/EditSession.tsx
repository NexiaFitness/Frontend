/**
 * EditSession.tsx — Página para editar sesión de entrenamiento
 *
 * Contexto:
 * - Vista protegida (solo trainers) para editar sesión existente
 * - Permite modificar todos los detalles de la sesión
 * - Redirige al plan después de actualizar
 * - Fase 8: Constructor por bloques con diff create/update/delete
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Slider } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import {
    useGetSessionBlocksQuery,
    useGetTrainingBlockTypesQuery,
    useCreateSessionBlockMutation,
    useUpdateSessionBlockMutation,
    useDeleteSessionBlockMutation,
    useCreateSessionBlockExerciseMutation,
    useUpdateSessionBlockExerciseMutation,
    useDeleteSessionBlockExerciseMutation,
} from "@nexia/shared/api/sessionProgrammingApi";
import { sessionProgrammingApi } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { useClientInjuries } from "@nexia/shared/hooks/injuries/useClientInjuries";
import type { TrainingSessionUpdate } from "@nexia/shared/types/trainingSessions";
import type { AppDispatch } from "@nexia/shared/store";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { ClientAvatar } from "@/components/ui/avatar";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import type {
    ConstructorRow,
    ConstructorExercise,
    RepsTipo,
} from "@/components/sessionProgramming/constructorTypes";
import {
    buildExercisePayload,
    buildExerciseUpdatePayload,
} from "./buildExercisePayload";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { SessionBlockExercise } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";

const SESSION_TYPES = [
    { value: "training", label: "Entrenamiento" },
    { value: "cardio", label: "Cardio" },
    { value: "strength", label: "Fuerza" },
    { value: "endurance", label: "Resistencia" },
    { value: "flexibility", label: "Flexibilidad" },
    { value: "recovery", label: "Recuperación" },
];

export const EditSession: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;
    const { showSuccess, showError } = useToast();

    // Cargar sesión
    const { 
        data: session, 
        isLoading: isLoadingSession, 
        isError: isErrorSession 
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    // Cargar plan y cliente
    const { data: plan } = useGetTrainingPlanQuery(
        session?.training_plan_id || 0, 
        { skip: !session?.training_plan_id }
    );
    const { data: client } = useGetClientQuery(session?.client_id ?? 0, {
        skip: !session?.client_id,
    });
    const { activeInjuries: clientActiveInjuries = [] } = useClientInjuries({
        clientId: session?.client_id ?? 0,
        includeHistory: false,
    });

    // Hook de mutación para actualizar sesión
    const [updateTrainingSession, { isLoading: isUpdatingSession }] = useUpdateTrainingSessionMutation();

    // Estado del formulario
    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionType: "training",
        plannedDuration: "",
        plannedIntensity: "",
        plannedVolume: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    /** Fase 8: Constructor por bloques */
    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);
    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const { data: exercisesData } = useGetExercisesQuery({ skip: 0, limit: 500 });
    const { data: blocks = [] } = useGetSessionBlocksQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });
    const [createSessionBlock] = useCreateSessionBlockMutation();
    const [updateSessionBlock] = useUpdateSessionBlockMutation();
    const [deleteSessionBlock] = useDeleteSessionBlockMutation();
    const [createSessionBlockExercise] = useCreateSessionBlockExerciseMutation();
    const [updateSessionBlockExercise] = useUpdateSessionBlockExerciseMutation();
    const [deleteSessionBlockExercise] = useDeleteSessionBlockExerciseMutation();

    /** Fase 8: Cargar bloques + ejercicios y popular Constructor */
    useEffect(() => {
        if (!blocks.length) return;
        const load = async () => {
            const exercisesByBlock: Record<number, { id: number; exercise_id: number; planned_reps: string | null; planned_weight: number | null; planned_rest: number | null; planned_sets: number | null; effort_character: unknown; effort_value: number | null; notes: string | null; planned_duration: number | null }[]> = {};
            for (const b of blocks) {
                const result = await dispatch(
                    sessionProgrammingApi.endpoints.getSessionBlockExercises.initiate(b.id)
                );
                if ("data" in result && result.data) {
                    exercisesByBlock[b.id] = result.data;
                }
            }
            const inferRepsTipo = (
                ex: { planned_reps: string | null; planned_duration: number | null }
            ): RepsTipo => {
                if (ex.planned_duration != null && !ex.planned_reps?.trim()) return "tiempo";
                return "reps";
            };

            const rows: ConstructorRow[] = blocks.map((b, i) => {
                const exs = exercisesByBlock[b.id] ?? [];
                const firstEx = exs[0];
                return {
                    id: `row-${b.id}-${i}`,
                    serverBlockId: b.id,
                    blockTypeId: b.block_type_id,
                    setType: (b.set_type as ConstructorRow["setType"]) ?? SET_TYPE.SINGLE_SET,
                    sets: exs[0]?.planned_sets ?? null,
                    rounds: b.rounds,
                    timeCap: b.time_cap,
                    intervalSeconds: b.interval_seconds,
                    rest: exs[0]?.planned_rest ?? 60,
                    repsTipo: firstEx ? inferRepsTipo(firstEx) : "reps",
                    exercises: exs.map((ex, j) => ({
                        id: `ex-${ex.id}-${j}`,
                        serverExerciseId: ex.id,
                        exerciseId: ex.exercise_id,
                        exerciseName: `Ejercicio #${ex.exercise_id}`,
                        plannedReps: ex.planned_reps,
                        plannedWeight: ex.planned_weight,
                        plannedDuration: ex.planned_duration,
                        effortCharacter: ex.effort_character as ConstructorExercise["effortCharacter"],
                        effortValue: ex.effort_value,
                        notes: ex.notes,
                    })),
                };
            });
            const nameMap: Record<number, string> = {};
            if (exercisesData?.exercises) {
                for (const ex of exercisesData.exercises) {
                    nameMap[ex.id] = ex.nombre;
                }
            }
            setConstructorRows(
                rows.map((row) => ({
                    ...row,
                    exercises: row.exercises.map((ex) => ({
                        ...ex,
                        exerciseName: nameMap[ex.exerciseId] ?? ex.exerciseName,
                    })),
                }))
            );
        };
        load();
    }, [blocks, dispatch, exercisesData]);

    const handleSelectFromPicker = useCallback(
        (exercise: Exercise) => {
            if (!targetRowIdForPicker) return;
            const newEx: ConstructorExercise = {
                id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                exerciseId: exercise.id,
                exerciseName: exercise.nombre,
                plannedReps: "10",
                plannedWeight: null,
                plannedDuration: null,
                effortCharacter: null,
                effortValue: null,
                notes: null,
            };
            setConstructorRows((prev) =>
                prev.map((r) =>
                    r.id === targetRowIdForPicker
                        ? { ...r, exercises: [...r.exercises, newEx] }
                        : r
                )
            );
            /* Panel permanece abierto para añadir más a la misma fila */
        },
        [targetRowIdForPicker]
    );

    // Prellenar formulario cuando se carga la sesión
    useEffect(() => {
        if (session) {
            setFormData({
                sessionName: session.session_name || "",
                sessionDate: session.session_date ? session.session_date.split("T")[0] : new Date().toISOString().split("T")[0],
                sessionType: session.session_type || "training",
                plannedDuration: session.planned_duration?.toString() || "",
                plannedIntensity: session.planned_intensity?.toString() || "5",
                plannedVolume: session.planned_volume?.toString() || "5",
                notes: session.notes || "",
            });
        }
    }, [session]);

    // Validar que haya sessionId
    useEffect(() => {
        if (!sessionId || isNaN(sessionId)) {
            showError("ID de sesión inválido");
            navigate("/dashboard");
        }
    }, [sessionId, navigate, showError]);

    // Manejar error al cargar sesión
    useEffect(() => {
        if (isErrorSession) {
            showError("Error al cargar la sesión");
            navigate("/dashboard");
        }
    }, [isErrorSession, navigate, showError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};
        if (!formData.sessionName.trim()) {
            errors.sessionName = "El nombre de la sesión es obligatorio";
        }
        if (!formData.sessionDate) {
            errors.sessionDate = "La fecha es obligatoria";
        }
        if (!formData.sessionType) {
            errors.sessionType = "El tipo de sesión es obligatorio";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (!session) {
            showError("No se pudo obtener la información de la sesión");
            return;
        }

        try {
            const sessionData: TrainingSessionUpdate = {
                session_name: formData.sessionName.trim(),
                session_date: formData.sessionDate,
                session_type: formData.sessionType,
                planned_duration: formData.plannedDuration ? Number(formData.plannedDuration) : null,
                planned_intensity: formData.plannedIntensity ? Number(formData.plannedIntensity) : null,
                planned_volume: formData.plannedVolume ? Number(formData.plannedVolume) : null,
                notes: formData.notes.trim() || null,
            };

            await updateTrainingSession({
                id: sessionId,
                body: sessionData,
            }).unwrap();

            const serverBlockIds = new Set(blocks.map((b) => b.id));

            for (let i = 0; i < constructorRows.length; i++) {
                const row = constructorRows[i];
                const blockPayload = {
                    block_type_id: row.blockTypeId,
                    order_in_session: i + 1,
                    set_type: row.setType,
                    rounds: row.rounds,
                    time_cap: row.timeCap,
                    interval_seconds: row.intervalSeconds,
                    objective_text:
                        row.setType === "for_time"
                            ? "Objetivo: menor tiempo"
                            : row.setType === "amrap"
                            ? "Objetivo: máximo rendimiento"
                            : null,
                };

                if (row.serverBlockId) {
                    await updateSessionBlock({
                        id: row.serverBlockId,
                        data: blockPayload,
                    }).unwrap();
                    serverBlockIds.delete(row.serverBlockId);

                    const exResult = (await (dispatch as AppDispatch)(
                        sessionProgrammingApi.endpoints.getSessionBlockExercises.initiate(
                            row.serverBlockId!
                        )
                    )) as { data?: SessionBlockExercise[] };
                    const currentExs = exResult?.data ?? [];
                    const serverExIds = new Set<number>(
                        currentExs.map((e: { id: number }) => e.id)
                    );

                    for (let j = 0; j < row.exercises.length; j++) {
                        const ex = row.exercises[j];
                        if (ex.serverExerciseId) {
                            const updatePayload = buildExerciseUpdatePayload(
                                row,
                                ex
                            );
                            await updateSessionBlockExercise({
                                id: ex.serverExerciseId,
                                data: updatePayload,
                            }).unwrap();
                            serverExIds.delete(ex.serverExerciseId);
                        } else {
                            const createPayload = buildExercisePayload(
                                row,
                                ex,
                                j + 1,
                                row.setType
                            );
                            await createSessionBlockExercise({
                                blockId: row.serverBlockId,
                                data: createPayload,
                            }).unwrap();
                        }
                    }
                    for (const exId of serverExIds) {
                        await deleteSessionBlockExercise(exId);
                    }
                } else {
                    const created = await createSessionBlock({
                        sessionId,
                        data: blockPayload,
                    }).unwrap();
                    for (let j = 0; j < row.exercises.length; j++) {
                        const ex = row.exercises[j];
                        const payload = buildExercisePayload(
                            row,
                            ex,
                            j + 1,
                            row.setType
                        );
                        await createSessionBlockExercise({
                            blockId: created.id,
                            data: payload,
                        }).unwrap();
                    }
                }
            }

            for (const blockId of serverBlockIds) {
                await deleteSessionBlock(blockId);
            }

            showSuccess("Sesión actualizada exitosamente. Redirigiendo...", 2000);

            setTimeout(() => {
                if (session.training_plan_id) {
                    navigate(`/dashboard/training-plans/${session.training_plan_id}?tab=sessions`);
                } else {
                    navigate("/dashboard");
                }
            }, 1500);
        } catch (err) {
            console.error("Error actualizando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String(
                          (err as { data: unknown }).data || "Error al actualizar la sesión"
                      )
                    : "Error al actualizar la sesión";
            showError(errorMessage);
        }
    };

    if (isLoadingSession) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <>
            <div className="space-y-6 pb-24">
                {/* Header + Volver */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Editar Sesión
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        Volver
                    </Button>
                </div>

                {/* Tarjeta contexto cliente */}
                {session.client_id && client && (
                    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
                        <ClientAvatar
                            clientId={session.client_id}
                            nombre={client.nombre}
                            apellidos={client.apellidos}
                            size="sm"
                        />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Editando sesión para {client.nombre} {client.apellidos}
                            </p>
                        </div>
                    </div>
                )}

                {/* Flex: form + SessionDayPlan + ExercisePickerPanel (cuando abierto) */}
                <div className="flex flex-col lg:flex-row gap-6 min-w-0">
                    <div className={`flex-1 min-w-0 ${showExercisePickerModal ? "lg:max-w-[calc(100%-324px)]" : ""}`}>
                    <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
                        <form id="edit-session-form" onSubmit={handleSubmit} className="space-y-5">
                            {/* Nombre de la Sesión */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Nombre de la Sesión *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.sessionName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionName: e.target.value })
                                    }
                                    required
                                    placeholder="Ej: Entrenamiento de Fuerza - Piernas"
                                />
                                {formErrors.sessionName && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionName}</p>
                                )}
                            </div>

                            {/* Plan (read-only, si tiene training_plan_id) */}
                            {session.training_plan_id && plan && (
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Plan de Entrenamiento
                                    </label>
                                    <Input
                                        type="text"
                                        value={plan.name || "Cargando..."}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            )}

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Fecha de la Sesión *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.sessionDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionDate: e.target.value })
                                    }
                                    required
                                />
                                {formErrors.sessionDate && (
                                    <p className="text-destructive text-xs mt-1">{formErrors.sessionDate}</p>
                                )}
                            </div>

                            {/* Tipo de Sesión */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Tipo de Sesión *
                                </label>
                                <FormSelect
                                    value={formData.sessionType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionType: e.target.value })
                                    }
                                    required
                                    options={SESSION_TYPES}
                                />
                                {formErrors.sessionType && (
                                    <p className="text-destructive text-xs mt-1">{formErrors.sessionType}</p>
                                )}
                            </div>

                            {/* Duración */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Duración (min)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.plannedDuration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, plannedDuration: e.target.value })
                                    }
                                    min={1}
                                    max={300}
                                    placeholder="60"
                                />
                            </div>

                            {/* Intensidad y Volumen — Slider */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Slider
                                    label="Intensidad (5/10)"
                                    value={formData.plannedIntensity ? Number(formData.plannedIntensity) : 5}
                                    min={1}
                                    max={10}
                                    color="warning"
                                    onChange={(v) => setFormData({ ...formData, plannedIntensity: String(v) })}
                                />
                                <Slider
                                    label="Volumen (5/10)"
                                    value={formData.plannedVolume ? Number(formData.plannedVolume) : 5}
                                    min={1}
                                    max={10}
                                    color="primary"
                                    onChange={(v) => setFormData({ ...formData, plannedVolume: String(v) })}
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Notas
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Notas adicionales sobre la sesión..."
                                />
                            </div>

                            {/* Bloques + Constructor — space-y-5 (20px) entre cards */}
                            <div className="mt-8 pt-8 border-t border-border space-y-5">
                                <TrainingBlockSelector
                                    selectedBlockTypeIds={[...new Set(constructorRows.map((r) => r.blockTypeId).filter(Boolean))]}
                                    onSelect={(blockTypeId) => {
                                        if (!blockTypeId || !blockTypes.some((bt) => bt.id === blockTypeId)) return;
                                        const newRow: ConstructorRow = {
                                            id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                                            blockTypeId: blockTypeId,
                                            setType: SET_TYPE.SINGLE_SET,
                                            sets: 3,
                                            rounds: null,
                                            timeCap: null,
                                            intervalSeconds: null,
                                            exercises: [],
                                            rest: 60,
                                            repsTipo: "reps",
                                        };
                                        setConstructorRows((prev) => [...prev, newRow]);
                                    }}
                                />
                                <SessionConstructor
                                    rows={constructorRows}
                                    blockTypes={blockTypes}
                                    onRowsChange={setConstructorRows}
                                    onAddExerciseRequest={(rowId) => {
                                        setTargetRowIdForPicker(rowId);
                                        setShowExercisePickerModal(true);
                                    }}
                                />
                            </div>
                        </form>
                    </div>
                    </div>

                    {/* Columna derecha: Plan del día */}
                    {session.client_id && (
                        <div className="lg:w-[380px] shrink-0 lg:self-start">
                            <SessionDayPlan
                                clientId={session.client_id}
                                sessionDate={formData.sessionDate}
                                trainerId={session.trainer_id ?? 0}
                            />
                        </div>
                    )}

                    {showExercisePickerModal && (
                        <ExercisePickerPanel
                            isOpen={true}
                            onClose={() => {
                                setShowExercisePickerModal(false);
                                setTargetRowIdForPicker(null);
                            }}
                            onSelect={handleSelectFromPicker}
                            clientId={session.client_id ?? undefined}
                            activeInjuries={clientActiveInjuries}
                        />
                    )}
                </div>
            </div>

            {/* Barra inferior fija — pegada al bottom, respeta sidebar vía --sidebar-width */}
            <div
                className="fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4 flex justify-end gap-3"
                style={{ left: "var(--sidebar-width, 0)" }}
            >
                <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form="edit-session-form"
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingSession}
                    isLoading={isUpdatingSession}
                >
                    Actualizar Sesión
                </Button>
            </div>
        </>
    );
};






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
import type { TrainingSessionUpdate } from "@nexia/shared/types/trainingSessions";
import type { AppDispatch } from "@nexia/shared/store";
import { SessionDayPlan } from "@/components/sessions/SessionDayPlan";
import { ClientAvatar } from "@/components/ui/avatar";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import { ExercisePickerModal } from "@/components/exercises/ExercisePickerModal";
import type { ConstructorRow, ConstructorExercise } from "@/components/sessionProgramming/constructorTypes";
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

    /** Fase 3: bloque de entrenamiento seleccionado */
    const [activeBlockTypeId, setActiveBlockTypeId] = useState<number | null>(null);

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
            const rows: ConstructorRow[] = blocks.map((b, i) => {
                const exs = exercisesByBlock[b.id] ?? [];
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
            setTargetRowIdForPicker(null);
            setShowExercisePickerModal(false);
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
                        const payload = {
                            exercise_id: ex.exerciseId,
                            order_in_block: j + 1,
                            set_type: row.setType,
                            planned_sets: row.sets,
                            planned_reps: ex.plannedReps,
                            planned_weight: ex.plannedWeight,
                            planned_rest: row.rest,
                            effort_character: ex.effortCharacter,
                            effort_value: ex.effortValue,
                            notes: ex.notes,
                        };
                        if (ex.serverExerciseId) {
                            await updateSessionBlockExercise({
                                id: ex.serverExerciseId,
                                data: payload,
                            }).unwrap();
                            serverExIds.delete(ex.serverExerciseId);
                        } else {
                            await createSessionBlockExercise({
                                blockId: row.serverBlockId,
                                data: payload,
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
                        await createSessionBlockExercise({
                            blockId: created.id,
                            data: {
                                exercise_id: ex.exerciseId,
                                order_in_block: j + 1,
                                set_type: row.setType,
                                planned_sets: row.sets,
                                planned_reps: ex.plannedReps,
                                planned_weight: ex.plannedWeight,
                                planned_rest: row.rest,
                                effort_character: ex.effortCharacter,
                                effort_value: ex.effortValue,
                                notes: ex.notes,
                            },
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
            <div className="space-y-6 pb-24 px-4 lg:px-8">
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

                {/* Grid 2 cols */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
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

                            {/* Constructor de Sesión — Fase 8 */}
                            <div className="mt-8 pt-8 border-t border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-foreground">
                                        Constructor de Sesión
                                    </h3>
                                    {constructorRows.length > 0 && (
                                        <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-full">
                                            {constructorRows.length} serie
                                            {constructorRows.length !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                                <SessionConstructor
                                    rows={constructorRows}
                                    blockTypes={blockTypes}
                                    activeBlockTypeId={activeBlockTypeId}
                                    onRowsChange={setConstructorRows}
                                    onAddExerciseRequest={(rowId) => {
                                        setTargetRowIdForPicker(rowId);
                                        setShowExercisePickerModal(true);
                                    }}
                                />
                            </div>
                        </form>

                        {showExercisePickerModal && (
                            <ExercisePickerModal
                                isOpen={true}
                                onClose={() => {
                                    setShowExercisePickerModal(false);
                                    setTargetRowIdForPicker(null);
                                }}
                                onSelect={handleSelectFromPicker}
                            />
                        )}
                    </div>

                    {/* Columna derecha: Plan del día */}
                    {session.client_id && (
                        <div className="lg:self-start">
                            <SessionDayPlan
                                clientId={session.client_id}
                                sessionDate={formData.sessionDate}
                                trainerId={session.trainer_id ?? 0}
                            />
                        </div>
                    )}
                </div>

                {/* Bloques de Entrenamiento — Fase 3 */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground">
                        Bloques de Entrenamiento
                    </h3>
                    <TrainingBlockSelector
                        activeBlockTypeId={activeBlockTypeId}
                        onSelect={setActiveBlockTypeId}
                    />
                </div>
            </div>

            {/* Barra fija inferior */}
            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background p-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form="edit-session-form"
                    variant="primary"
                    disabled={isUpdatingSession}
                    isLoading={isUpdatingSession}
                >
                    Actualizar Sesión
                </Button>
            </div>
        </>
    );
};






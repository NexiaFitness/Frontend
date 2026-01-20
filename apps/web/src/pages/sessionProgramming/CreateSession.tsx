/**
 * CreateSession.tsx — Página para crear sesión manual
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear sesión manualmente
 * - Permite configurar todos los detalles de la sesión
 * - Cliente viene pre-rellenado desde query params
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useClientMicrocycles } from "@nexia/shared";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import {
    useCreateTrainingSessionMutation,
    useCreateSessionBlockMutation,
    useCreateSessionBlockExerciseMutation,
    useGetTrainingBlockTypesQuery,
} from "@nexia/shared/api/sessionProgrammingApi";
import { buildTrainingSessionCreate } from "@nexia/shared/utils/sessionProgramming";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import type { RootState } from "@nexia/shared/store";
import type {
    SessionBlockExerciseCreate,
    CreateSessionFormErrors,
} from "@nexia/shared/types/sessionProgramming";

const SESSION_TYPES = [
    { value: "training", label: "Entrenamiento" },
    { value: "cardio", label: "Cardio" },
    { value: "strength", label: "Fuerza" },
    { value: "endurance", label: "Resistencia" },
    { value: "flexibility", label: "Flexibilidad" },
    { value: "recovery", label: "Recuperación" },
];

export const CreateSession: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { showSuccess, showError } = useToast();

    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : 0;
    
    // Obtener el trainer_id correcto desde el perfil del trainer (no user.id)
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !user || user.role !== "trainer",
    });
    const trainerId = trainerProfile?.id ?? 0;

    const { data: client } = useGetClientQuery(clientId, { skip: !clientId });

    // Obtener microcycles de los planes activos
    const {
        microcycles,
        isLoading: isLoadingMicrocycles,
    } = useClientMicrocycles({
        clientId,
        maxPlans: 10,
    });

    const [formData, setFormData] = useState({
        sessionName: "",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionType: "training",
        plannedDuration: "",
        plannedIntensity: "",
        plannedVolume: "",
        microcycleId: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<CreateSessionFormErrors>({});

    // Estado de ejercicios
    interface ExerciseFormData {
        exercise_id: number;
        exercise_name: string;
        order_in_block: number;
        planned_sets: number;
        planned_reps: string;
        planned_weight: number | null;
        planned_rest: number | null;
        notes: string | null;
    }

    const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
    const [showExerciseForm, setShowExerciseForm] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState("");

    const [currentExercise, setCurrentExercise] = useState<Partial<ExerciseFormData>>({
        planned_sets: 3,
        planned_reps: "10",
        planned_weight: null,
        planned_rest: 60,
        notes: null,
    });

    // Hooks de mutación para crear sesión, bloque y ejercicios
    const [createTrainingSession, { isLoading: isCreatingSession }] = useCreateTrainingSessionMutation();
    const [createSessionBlock] = useCreateSessionBlockMutation();
    const [createSessionBlockExercise] = useCreateSessionBlockExerciseMutation();

    // Obtener block types para el bloque por defecto
    const { data: blockTypes } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const defaultBlockType = useMemo(() => {
        // Buscar "Main" o "Principal" o el primero disponible
        if (!blockTypes || blockTypes.length === 0) return null;
        const mainBlock = blockTypes.find(
            (bt) => bt.name.toLowerCase().includes("main") || bt.name.toLowerCase().includes("principal")
        );
        return mainBlock || blockTypes[0];
    }, [blockTypes]);

    // Query de ejercicios con búsqueda
    const { data: exercisesData } = useGetExercisesQuery({
        search: exerciseSearch,
        limit: 20,
        skip: 0,
    });

    const availableExercises = useMemo(() => {
        return exercisesData?.exercises || [];
    }, [exercisesData]);

    useEffect(() => {
        if (!clientId) {
            navigate("/dashboard");
        }
    }, [clientId, navigate]);

    // Handler para añadir ejercicio a la lista
    const handleAddExercise = () => {
        if (!currentExercise.exercise_id) {
            showError("Selecciona un ejercicio");
            return;
        }
        if (!currentExercise.planned_sets || currentExercise.planned_sets <= 0) {
            showError("Las series deben ser mayor a 0");
            return;
        }
        if (!currentExercise.planned_reps || currentExercise.planned_reps.trim() === "") {
            showError("Las repeticiones son obligatorias");
            return;
        }

        const selectedExercise = availableExercises.find(
            (ex) => ex.id === currentExercise.exercise_id
        );

        if (!selectedExercise) {
            showError("Ejercicio no encontrado");
            return;
        }

        const newExercise: ExerciseFormData = {
            exercise_id: currentExercise.exercise_id,
            exercise_name: selectedExercise.nombre,
            order_in_block: exercises.length + 1,
            planned_sets: currentExercise.planned_sets,
            planned_reps: currentExercise.planned_reps,
            planned_weight: currentExercise.planned_weight || null,
            planned_rest: currentExercise.planned_rest || null,
            notes: currentExercise.notes || null,
        };

        setExercises([...exercises, newExercise]);
        setCurrentExercise({
            planned_sets: 3,
            planned_reps: "10",
            planned_weight: null,
            planned_rest: 60,
            notes: null,
        });
        setShowExerciseForm(false);
        setExerciseSearch("");
    };

    // Handler para eliminar ejercicio de la lista
    const handleRemoveExercise = (index: number) => {
        // Reordenar los ejercicios restantes
        const updatedExercises = exercises
            .filter((_, i) => i !== index)
            .map((ex, i) => ({
                ...ex,
                order_in_block: i + 1,
            }));
        setExercises(updatedExercises);
    };

    // Handler para búsqueda de ejercicios
    const handleExerciseSearch = (value: string) => {
        setExerciseSearch(value);
    };

    // Crear ejercicios después de crear la sesión
    const createExercisesForSession = async (sessionId: number) => {
        if (exercises.length === 0 || !defaultBlockType) return;

        try {
            // Crear bloque por defecto
            const blockPayload = {
                block_type_id: defaultBlockType.id,
                order_in_session: 1,
                notes: "Bloque principal",
            };

            const createdBlock = await createSessionBlock({
                sessionId,
                data: blockPayload,
            }).unwrap();

            // Añadir ejercicios al bloque
            for (const exercise of exercises) {
                const exercisePayload: SessionBlockExerciseCreate = {
                    exercise_id: exercise.exercise_id,
                    order_in_block: exercise.order_in_block,
                    planned_sets: exercise.planned_sets,
                    planned_reps: exercise.planned_reps,
                    planned_weight: exercise.planned_weight,
                    planned_rest: exercise.planned_rest,
                    notes: exercise.notes,
                };

                await createSessionBlockExercise({
                    blockId: createdBlock.id,
                    data: exercisePayload,
                }).unwrap();
            }
        } catch (error) {
            console.error("Error creando ejercicios:", error);
            // No lanzar error aquí, solo loguear
            // La sesión ya está creada, los ejercicios se pueden añadir después
        }
    };

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
        // Validar microcycle solo si hay microcycles disponibles y no está cargando
        if (!isLoadingMicrocycles) {
            if (microcycles.length > 0 && !formData.microcycleId) {
                errors.microcycleId = "Debe seleccionar un microciclo";
            } else if (microcycles.length === 0) {
                errors.microcycleId = "No hay microciclos disponibles. Por favor, cree un plan de entrenamiento con microciclos primero.";
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Validar microcycleId antes de enviar
            if (!formData.microcycleId || formData.microcycleId === "") {
                setFormErrors({ microcycleId: "Debe seleccionar un microciclo" });
                return;
            }

            const microcycleIdNum = Number(formData.microcycleId);
            if (isNaN(microcycleIdNum) || microcycleIdNum <= 0) {
                setFormErrors({ microcycleId: "El microciclo seleccionado no es válido" });
                return;
            }

            // Validar que el microcycle seleccionado esté en la lista disponible
            const microcycleExists = microcycles.some((mc) => mc.id === microcycleIdNum);
            if (!microcycleExists) {
                setFormErrors({
                    microcycleId: "El microciclo seleccionado ya no está disponible. Por favor, recargue la página y seleccione otro microciclo.",
                });
                return;
            }

            // Construir payload usando función helper de shared
            const sessionData = buildTrainingSessionCreate({
                formData,
                clientId,
                trainerId,
            });

            const createdSession = await createTrainingSession(sessionData).unwrap();

            // Si hay ejercicios, crear bloque y añadir ejercicios
            if (exercises.length > 0 && createdSession?.id) {
                await createExercisesForSession(createdSession.id);
                showSuccess(
                    `Sesión creada exitosamente con ${exercises.length} ejercicio${exercises.length > 1 ? "s" : ""}. Redirigiendo...`,
                    2000
                );
            } else {
                showSuccess("Sesión creada exitosamente. Redirigiendo...", 2000);
            }

            setTimeout(() => {
                navigate(clientId ? `/dashboard/clients/${clientId}` : "/dashboard");
            }, 1500);
        } catch (err) {
            console.error("Error creando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String(
                          (err as { data: unknown }).data || "Error al crear la sesión"
                      )
                    : "Error al crear la sesión";
            showError(errorMessage);
            // DEBUG: Ver el error completo
            if (err && typeof err === "object" && "data" in err) {
                const errorData = (err as { data: unknown }).data;
                console.error("Error data:", JSON.stringify(errorData, null, 2));
                
                // Manejar errores del backend
                if (errorData && typeof errorData === "object" && "detail" in errorData) {
                    const detail = (errorData as { detail: unknown }).detail;
                    if (typeof detail === "string") {
                        // Si el mensaje menciona que el microcycle pertenece a otro cliente
                        if (detail.includes("belongs to client") || detail.includes("not to client")) {
                            setFormErrors({
                                microcycleId: "El microciclo seleccionado pertenece a otro cliente. Por favor, seleccione un microciclo válido para este cliente.",
                            });
                            return;
                        }
                        // Si es un error de integridad o el microcycle no existe
                        if (detail.includes("integrity") || detail.includes("not found") || detail.includes("Microcycle")) {
                            setFormErrors({
                                microcycleId: "El microciclo seleccionado ya no existe o no es válido. Por favor, recargue la página y seleccione otro microciclo.",
                            });
                            return;
                        }
                        // Mostrar el mensaje del backend directamente
                        setFormErrors({
                            microcycleId: detail,
                        });
                        return;
                    }
                }
            }
        }
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Nueva Sesión
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Crear una nueva sesión de entrenamiento
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Formulario */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">
                            Detalles de la Sesión
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre de la Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
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

                            {/* Cliente (read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Cliente
                                </label>
                                <Input
                                    type="text"
                                    value={client ? `${client.nombre} ${client.apellidos}` : "Cargando..."}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Fecha de la Sesión *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.sessionDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionDate: e.target.value })
                                    }
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                                {formErrors.sessionDate && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionDate}</p>
                                )}
                            </div>

                            {/* Tipo de Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionType}</p>
                                )}
                            </div>

                            {/* Duración, Intensidad, Volumen */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Duración Planificada (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedDuration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedDuration: e.target.value })
                                        }
                                        min="0"
                                        placeholder="60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Intensidad Planificada (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedIntensity}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedIntensity: e.target.value })
                                        }
                                        min="1"
                                        max="10"
                                        placeholder="7"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Volumen Planificado (1-10)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.plannedVolume}
                                        onChange={(e) =>
                                            setFormData({ ...formData, plannedVolume: e.target.value })
                                        }
                                        min="1"
                                        max="10"
                                        placeholder="6"
                                    />
                                </div>
                            </div>

                            {/* Microcycle */}
                            {isLoadingMicrocycles ? (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Microciclo
                                    </label>
                                    <div className="text-sm text-slate-500">
                                        Cargando microciclos disponibles...
                                    </div>
                                </div>
                            ) : microcycles.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Microciclo *
                                    </label>
                                    <FormSelect
                                        value={formData.microcycleId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, microcycleId: e.target.value })
                                        }
                                        required
                                        options={[
                                            { value: "", label: "Seleccione un microciclo" },
                                            ...microcycles.map((mc) => ({
                                                value: mc.id.toString(),
                                                label: `${mc.name} (${mc.planName})`,
                                            })),
                                        ]}
                                    />
                                    {formErrors.microcycleId && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.microcycleId}</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Microciclo
                                    </label>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-800">
                                            No hay microciclos disponibles para este cliente. 
                                            Asegúrese de que el cliente tenga planes de entrenamiento activos con microciclos.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
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

                            {/* Sección de Ejercicios */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">
                                Ejercicios de la Sesión
                            </h3>

                            {/* Lista de ejercicios agregados */}
                            {exercises.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {exercises.map((exercise, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {exercise.exercise_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {exercise.planned_sets} series × {exercise.planned_reps} reps
                                                    {exercise.planned_weight && ` @ ${exercise.planned_weight}kg`}
                                                    {exercise.planned_rest && ` • ${exercise.planned_rest}s descanso`}
                                                </p>
                                                {exercise.notes && (
                                                    <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExercise(index)}
                                                className="text-red-600 hover:text-red-800 text-xl font-bold px-2"
                                                aria-label="Eliminar ejercicio"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario para agregar ejercicio */}
                            {showExerciseForm ? (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* Búsqueda de ejercicios */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Buscar Ejercicio *
                                        </label>
                                        <ExerciseSearch
                                            onSearch={handleExerciseSearch}
                                            placeholder="Buscar ejercicio por nombre..."
                                        />
                                    </div>

                                    {/* Selector de ejercicio */}
                                    {availableExercises.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Seleccionar Ejercicio *
                                            </label>
                                            <FormSelect
                                                value={currentExercise.exercise_id?.toString() || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        exercise_id: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                options={[
                                                    { value: "", label: "Selecciona un ejercicio" },
                                                    ...availableExercises.map((ex) => ({
                                                        value: ex.id.toString(),
                                                        label: ex.nombre,
                                                    })),
                                                ]}
                                            />
                                        </div>
                                    )}

                                    {/* Series y Repeticiones */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Series *
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={currentExercise.planned_sets || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_sets: e.target.value ? Number(e.target.value) : undefined,
                                                    })
                                                }
                                                placeholder="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Repeticiones *
                                            </label>
                                            <Input
                                                type="text"
                                                value={currentExercise.planned_reps || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_reps: e.target.value,
                                                    })
                                                }
                                                placeholder="10 o 8-12"
                                            />
                                        </div>
                                    </div>

                                    {/* Peso y Descanso */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Peso (kg)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={currentExercise.planned_weight || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_weight: e.target.value ? Number(e.target.value) : null,
                                                    })
                                                }
                                                placeholder="80"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Descanso (seg)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={currentExercise.planned_rest || ""}
                                                onChange={(e) =>
                                                    setCurrentExercise({
                                                        ...currentExercise,
                                                        planned_rest: e.target.value ? Number(e.target.value) : null,
                                                    })
                                                }
                                                placeholder="60"
                                            />
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Notas
                                        </label>
                                        <Textarea
                                            value={currentExercise.notes || ""}
                                            onChange={(e) =>
                                                setCurrentExercise({
                                                    ...currentExercise,
                                                    notes: e.target.value || null,
                                                })
                                            }
                                            rows={2}
                                            placeholder="Notas sobre este ejercicio..."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleAddExercise}
                                            disabled={!currentExercise.exercise_id}
                                        >
                                            Agregar Ejercicio
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowExerciseForm(false);
                                                setCurrentExercise({
                                                    planned_sets: 3,
                                                    planned_reps: "10",
                                                    planned_weight: null,
                                                    planned_rest: 60,
                                                    notes: null,
                                                });
                                                setExerciseSearch("");
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowExerciseForm(true)}
                                    className="w-full"
                                >
                                    + Agregar Ejercicio
                                </Button>
                            )}

                            {/* Nota informativa */}
                            {exercises.length === 0 && !showExerciseForm && (
                                <p className="text-sm text-gray-500 text-center mt-4">
                                    Añade ejercicios a esta sesión para completar la programación
                                </p>
                            )}
                            </div>

                            {/* Botones de acción del formulario */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isCreatingSession}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    {isCreatingSession ? "Creando..." : "Crear Sesión"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};



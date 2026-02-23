/**
 * ExerciseDetail.tsx — Página de detalle de ejercicio individual
 *
 * Propósito: Mostrar información completa de un ejercicio (nombre, descripción, instrucciones, etc.)
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness
 * Notas de mantenimiento: mantener coherencia con ClientDetail y otras vistas
 *
 * Arquitectura:
 * - Usa backend /exercises/{id} (funcional, legacy pero correcto)
 * - Exercise Catalog solo para Reference Tables
 * - Tipos desde useExercises (alineados con backend)
 *
 * @author Frontend Team
 * @since v4.8.0
 * @updated v5.0.0 - Sub-Fase 2.6: tipos correctos, helpers compartidos, campos alineados con backend
 */

import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetExerciseByIdQuery,
    useDeleteExerciseMutation,
} from "@nexia/shared/hooks/exercises";
import {
    getMuscleLabel,
    getEquipmentLabel,
    getLevelLabel,
    getLevelBadgeColor,
    getMuscleGradient,
} from "@/utils/exercises";

// UI
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { ExerciseAlternativesSection } from "@/components/exercises/ExerciseAlternativesSection";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

export const ExerciseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const exerciseId = id ? parseInt(id, 10) : null;

    const { data: exercise, isLoading, isError, error } = useGetExerciseByIdQuery(
        exerciseId!,
        { skip: !exerciseId }
    );

    const [deleteExercise, { isLoading: isDeleting }] = useDeleteExerciseMutation();

    const handleBack = () => {
        navigate("/dashboard/exercises");
    };

    const handleDelete = async () => {
        if (!exerciseId) return;
        try {
            await deleteExercise(exerciseId).unwrap();
            navigate("/dashboard/exercises", { replace: true });
        } catch {
            setDeleteModalOpen(false);
        }
    };

    // Parsear músculos (comma-separated strings)
    const primaryMuscle = useMemo(() => {
        if (!exercise?.musculatura_principal) return "";
        return exercise.musculatura_principal.split(',')[0].trim();
    }, [exercise?.musculatura_principal]);

    const secondaryMuscles = useMemo(() => {
        if (!exercise?.musculatura_secundaria) return [];
        return exercise.musculatura_secundaria
            .split(',')
            .map((m) => m.trim())
            .filter((m) => m.length > 0);
    }, [exercise?.musculatura_secundaria]);

    if (!exerciseId) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">ID de ejercicio inválido</Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-white">Cargando ejercicio...</p>
            </div>
        );
    }

    if (isError || !exercise) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">
                    Error al cargar el ejercicio. Por favor, intenta de nuevo.
                    {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data && (
                        <div className="mt-2 text-sm">
                            {String(error.data.detail)}
                        </div>
                    )}
                </Alert>
                <Button onClick={handleBack} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Header con botón volver */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="mb-4"
                    >
                        ← Volver a Ejercicios
                    </Button>
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        {exercise.nombre}
                    </h2>
                </div>

                {/* Contenido principal */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        {/* Imagen placeholder con gradiente */}
                        <div
                            className={`aspect-video rounded-xl mb-6 bg-gradient-to-br ${getMuscleGradient(primaryMuscle)} flex items-center justify-center`}
                        >
                            <div className="text-white text-6xl font-bold opacity-50">
                                💪
                            </div>
                        </div>

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                                    Grupo Muscular Principal
                                </p>
                                {primaryMuscle ? (
                                    <p className="text-base font-semibold text-slate-900">
                                        {getMuscleLabel(primaryMuscle)}
                                    </p>
                                ) : (
                                    <p className="text-base text-slate-400">No especificado</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                                    Nivel
                                </p>
                                {exercise.nivel ? (
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getLevelBadgeColor(exercise.nivel)}`}
                                    >
                                        {getLevelLabel(exercise.nivel)}
                                    </span>
                                ) : (
                                    <p className="text-base text-slate-400">No especificado</p>
                                )}
                            </div>
                        </div>

                        {/* Músculos secundarios */}
                        {secondaryMuscles.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                                    Músculos Secundarios
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {secondaryMuscles.map((muscle, index) => (
                                        <span
                                            key={`${muscle}-${index}`}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
                                        >
                                            {getMuscleLabel(muscle)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Equipamiento */}
                        {exercise.equipo && (
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                                    Equipamiento
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                        {getEquipmentLabel(exercise.equipo)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Descripción */}
                        {exercise.descripcion && (
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                                    Descripción
                                </p>
                                <p className="text-base text-slate-700 leading-relaxed">
                                    {exercise.descripcion}
                                </p>
                            </div>
                        )}

                        {/* Instrucciones */}
                        {exercise.instrucciones && (
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                                    Instrucciones
                                </p>
                                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                                    {exercise.instrucciones}
                                </p>
                            </div>
                        )}

                        {/* Notas */}
                        {exercise.notas && (
                            <div className="mb-6">
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                                    Notas
                                </p>
                                <p className="text-base text-slate-700 leading-relaxed">
                                    {exercise.notas}
                                </p>
                            </div>
                        )}

                        {/* Alternativas (TICK-E05) */}
                        <ExerciseAlternativesSection exerciseId={exerciseId} />
                    </div>
                </div>

                {/* Modal confirmar eliminar */}
                {deleteModalOpen && (
                    <BaseModal
                        isOpen={true}
                        onClose={() => setDeleteModalOpen(false)}
                        title="¿Eliminar este ejercicio?"
                        description="Esta acción no se puede deshacer."
                        iconType="danger"
                    >
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Se eliminará &quot;{exercise.nombre}&quot; permanentemente de la base de datos.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        </div>
                    </BaseModal>
                )}
        </>
    );
};

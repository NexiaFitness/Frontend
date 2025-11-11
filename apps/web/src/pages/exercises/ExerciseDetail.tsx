/**
 * ExerciseDetail.tsx — Página de detalle de ejercicio individual
 * 
 * Propósito: Mostrar información completa de un ejercicio (nombre, descripción, instrucciones, etc.).
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientDetail y otras vistas
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetExerciseByIdQuery } from "@nexia/shared/api/exercisesApi";
import {
    MUSCLE_GROUP_ENUM,
    EQUIPMENT_ENUM,
    LEVEL_ENUM,
} from "@nexia/shared/types/exercise";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// UI
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

/**
 * Helper para traducir grupo muscular
 */
const getMuscleLabel = (muscle: string): string => {
    const labels: Record<string, string> = {
        [MUSCLE_GROUP_ENUM.CHEST]: "Pecho",
        [MUSCLE_GROUP_ENUM.BACK]: "Espalda",
        [MUSCLE_GROUP_ENUM.LEGS]: "Piernas",
        [MUSCLE_GROUP_ENUM.SHOULDERS]: "Hombros",
        [MUSCLE_GROUP_ENUM.ARMS]: "Brazos",
        [MUSCLE_GROUP_ENUM.CORE]: "Core",
        [MUSCLE_GROUP_ENUM.FULL_BODY]: "Cuerpo Completo",
    };
    return labels[muscle] || muscle;
};

/**
 * Helper para traducir equipamiento
 */
const getEquipmentLabel = (equipment: string): string => {
    const labels: Record<string, string> = {
        [EQUIPMENT_ENUM.BARBELL]: "Barra",
        [EQUIPMENT_ENUM.DUMBBELL]: "Mancuernas",
        [EQUIPMENT_ENUM.KETTLEBELL]: "Kettlebell",
        [EQUIPMENT_ENUM.RESISTANCE_BAND]: "Banda de Resistencia",
        [EQUIPMENT_ENUM.BODYWEIGHT]: "Peso Corporal",
        [EQUIPMENT_ENUM.MACHINE]: "Máquina",
        [EQUIPMENT_ENUM.CABLE]: "Cable",
        [EQUIPMENT_ENUM.OTHER]: "Otro",
    };
    return labels[equipment] || equipment;
};

/**
 * Helper para traducir nivel
 */
const getLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
        [LEVEL_ENUM.BEGINNER]: "Principiante",
        [LEVEL_ENUM.INTERMEDIATE]: "Intermedio",
        [LEVEL_ENUM.ADVANCED]: "Avanzado",
    };
    return labels[level] || level;
};

/**
 * Helper para color de badge de nivel
 */
const getLevelBadgeColor = (level: string): string => {
    const colors: Record<string, string> = {
        [LEVEL_ENUM.BEGINNER]: "bg-green-100 text-green-700",
        [LEVEL_ENUM.INTERMEDIATE]: "bg-yellow-100 text-yellow-700",
        [LEVEL_ENUM.ADVANCED]: "bg-red-100 text-red-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
};

/**
 * Helper para gradiente por grupo muscular
 */
const getMuscleGradient = (muscle: string): string => {
    const gradients: Record<string, string> = {
        [MUSCLE_GROUP_ENUM.CHEST]: "from-red-400 to-red-600",
        [MUSCLE_GROUP_ENUM.BACK]: "from-blue-400 to-blue-600",
        [MUSCLE_GROUP_ENUM.LEGS]: "from-green-400 to-green-600",
        [MUSCLE_GROUP_ENUM.SHOULDERS]: "from-purple-400 to-purple-600",
        [MUSCLE_GROUP_ENUM.ARMS]: "from-orange-400 to-orange-600",
        [MUSCLE_GROUP_ENUM.CORE]: "from-yellow-400 to-yellow-600",
        [MUSCLE_GROUP_ENUM.FULL_BODY]: "from-indigo-400 to-indigo-600",
    };
    return gradients[muscle] || "from-gray-400 to-gray-600";
};

export const ExerciseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const exerciseId = id ? parseInt(id, 10) : null;

    const { data: exercise, isLoading, isError, error } = useGetExerciseByIdQuery(
        exerciseId!,
        { skip: !exerciseId }
    );

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    const handleBack = () => {
        navigate("/dashboard/exercises");
    };

    if (!exerciseId) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="px-4 lg:px-8">
                        <Alert variant="error">ID de ejercicio inválido</Alert>
                        <Button onClick={handleBack} className="mt-4">
                            Volver a Ejercicios
                        </Button>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="flex justify-center items-center py-16">
                        <LoadingSpinner size="lg" />
                        <p className="ml-4 text-white">Cargando ejercicio...</p>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    if (isError || !exercise) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
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
                </DashboardLayout>
            </>
        );
    }

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
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
                        {exercise.name}
                    </h2>
                </div>

                {/* Contenido principal */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        {/* Imagen o placeholder */}
                        <div className={`aspect-video rounded-xl mb-6 bg-gradient-to-br ${getMuscleGradient(exercise.primary_muscle)} flex items-center justify-center`}>
                            {exercise.image_url ? (
                                <img
                                    src={exercise.image_url}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="text-white text-6xl font-bold opacity-50">
                                    💪
                                </div>
                            )}
                        </div>

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                    Grupo Muscular Principal
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                    {getMuscleLabel(exercise.primary_muscle)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                    Nivel
                                </p>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(exercise.level)}`}
                                >
                                    {getLevelLabel(exercise.level)}
                                </span>
                            </div>
                        </div>

                        {/* Músculos secundarios */}
                        {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Músculos Secundarios
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {exercise.secondary_muscles.map((muscle) => (
                                        <span
                                            key={muscle}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                                        >
                                            {getMuscleLabel(muscle)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Equipamiento */}
                        {exercise.equipment && exercise.equipment.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Equipamiento
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {exercise.equipment.map((equip) => (
                                        <span
                                            key={equip}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                                        >
                                            {getEquipmentLabel(equip)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Descripción */}
                        {exercise.description && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Descripción
                                </p>
                                <p className="text-base text-gray-700 leading-relaxed">
                                    {exercise.description}
                                </p>
                            </div>
                        )}

                        {/* Instrucciones */}
                        {exercise.instructions && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Instrucciones
                                </p>
                                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                                    {exercise.instructions}
                                </p>
                            </div>
                        )}

                        {/* Notas */}
                        {exercise.notes && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Notas
                                </p>
                                <p className="text-base text-gray-700 leading-relaxed">
                                    {exercise.notes}
                                </p>
                            </div>
                        )}

                        {/* Video (si existe) */}
                        {exercise.video_url && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                    Video
                                </p>
                                <div className="aspect-video rounded-xl overflow-hidden">
                                    <iframe
                                        src={exercise.video_url}
                                        title={exercise.name}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

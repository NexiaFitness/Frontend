/**
 * ExerciseCard.tsx — Card individual de ejercicio para lista
 * 
 * Propósito: Componente presentacional reutilizable que muestra información clave del ejercicio.
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientCard y TrainingPlansPage y otras vistas
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import React from "react";
import type { Exercise } from "@nexia/shared/types/exercise";
import { MUSCLE_GROUP_ENUM, EQUIPMENT_ENUM, LEVEL_ENUM } from "@nexia/shared/types/exercise";

interface ExerciseCardProps {
    exercise: Exercise;
    onSelect?: (exercise: Exercise) => void;
}

/**
 * Helper para obtener gradiente por grupo muscular
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
 * Helper para traducir equipamiento
 */
const getEquipmentLabel = (equipment: string): string => {
    const labels: Record<string, string> = {
        [EQUIPMENT_ENUM.BARBELL]: "Barra",
        [EQUIPMENT_ENUM.DUMBBELL]: "Mancuernas",
        [EQUIPMENT_ENUM.KETTLEBELL]: "Kettlebell",
        [EQUIPMENT_ENUM.RESISTANCE_BAND]: "Banda",
        [EQUIPMENT_ENUM.BODYWEIGHT]: "Peso Corporal",
        [EQUIPMENT_ENUM.MACHINE]: "Máquina",
        [EQUIPMENT_ENUM.CABLE]: "Cable",
        [EQUIPMENT_ENUM.OTHER]: "Otro",
    };
    return labels[equipment] || equipment;
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(exercise);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all duration-200 ${
                onSelect ? "cursor-pointer hover:scale-[1.02]" : ""
            }`}
        >
            {/* Imagen placeholder con gradiente */}
            <div className={`aspect-video rounded-xl mb-3 bg-gradient-to-br ${getMuscleGradient(exercise.primary_muscle)} flex items-center justify-center`}>
                {exercise.image_url ? (
                    <img
                        src={exercise.image_url}
                        alt={exercise.name}
                        className="w-full h-full object-cover rounded-xl"
                    />
                ) : (
                    <div className="text-white text-4xl font-bold opacity-50">
                        💪
                    </div>
                )}
            </div>

            {/* Nombre del ejercicio */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {exercise.name}
            </h3>

            {/* Grupo muscular principal */}
            <div className="mb-2">
                <span className="text-sm text-gray-500">
                    {getMuscleLabel(exercise.primary_muscle)}
                </span>
            </div>

            {/* Badges: Nivel y Equipamiento */}
            <div className="flex flex-wrap gap-2 mb-2">
                <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(exercise.level)}`}
                >
                    {getLevelLabel(exercise.level)}
                </span>
                {exercise.equipment.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {getEquipmentLabel(exercise.equipment[0])}
                        {exercise.equipment.length > 1 && ` +${exercise.equipment.length - 1}`}
                    </span>
                )}
            </div>

            {/* Descripción corta (si existe) */}
            {exercise.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                    {exercise.description}
                </p>
            )}
        </div>
    );
};

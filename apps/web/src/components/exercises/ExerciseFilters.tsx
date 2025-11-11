/**
 * ExerciseFilters.tsx — Componente de filtros para lista de ejercicios
 * 
 * Propósito: Panel de filtros para filtrar ejercicios por grupo muscular, equipamiento y nivel.
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientFilters y otras vistas
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import React from "react";
import type { ExerciseFilters as ExerciseFiltersType } from "@nexia/shared/types/exercise";
import {
    MUSCLE_GROUP_ENUM,
    EQUIPMENT_ENUM,
    LEVEL_ENUM,
    type MuscleGroup,
    type Equipment,
    type Level,
} from "@nexia/shared/types/exercise";

interface ExerciseFiltersProps {
    filters: ExerciseFiltersType;
    onChange: (newFilters: Partial<ExerciseFiltersType>) => void;
}

/**
 * Helper para traducir grupo muscular
 */
const getMuscleLabel = (muscle: MuscleGroup): string => {
    const labels: Record<MuscleGroup, string> = {
        [MUSCLE_GROUP_ENUM.CHEST]: "Pecho",
        [MUSCLE_GROUP_ENUM.BACK]: "Espalda",
        [MUSCLE_GROUP_ENUM.LEGS]: "Piernas",
        [MUSCLE_GROUP_ENUM.SHOULDERS]: "Hombros",
        [MUSCLE_GROUP_ENUM.ARMS]: "Brazos",
        [MUSCLE_GROUP_ENUM.CORE]: "Core",
        [MUSCLE_GROUP_ENUM.FULL_BODY]: "Cuerpo Completo",
    };
    return labels[muscle];
};

/**
 * Helper para traducir equipamiento
 */
const getEquipmentLabel = (equipment: Equipment): string => {
    const labels: Record<Equipment, string> = {
        [EQUIPMENT_ENUM.BARBELL]: "Barra",
        [EQUIPMENT_ENUM.DUMBBELL]: "Mancuernas",
        [EQUIPMENT_ENUM.KETTLEBELL]: "Kettlebell",
        [EQUIPMENT_ENUM.RESISTANCE_BAND]: "Banda de Resistencia",
        [EQUIPMENT_ENUM.BODYWEIGHT]: "Peso Corporal",
        [EQUIPMENT_ENUM.MACHINE]: "Máquina",
        [EQUIPMENT_ENUM.CABLE]: "Cable",
        [EQUIPMENT_ENUM.OTHER]: "Otro",
    };
    return labels[equipment];
};

/**
 * Helper para traducir nivel
 */
const getLevelLabel = (level: Level): string => {
    const labels: Record<Level, string> = {
        [LEVEL_ENUM.BEGINNER]: "Principiante",
        [LEVEL_ENUM.INTERMEDIATE]: "Intermedio",
        [LEVEL_ENUM.ADVANCED]: "Avanzado",
    };
    return labels[level];
};

export const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({ filters, onChange }) => {
    const handleMuscleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onChange({ muscle_group: value as MuscleGroup | undefined });
    };

    const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onChange({ equipment: value as Equipment | undefined });
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onChange({ level: value as Level | undefined });
    };

    const handleReset = () => {
        onChange({
            muscle_group: undefined,
            equipment: undefined,
            level: undefined,
        });
    };

    const hasActiveFilters = !!(
        filters.muscle_group ||
        filters.equipment ||
        filters.level
    );

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Grupo Muscular */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Grupo Muscular
                    </label>
                    <select
                        value={filters.muscle_group || ""}
                        onChange={handleMuscleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        {Object.values(MUSCLE_GROUP_ENUM).map((muscle) => (
                            <option key={muscle} value={muscle}>
                                {getMuscleLabel(muscle)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Equipamiento */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Equipamiento
                    </label>
                    <select
                        value={filters.equipment || ""}
                        onChange={handleEquipmentChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        {Object.values(EQUIPMENT_ENUM).map((equipment) => (
                            <option key={equipment} value={equipment}>
                                {getEquipmentLabel(equipment)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Nivel */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                        Nivel
                    </label>
                    <select
                        value={filters.level || ""}
                        onChange={handleLevelChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        {Object.values(LEVEL_ENUM).map((level) => (
                            <option key={level} value={level}>
                                {getLevelLabel(level)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

/**
 * ExerciseFilters.tsx — Componente de filtros para lista de ejercicios
 *
 * Propósito: Panel de filtros para filtrar ejercicios por grupo muscular, equipamiento y nivel
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness
 * Notas de mantenimiento: mantener coherencia con ClientFilters y otras vistas
 *
 * @author Frontend Team
 * @since v4.8.0
 * @updated v5.0.0 - Refactorizado para Exercise Catalog, alineado con backend
 */

import React from "react";
import type { ExerciseFilters as ExerciseFiltersType } from "@nexia/shared/hooks/exercises";
import {
    useGetMuscleGroupsQuery,
    useGetEquipmentQuery,
} from "@nexia/shared/hooks/exercises";
import { getLevelLabel } from "@/utils/exercises";

interface ExerciseFiltersProps {
    filters: ExerciseFiltersType;
    onChange: (newFilters: Partial<ExerciseFiltersType>) => void;
}

// Opciones hardcodeadas para nivel (no hay endpoint en Exercise Catalog)
const levelOptions = ["beginner", "intermediate", "advanced"];

export const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({ filters, onChange }) => {
    // Cargar solo grupos musculares de nivel 2 (no body regions de nivel 1)
    const { data: rawMuscleGroups = [], isLoading: isLoadingMuscleGroups } = useGetMuscleGroupsQuery({
        limit: 100,
        is_active: true,
        level: 2,
    });

    // Filtrar entradas corruptas: descartar items con name_en numerico o sin nombre legible
    const muscleGroups = rawMuscleGroups.filter((mg) => {
        const displayName = mg.name_es || mg.name_en;
        return displayName && isNaN(Number(displayName));
    });

    const { data: equipment = [], isLoading: isLoadingEquipment } = useGetEquipmentQuery({
        limit: 100,
        is_active: true,
    });

    // Handler para cambio de muscle group (usa muscle_group_ids via mapping tables)
    const handleMuscleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            onChange({ muscle_group_ids: [Number(value)] });
        } else {
            onChange({ muscle_group_ids: undefined });
        }
    };

    // Handler para cambio de equipment (usa equipment_ids via mapping tables)
    const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            onChange({ equipment_ids: [Number(value)] });
        } else {
            onChange({ equipment_ids: undefined });
        }
    };

    // Handler para cambio de nivel
    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onChange({ nivel: value });
    };

    // Handler para reset
    const handleReset = () => {
        onChange({
            muscle_group_ids: undefined,
            equipment_ids: undefined,
            nivel: undefined,
            search: undefined,
        });
    };

    // Verificar si hay filtros activos
    const hasActiveFilters = !!(
        filters.muscle_group_ids?.length ||
        filters.equipment_ids?.length ||
        filters.nivel ||
        filters.search
    );

    // Obtener valor seleccionado de muscle group
    const selectedMuscleGroupId = filters.muscle_group_ids?.[0]?.toString() ?? "";

    // Obtener valor seleccionado de equipment
    const selectedEquipmentId = filters.equipment_ids?.[0]?.toString() ?? "";

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Filtros</h3>
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
                    <label
                        htmlFor="exercise-filter-muscle-group"
                        className="block text-xs font-medium text-slate-700 mb-2"
                    >
                        Grupo Muscular
                    </label>
                    <select
                        id="exercise-filter-muscle-group"
                        value={selectedMuscleGroupId}
                        onChange={handleMuscleGroupChange}
                        disabled={isLoadingMuscleGroups}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {isLoadingMuscleGroups ? "Cargando..." : "Todos"}
                        </option>
                        {muscleGroups.map((muscleGroup) => (
                            <option key={muscleGroup.id} value={muscleGroup.id.toString()}>
                                {muscleGroup.name_es || muscleGroup.name_en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Equipamiento */}
                <div>
                    <label
                        htmlFor="exercise-filter-equipment"
                        className="block text-xs font-medium text-slate-700 mb-2"
                    >
                        Equipamiento
                    </label>
                    <select
                        id="exercise-filter-equipment"
                        value={selectedEquipmentId}
                        onChange={handleEquipmentChange}
                        disabled={isLoadingEquipment}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {isLoadingEquipment ? "Cargando..." : "Todos"}
                        </option>
                        {equipment.map((eq) => (
                            <option key={eq.id} value={eq.id.toString()}>
                                {eq.name_es || eq.name_en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Nivel */}
                <div>
                    <label
                        htmlFor="exercise-filter-level"
                        className="block text-xs font-medium text-slate-700 mb-2"
                    >
                        Nivel
                    </label>
                    <select
                        id="exercise-filter-level"
                        value={filters.nivel || ""}
                        onChange={handleLevelChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        {levelOptions.map((level) => (
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

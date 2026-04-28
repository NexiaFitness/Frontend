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
    useGetMovementPatternsQuery,
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

    const { data: movementPatterns = [], isLoading: isLoadingMovementPatterns } = useGetMovementPatternsQuery({
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

    // Handler para cambio de patrón de movimiento
    const handleMovementPatternChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            onChange({ movement_pattern_ids: [Number(value)] });
        } else {
            onChange({ movement_pattern_ids: undefined });
        }
    };

    // Handler para reset
    const handleReset = () => {
        onChange({
            muscle_group_ids: undefined,
            equipment_ids: undefined,
            movement_pattern_ids: undefined,
            nivel: undefined,
            search: undefined,
        });
    };

    // Verificar si hay filtros activos
    const hasActiveFilters = !!(
        filters.muscle_group_ids?.length ||
        filters.equipment_ids?.length ||
        filters.movement_pattern_ids?.length ||
        filters.nivel ||
        filters.search
    );

    // Obtener valor seleccionado de muscle group
    const selectedMuscleGroupId = filters.muscle_group_ids?.[0]?.toString() ?? "";

    // Obtener valor seleccionado de equipment
    const selectedEquipmentId = filters.equipment_ids?.[0]?.toString() ?? "";

    // Obtener valor seleccionado de movement pattern
    const selectedMovementPatternId = filters.movement_pattern_ids?.[0]?.toString() ?? "";

    return (
        <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Grupo Muscular */}
                <div>
                    <label
                        htmlFor="exercise-filter-muscle-group"
                        className="block text-xs font-medium text-muted-foreground mb-2"
                    >
                        Grupo Muscular
                    </label>
                    <select
                        id="exercise-filter-muscle-group"
                        value={selectedMuscleGroupId}
                        onChange={handleMuscleGroupChange}
                        disabled={isLoadingMuscleGroups}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="block text-xs font-medium text-muted-foreground mb-2"
                    >
                        Equipamiento
                    </label>
                    <select
                        id="exercise-filter-equipment"
                        value={selectedEquipmentId}
                        onChange={handleEquipmentChange}
                        disabled={isLoadingEquipment}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="block text-xs font-medium text-muted-foreground mb-2"
                    >
                        Nivel
                    </label>
                    <select
                        id="exercise-filter-level"
                        value={filters.nivel || ""}
                        onChange={handleLevelChange}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                    >
                        <option value="">Todos</option>
                        {levelOptions.map((level) => (
                            <option key={level} value={level}>
                                {getLevelLabel(level)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Patrón de movimiento */}
                <div>
                    <label
                        htmlFor="exercise-filter-movement-pattern"
                        className="block text-xs font-medium text-muted-foreground mb-2"
                    >
                        Patrón de movimiento
                    </label>
                    <select
                        id="exercise-filter-movement-pattern"
                        value={selectedMovementPatternId}
                        onChange={handleMovementPatternChange}
                        disabled={isLoadingMovementPatterns}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {isLoadingMovementPatterns ? "Cargando..." : "Todos"}
                        </option>
                        {movementPatterns.map((mp) => (
                            <option key={mp.id} value={mp.id.toString()}>
                                {mp.name_es || mp.name_en}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

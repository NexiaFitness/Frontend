/**
 * ExercisesLibraryToolbar.tsx — Búsqueda, filtros catálogo (API) y toggle vista.
 */

import React from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import type { ExerciseLoadType } from "@nexia/shared/types/exerciseLoadType";
import { EXERCISE_LOAD_TYPE_FILTER_OPTIONS } from "@nexia/shared/types/exerciseLoadType";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    EXERCISES_LIBRARY_FILTER_FIELD,
    EXERCISES_LIBRARY_FILTER_FIELD_WIDE,
    EXERCISES_LIBRARY_FILTER_LABEL,
    EXERCISES_LIBRARY_SEARCH_FIELD,
    EXERCISES_LIBRARY_SEARCH_ICON,
    EXERCISES_LIBRARY_SEARCH_INPUT,
    EXERCISES_LIBRARY_SECTION_LABELS,
    EXERCISES_LIBRARY_SELECT,
    EXERCISES_LIBRARY_TOOLBAR,
    EXERCISES_LIBRARY_TOOLBAR_GRID,
    EXERCISES_LIBRARY_VIEW_TOGGLE,
    EXERCISES_LIBRARY_VIEW_TOGGLE_BTN,
    EXERCISES_LIBRARY_VIEW_TOGGLE_BTN_ACTIVE,
    EXERCISES_LIBRARY_VIEW_TOGGLE_WRAP,
    type ExercisesLibraryCatalogOption,
} from "./exercisesLibraryPresentation";

type ViewMode = "grid" | "list";

const LEVEL_FILTERS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
] as const;

export interface ExercisesLibraryToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    muscleGroupFilterId: number | "all";
    onMuscleGroupFilterChange: (value: number | "all") => void;
    equipmentFilterId: number | "all";
    onEquipmentFilterChange: (value: number | "all") => void;
    levelFilter: string;
    onLevelFilterChange: (value: string) => void;
    patternFilterId: number | "all";
    onPatternFilterChange: (value: number | "all") => void;
    loadTypeFilter: "all" | ExerciseLoadType;
    onLoadTypeFilterChange: (value: "all" | ExerciseLoadType) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    muscleGroups: ExercisesLibraryCatalogOption[];
    equipmentOptions: ExercisesLibraryCatalogOption[];
    patternOptions: ExercisesLibraryCatalogOption[];
    isLoadingMuscleGroups?: boolean;
    isLoadingEquipment?: boolean;
    isLoadingPatterns?: boolean;
}

export const ExercisesLibraryToolbar: React.FC<ExercisesLibraryToolbarProps> = ({
    search,
    onSearchChange,
    muscleGroupFilterId,
    onMuscleGroupFilterChange,
    equipmentFilterId,
    onEquipmentFilterChange,
    levelFilter,
    onLevelFilterChange,
    patternFilterId,
    onPatternFilterChange,
    loadTypeFilter,
    onLoadTypeFilterChange,
    viewMode,
    onViewModeChange,
    muscleGroups,
    equipmentOptions,
    patternOptions,
    isLoadingMuscleGroups = false,
    isLoadingEquipment = false,
    isLoadingPatterns = false,
}) => (
    <div className={EXERCISES_LIBRARY_TOOLBAR}>
        <NexiaGlassAccentRim />
        <div className={EXERCISES_LIBRARY_TOOLBAR_GRID}>
            <div className={EXERCISES_LIBRARY_SEARCH_FIELD}>
                <label htmlFor="exercises-library-search" className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.search}
                </label>
                <div className="relative mt-1 w-full min-w-0">
                    <Search className={EXERCISES_LIBRARY_SEARCH_ICON} aria-hidden />
                    <Input
                        id="exercises-library-search"
                        size="sm"
                        placeholder="Buscar ejercicio..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={EXERCISES_LIBRARY_SEARCH_INPUT}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <label htmlFor="exercises-library-muscle-group" className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.muscleGroup}
                </label>
                <select
                    id="exercises-library-muscle-group"
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={muscleGroupFilterId === "all" ? "all" : String(muscleGroupFilterId)}
                    onChange={(e) => {
                        const v = e.target.value;
                        onMuscleGroupFilterChange(v === "all" ? "all" : Number(v));
                    }}
                    disabled={isLoadingMuscleGroups}
                    aria-label="Filtrar por grupo muscular"
                >
                    <option value="all">{isLoadingMuscleGroups ? "Cargando..." : "Todos"}</option>
                    {muscleGroups.map((mg) => (
                        <option key={mg.id} value={String(mg.id)}>
                            {mg.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <label htmlFor="exercises-library-equipment" className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.equipment}
                </label>
                <select
                    id="exercises-library-equipment"
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={equipmentFilterId === "all" ? "all" : String(equipmentFilterId)}
                    onChange={(e) => {
                        const v = e.target.value;
                        onEquipmentFilterChange(v === "all" ? "all" : Number(v));
                    }}
                    disabled={isLoadingEquipment}
                    aria-label="Filtrar por equipamiento"
                >
                    <option value="all">{isLoadingEquipment ? "Cargando..." : "Todos"}</option>
                    {equipmentOptions.map((eq) => (
                        <option key={eq.id} value={String(eq.id)}>
                            {eq.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <label htmlFor="exercises-library-level" className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.level}
                </label>
                <select
                    id="exercises-library-level"
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={levelFilter}
                    onChange={(e) => onLevelFilterChange(e.target.value)}
                    aria-label="Filtrar por nivel"
                >
                    <option value="all">Todos</option>
                    {LEVEL_FILTERS.map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD_WIDE}>
                <label htmlFor="exercises-library-pattern" className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.movementPattern}
                </label>
                <select
                    id="exercises-library-pattern"
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={patternFilterId === "all" ? "all" : String(patternFilterId)}
                    onChange={(e) => {
                        const v = e.target.value;
                        onPatternFilterChange(v === "all" ? "all" : Number(v));
                    }}
                    disabled={isLoadingPatterns}
                    aria-label="Filtrar por patrón de movimiento"
                >
                    <option value="all">{isLoadingPatterns ? "Cargando..." : "Todos"}</option>
                    {patternOptions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <span className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.loadType}
                </span>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={loadTypeFilter}
                    onChange={(e) =>
                        onLoadTypeFilterChange(e.target.value as "all" | ExerciseLoadType)
                    }
                    aria-label="Filtrar por tipo de carga"
                >
                    <option value="all">Todos</option>
                    {EXERCISE_LOAD_TYPE_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_VIEW_TOGGLE_WRAP} role="group" aria-label="Vista">
                <div className={EXERCISES_LIBRARY_VIEW_TOGGLE}>
                    <button
                        type="button"
                        className={
                            viewMode === "grid"
                                ? EXERCISES_LIBRARY_VIEW_TOGGLE_BTN_ACTIVE
                                : EXERCISES_LIBRARY_VIEW_TOGGLE_BTN
                        }
                        onClick={() => onViewModeChange("grid")}
                        aria-pressed={viewMode === "grid"}
                        aria-label="Vista cuadrícula"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        className={
                            viewMode === "list"
                                ? EXERCISES_LIBRARY_VIEW_TOGGLE_BTN_ACTIVE
                                : EXERCISES_LIBRARY_VIEW_TOGGLE_BTN
                        }
                        onClick={() => onViewModeChange("list")}
                        aria-pressed={viewMode === "list"}
                        aria-label="Vista lista"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

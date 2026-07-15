/**
 * ExercisesLibraryToolbar.tsx — Búsqueda, filtros y toggle vista (biblioteca ejercicios).
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
    groupFilter: string;
    onGroupFilterChange: (value: string) => void;
    equipFilter: string;
    onEquipFilterChange: (value: string) => void;
    levelFilter: string;
    onLevelFilterChange: (value: string) => void;
    patternFilter: string;
    onPatternFilterChange: (value: string) => void;
    loadTypeFilter: "all" | ExerciseLoadType;
    onLoadTypeFilterChange: (value: "all" | ExerciseLoadType) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    groups: string[];
    equipment: string[];
    patterns: string[];
    getMuscleLabel: (value: string) => string;
    getEquipmentLabel: (value: string) => string;
}

export const ExercisesLibraryToolbar: React.FC<ExercisesLibraryToolbarProps> = ({
    search,
    onSearchChange,
    groupFilter,
    onGroupFilterChange,
    equipFilter,
    onEquipFilterChange,
    levelFilter,
    onLevelFilterChange,
    patternFilter,
    onPatternFilterChange,
    loadTypeFilter,
    onLoadTypeFilterChange,
    viewMode,
    onViewModeChange,
    groups,
    equipment,
    patterns,
    getMuscleLabel,
    getEquipmentLabel,
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
                <span className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.muscleGroup}
                </span>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={groupFilter}
                    onChange={(e) => onGroupFilterChange(e.target.value)}
                    aria-label="Filtrar por grupo muscular"
                >
                    <option value="all">Todos</option>
                    {groups.map((g) => (
                        <option key={g} value={g}>
                            {getMuscleLabel(g)}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <span className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.equipment}
                </span>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={equipFilter}
                    onChange={(e) => onEquipFilterChange(e.target.value)}
                    aria-label="Filtrar por equipamiento"
                >
                    <option value="all">Todos</option>
                    {equipment.map((eq) => (
                        <option key={eq} value={eq}>
                            {getEquipmentLabel(eq.replace(/_/g, " "))}
                        </option>
                    ))}
                </select>
            </div>

            <div className={EXERCISES_LIBRARY_FILTER_FIELD}>
                <span className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.level}
                </span>
                <select
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
                <span className={EXERCISES_LIBRARY_FILTER_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.movementPattern}
                </span>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "mt-1")}
                    value={patternFilter}
                    onChange={(e) => onPatternFilterChange(e.target.value)}
                    aria-label="Filtrar por patrón de movimiento"
                >
                    <option value="all">Todos</option>
                    {patterns.map((p) => (
                        <option key={p} value={p}>
                            {p}
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

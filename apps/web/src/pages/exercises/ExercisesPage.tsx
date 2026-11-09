/**
 * ExercisesPage.tsx — Biblioteca de ejercicios premium (admin/entrenador).
 *
 * Filtros server-side vía GET /exercises/ + catálogo de referencia (muscle_groups, equipment, patterns).
 * Ruta: /dashboard/exercises
 * Solo lectura: H8-B retiró el alta local (borradores ex-new-* que no llegaban al servidor). Los
 * ejercicios se dan de alta en la ficha admin del catálogo o por Excel.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { ExerciseLoadType } from "@nexia/shared/types/exerciseLoadType";
import {
    useGetExercisesQuery,
    useGetMuscleGroupsQuery,
    useGetEquipmentQuery,
    useGetMovementPatternsQuery,
} from "@nexia/shared/hooks/exercises";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExercisesLibraryEmptyState } from "@/components/exercises/ExercisesLibraryEmptyState";
import { ExercisesLibraryTable } from "@/components/exercises/ExercisesLibraryTable";
import { ExercisesLibraryToolbar } from "@/components/exercises/ExercisesLibraryToolbar";
import {
    EXERCISES_LIBRARY_CARD_GRID,
    EXERCISES_LIBRARY_FETCHING,
    EXERCISES_LIBRARY_GLOW,
    EXERCISES_LIBRARY_HEADER,
    EXERCISES_LIBRARY_LOADING_ROW,
    EXERCISES_LIBRARY_PAGE,
    EXERCISES_LIBRARY_STACK,
    EXERCISES_LIBRARY_TITLE_WRAP,
    exercisesLibraryHeading,
} from "@/components/exercises/exercisesLibraryPresentation";
import { buildCatalogFilterOptions } from "@/utils/exercises";

type ViewMode = "grid" | "list";
type CatalogFilterId = number | "all";

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 300;

export const ExercisesPage: React.FC = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [muscleGroupFilterId, setMuscleGroupFilterId] = useState<CatalogFilterId>("all");
    const [equipmentFilterId, setEquipmentFilterId] = useState<CatalogFilterId>("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [patternFilterId, setPatternFilterId] = useState<CatalogFilterId>("all");
    const [loadTypeFilter, setLoadTypeFilter] = useState<"all" | ExerciseLoadType>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [search]);

    const { data: rawMuscleGroups = [], isLoading: isLoadingMuscleGroups } =
        useGetMuscleGroupsQuery({ limit: 100, is_active: true, level: 2 });

    const { data: rawEquipment = [], isLoading: isLoadingEquipment } = useGetEquipmentQuery({
        limit: 100,
        is_active: true,
    });

    const { data: rawPatterns = [], isLoading: isLoadingPatterns } = useGetMovementPatternsQuery({
        limit: 100,
        is_active: true,
    });

    const muscleGroupOptions = useMemo(
        () => buildCatalogFilterOptions(rawMuscleGroups),
        [rawMuscleGroups]
    );
    const equipmentOptions = useMemo(() => buildCatalogFilterOptions(rawEquipment), [rawEquipment]);
    const patternOptions = useMemo(() => buildCatalogFilterOptions(rawPatterns), [rawPatterns]);

    const hasServerFilters =
        muscleGroupFilterId !== "all" ||
        equipmentFilterId !== "all" ||
        levelFilter !== "all" ||
        patternFilterId !== "all" ||
        loadTypeFilter !== "all" ||
        debouncedSearch.trim().length > 0;

    const queryArgs = useMemo(
        () => ({
            skip: (currentPage - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
            ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
            ...(muscleGroupFilterId !== "all"
                ? { muscle_group_ids: [muscleGroupFilterId] }
                : {}),
            ...(equipmentFilterId !== "all" ? { equipment_ids: [equipmentFilterId] } : {}),
            ...(levelFilter !== "all" ? { nivel: levelFilter } : {}),
            ...(patternFilterId !== "all"
                ? {
                      movement_pattern_ids: [patternFilterId],
                      movement_pattern_role: "primary" as const,
                  }
                : {}),
            ...(loadTypeFilter !== "all" ? { tipo_carga: loadTypeFilter } : {}),
        }),
        [
            currentPage,
            debouncedSearch,
            muscleGroupFilterId,
            equipmentFilterId,
            levelFilter,
            patternFilterId,
            loadTypeFilter,
        ]
    );

    const { data, isLoading, isError, isFetching, refetch } = useGetExercisesQuery(queryArgs);

    const exercises = data?.exercises ?? [];
    const totalFiltered = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        muscleGroupFilterId,
        equipmentFilterId,
        levelFilter,
        patternFilterId,
        loadTypeFilter,
        debouncedSearch,
    ]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        scrollDashboardMainToTop("smooth");
    }, []);

    const openExercise = useCallback(
        (ex: Exercise) => navigate(`/dashboard/exercises/${ex.id}`),
        [navigate]
    );

    const showLoading = isLoading && !data;
    const hasListTotal = data != null;
    const libraryIsEmpty = hasListTotal && !hasServerFilters && totalFiltered === 0;
    const headingCount: number | null = hasListTotal ? totalFiltered : null;

    return (
        <div className={EXERCISES_LIBRARY_PAGE}>
            <div className={EXERCISES_LIBRARY_GLOW} aria-hidden />

            <div className={EXERCISES_LIBRARY_STACK}>
                <div className={EXERCISES_LIBRARY_HEADER}>
                    <div
                        className={EXERCISES_LIBRARY_TITLE_WRAP}
                        aria-busy={showLoading}
                        aria-live="polite"
                    >
                        <PageTitle title={exercisesLibraryHeading(headingCount)} />
                    </div>
                </div>

                <ExercisesLibraryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    muscleGroupFilterId={muscleGroupFilterId}
                    onMuscleGroupFilterChange={setMuscleGroupFilterId}
                    equipmentFilterId={equipmentFilterId}
                    onEquipmentFilterChange={setEquipmentFilterId}
                    levelFilter={levelFilter}
                    onLevelFilterChange={setLevelFilter}
                    patternFilterId={patternFilterId}
                    onPatternFilterChange={setPatternFilterId}
                    loadTypeFilter={loadTypeFilter}
                    onLoadTypeFilterChange={setLoadTypeFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    muscleGroups={muscleGroupOptions}
                    equipmentOptions={equipmentOptions}
                    patternOptions={patternOptions}
                    isLoadingMuscleGroups={isLoadingMuscleGroups}
                    isLoadingEquipment={isLoadingEquipment}
                    isLoadingPatterns={isLoadingPatterns}
                />

                {isError && (
                    <Alert
                        variant="error"
                        action={
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                Reintentar
                            </Button>
                        }
                    >
                        <span className="font-medium">Error al cargar ejercicios</span>
                    </Alert>
                )}

                {showLoading && (
                    <div className={EXERCISES_LIBRARY_LOADING_ROW}>
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {!showLoading && !isError && exercises.length === 0 && (
                    <ExercisesLibraryEmptyState variant={libraryIsEmpty ? "library" : "filtered"} />
                )}

                {!showLoading && !isError && exercises.length > 0 && viewMode === "grid" && (
                    <div className={EXERCISES_LIBRARY_CARD_GRID}>
                        {exercises.map((ex) => (
                            <ExerciseCard
                                key={ex.id}
                                exercise={ex}
                                onSelect={() => openExercise(ex)}
                                appearance="premium"
                            />
                        ))}
                    </div>
                )}

                {!showLoading && !isError && exercises.length > 0 && viewMode === "list" && (
                    <ExercisesLibraryTable
                        exercises={exercises}
                        onSelect={openExercise}
                    />
                )}

                {!showLoading && !isError && exercises.length > 0 && totalPages > 1 && (
                    <PaginationBar
                        currentPage={safeCurrentPage}
                        totalPages={totalPages}
                        totalItems={totalFiltered}
                        pageSize={PAGE_SIZE}
                        onPageChange={handlePageChange}
                    />
                )}

                {isFetching && !isLoading && data && (
                    <p className={EXERCISES_LIBRARY_FETCHING} aria-live="polite">
                        Actualizando…
                    </p>
                )}
            </div>
        </div>
    );
};

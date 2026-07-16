/**
 * ExercisesPage.tsx — Biblioteca de ejercicios premium (admin/entrenador).
 *
 * Filtros server-side vía GET /exercises/ + catálogo de referencia (muscle_groups, equipment, patterns).
 * Ruta: /dashboard/exercises
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
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
import {
    ExercisesLibraryNewFormPanel,
    type NewExerciseFormState,
} from "@/components/exercises/ExercisesLibraryNewFormPanel";
import { ExercisesLibraryTable } from "@/components/exercises/ExercisesLibraryTable";
import { ExercisesLibraryToolbar } from "@/components/exercises/ExercisesLibraryToolbar";
import {
    EXERCISES_LIBRARY_CARD_GRID,
    EXERCISES_LIBRARY_FETCHING,
    EXERCISES_LIBRARY_GLOW,
    EXERCISES_LIBRARY_HEADER,
    EXERCISES_LIBRARY_LOADING_ROW,
    EXERCISES_LIBRARY_PAGE,
    EXERCISES_LIBRARY_PRIMARY_CTA,
    EXERCISES_LIBRARY_STACK,
    EXERCISES_LIBRARY_TITLE_WRAP,
    exercisesLibraryHeading,
    EXERCISE_MANUAL_CREATE_ENABLED,
} from "@/components/exercises/exercisesLibraryPresentation";
import type { LocalExerciseView } from "@/types/exerciseLocal";
import {
    buildCatalogFilterOptions,
    catalogOptionLabels,
    getMuscleLabel,
    localViewToExercise,
} from "@/utils/exercises";

type ViewMode = "grid" | "list";
type CatalogFilterId = number | "all";

const PAGE_SIZE = 9;
const SEARCH_DEBOUNCE_MS = 300;

const emptyForm = (): NewExerciseFormState => ({
    name: "",
    muscleGroup: "",
    tipo: "Compuesto",
    equipment: "",
    level: "intermediate",
    movementPattern: "",
    descripcion: "",
    instrucciones: "",
    notas: "",
    videoUrl: "",
});

export const ExercisesPage: React.FC = () => {
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [muscleGroupFilterId, setMuscleGroupFilterId] = useState<CatalogFilterId>("all");
    const [equipmentFilterId, setEquipmentFilterId] = useState<CatalogFilterId>("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [patternFilterId, setPatternFilterId] = useState<CatalogFilterId>("all");
    const [loadTypeFilter, setLoadTypeFilter] = useState<"all" | ExerciseLoadType>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [localAdditions, setLocalAdditions] = useState<LocalExerciseView[]>([]);
    const [form, setForm] = useState<NewExerciseFormState>(emptyForm());

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

    const apiExercises = data?.exercises ?? [];
    const totalFromApi = data?.total ?? 0;

    const exercises = useMemo(() => {
        if (hasServerFilters || localAdditions.length === 0) {
            return apiExercises;
        }
        const localEx = localAdditions.map(localViewToExercise);
        return [...localEx, ...apiExercises];
    }, [apiExercises, localAdditions, hasServerFilters]);

    const totalFiltered = hasServerFilters ? totalFromApi : totalFromApi + localAdditions.length;
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

    const paginatedExercises = exercises;

    const videoUrlByExerciseId = useMemo(() => {
        const map: Record<string, string | null | undefined> = {};
        for (const ex of paginatedExercises) {
            if (ex.exercise_id.startsWith("ex-new")) {
                map[ex.exercise_id] =
                    localAdditions.find((l) => l.rowId === ex.exercise_id)?.videoUrl ?? null;
            }
        }
        return map;
    }, [paginatedExercises, localAdditions]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        scrollDashboardMainToTop("smooth");
    }, []);

    const saveExercise = useCallback(() => {
        if (!form.name.trim() || !form.muscleGroup.trim()) return;

        const rowId = `ex-new-${Date.now()}`;
        const tipoBackend = form.tipo === "Aislamiento" ? "monoarticular" : "multiarticular";
        const newEx: LocalExerciseView = {
            rowId,
            nombre: form.name.trim(),
            musculatura_principal: form.muscleGroup.trim(),
            tipo: tipoBackend,
            nivel: form.level,
            equipo: form.equipment
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .join(", ") || "bodyweight",
            patron_movimiento: form.movementPattern.trim() || "general",
            tipo_carga: "external",
            categoria: "Basic",
            descripcion: form.descripcion.trim() || null,
            instrucciones: form.instrucciones.trim() || null,
            notas: form.notas.trim() || null,
            videoUrl: form.videoUrl.trim() || null,
        };
        setLocalAdditions((prev) => [newEx, ...prev]);
        setShowForm(false);
        setForm(emptyForm());
    }, [form]);

    const openExercise = useCallback(
        (ex: Exercise) => {
            if (ex.exercise_id.startsWith("ex-new")) {
                const local = localAdditions.find((l) => l.rowId === ex.exercise_id);
                if (local) {
                    navigate(`/dashboard/exercises/${local.rowId}`, {
                        state: { localExercise: local },
                    });
                }
            } else {
                navigate(`/dashboard/exercises/${ex.id}`);
            }
        },
        [navigate, localAdditions]
    );

    const formMuscleGroupLabels = useMemo(
        () => catalogOptionLabels(muscleGroupOptions),
        [muscleGroupOptions]
    );
    const formPatternLabels = useMemo(
        () => catalogOptionLabels(patternOptions),
        [patternOptions]
    );

    const showLoading = isLoading && !data;
    const libraryIsEmpty = !hasServerFilters && totalFromApi === 0 && localAdditions.length === 0;

    return (
        <div className={EXERCISES_LIBRARY_PAGE}>
            <div className={EXERCISES_LIBRARY_GLOW} aria-hidden />

            <div className={EXERCISES_LIBRARY_STACK}>
                <div className={EXERCISES_LIBRARY_HEADER}>
                    <div className={EXERCISES_LIBRARY_TITLE_WRAP}>
                        <PageTitle title={exercisesLibraryHeading(totalFiltered)} />
                    </div>
                    {EXERCISE_MANUAL_CREATE_ENABLED && (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setShowForm(!showForm)}
                            className={EXERCISES_LIBRARY_PRIMARY_CTA}
                        >
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            Nuevo ejercicio
                        </Button>
                    )}
                </div>

                {EXERCISE_MANUAL_CREATE_ENABLED && showForm && (
                    <ExercisesLibraryNewFormPanel
                        form={form}
                        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                        onSave={saveExercise}
                        onClose={() => setShowForm(false)}
                        groups={formMuscleGroupLabels}
                        patterns={formPatternLabels}
                        getMuscleLabel={getMuscleLabel}
                    />
                )}

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
                                variant="outline-destructive"
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

                {!showLoading && !isError && paginatedExercises.length === 0 && (
                    <ExercisesLibraryEmptyState
                        variant={libraryIsEmpty ? "library" : "filtered"}
                        action={
                            EXERCISE_MANUAL_CREATE_ENABLED && libraryIsEmpty ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowForm(true)}
                                    className={EXERCISES_LIBRARY_PRIMARY_CTA}
                                >
                                    <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                                    Añadir primer ejercicio
                                </Button>
                            ) : undefined
                        }
                    />
                )}

                {!showLoading && !isError && paginatedExercises.length > 0 && viewMode === "grid" && (
                    <div className={EXERCISES_LIBRARY_CARD_GRID}>
                        {paginatedExercises.map((ex) => {
                            const key = ex.exercise_id.startsWith("ex-new")
                                ? ex.exercise_id
                                : String(ex.id);
                            const vid = videoUrlByExerciseId[ex.exercise_id] ?? null;
                            return (
                                <ExerciseCard
                                    key={key}
                                    exercise={ex}
                                    videoUrl={vid}
                                    onSelect={() => openExercise(ex)}
                                    appearance="premium"
                                />
                            );
                        })}
                    </div>
                )}

                {!showLoading && !isError && paginatedExercises.length > 0 && viewMode === "list" && (
                    <ExercisesLibraryTable
                        exercises={paginatedExercises}
                        onSelect={openExercise}
                    />
                )}

                {!showLoading && !isError && paginatedExercises.length > 0 && totalPages > 1 && (
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

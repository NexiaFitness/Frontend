/**
 * ExercisesPage.tsx — Biblioteca de ejercicios premium (admin/entrenador).
 *
 * Ruta: /dashboard/exercises
 * Doc: docs/design/01_PREMIUM_PLATFORM_MIGRATION.md · exercisesLibraryPresentation.ts
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { ExerciseLoadType } from "@nexia/shared/types/exerciseLoadType";
import {
    exerciseLoadTypeLabel,
    exerciseLoadTypeMatchesFilter,
} from "@nexia/shared/types/exerciseLoadType";
import { useGetExerciseLibraryQuery } from "@nexia/shared/hooks/exercises";
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
    getFilterOptions,
    exerciseMatchesMuscleFilter,
    exerciseMuscleSearchText,
    exerciseEquipmentTokens,
    exercisePatternLabels,
    equipmentDisplayLine,
    getMuscleLabel,
    getEquipmentLabel,
    normalizeLevel,
    localViewToExercise,
} from "@/utils/exercises";

type ViewMode = "grid" | "list";

const PAGE_SIZE = 9;

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
    const { data, isLoading, isError, isFetching, refetch } = useGetExerciseLibraryQuery();

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState("all");
    const [equipFilter, setEquipFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [patternFilter, setPatternFilter] = useState("all");
    const [loadTypeFilter, setLoadTypeFilter] = useState<"all" | ExerciseLoadType>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [localAdditions, setLocalAdditions] = useState<LocalExerciseView[]>([]);
    const [form, setForm] = useState<NewExerciseFormState>(emptyForm());

    const exercises = useMemo(() => {
        const apiExercises = data?.exercises ?? [];
        const localEx = localAdditions.map(localViewToExercise);
        return [...apiExercises, ...localEx];
    }, [data?.exercises, localAdditions]);

    const filterOpts = useMemo(() => getFilterOptions(exercises), [exercises]);

    const filtered = useMemo(() => {
        let list = [...exercises];
        if (groupFilter !== "all") {
            list = list.filter((e) => exerciseMatchesMuscleFilter(e, groupFilter));
        }
        if (equipFilter !== "all") {
            list = list.filter((e) => exerciseEquipmentTokens(e).includes(equipFilter));
        }
        if (levelFilter !== "all") {
            list = list.filter((e) => normalizeLevel(e.nivel || "") === levelFilter);
        }
        if (patternFilter !== "all") {
            const pf = patternFilter.trim().toLowerCase();
            list = list.filter((e) =>
                exercisePatternLabels(e).some((p) => p.trim().toLowerCase() === pf)
            );
        }
        if (loadTypeFilter !== "all") {
            list = list.filter((e) => exerciseLoadTypeMatchesFilter(e.tipo_carga, loadTypeFilter));
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((e) => {
                const muscle = exerciseMuscleSearchText(e);
                const equip = equipmentDisplayLine(e).toLowerCase();
                const pat = exercisePatternLabels(e).join(" ").toLowerCase();
                const loadLabel = exerciseLoadTypeLabel(e.tipo_carga).toLowerCase();
                return (
                    e.nombre.toLowerCase().includes(q) ||
                    (e.nombre_ingles || "").toLowerCase().includes(q) ||
                    muscle.includes(q) ||
                    equip.includes(q) ||
                    pat.includes(q) ||
                    loadLabel.includes(q) ||
                    (e.musculatura_principal || "").toLowerCase().includes(q)
                );
            });
        }
        return list.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }, [exercises, groupFilter, equipFilter, levelFilter, patternFilter, loadTypeFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [groupFilter, equipFilter, levelFilter, patternFilter, loadTypeFilter, search]);

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedExercises = useMemo(() => {
        const start = (safeCurrentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, safeCurrentPage]);

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

    const showLoading = isLoading && !data;

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
                        groups={filterOpts.groups}
                        patterns={filterOpts.patterns}
                        getMuscleLabel={getMuscleLabel}
                    />
                )}

                <ExercisesLibraryToolbar
                    search={search}
                    onSearchChange={setSearch}
                    groupFilter={groupFilter}
                    onGroupFilterChange={setGroupFilter}
                    equipFilter={equipFilter}
                    onEquipFilterChange={setEquipFilter}
                    levelFilter={levelFilter}
                    onLevelFilterChange={setLevelFilter}
                    patternFilter={patternFilter}
                    onPatternFilterChange={setPatternFilter}
                    loadTypeFilter={loadTypeFilter}
                    onLoadTypeFilterChange={setLoadTypeFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    groups={filterOpts.groups}
                    equipment={filterOpts.equip}
                    patterns={filterOpts.patterns}
                    getMuscleLabel={getMuscleLabel}
                    getEquipmentLabel={getEquipmentLabel}
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

                {!showLoading && !isError && filtered.length === 0 && (
                    <ExercisesLibraryEmptyState
                        variant={exercises.length === 0 ? "library" : "filtered"}
                        action={
                            EXERCISE_MANUAL_CREATE_ENABLED && exercises.length === 0 ? (
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

                {!showLoading && !isError && filtered.length > 0 && viewMode === "grid" && (
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

                {!showLoading && !isError && filtered.length > 0 && viewMode === "list" && (
                    <ExercisesLibraryTable
                        exercises={paginatedExercises}
                        onSelect={openExercise}
                    />
                )}

                {!showLoading && !isError && filtered.length > 0 && totalPages > 1 && (
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

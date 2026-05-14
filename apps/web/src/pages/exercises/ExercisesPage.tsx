/**
 * ExercisesPage — Biblioteca de ejercicios (spec Lovable /dashboard/exercises)
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Play, Plus, Search, X } from "lucide-react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { useGetExerciseLibraryQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import type { LocalExerciseView } from "@/types/exerciseLocal";
import {
    getFilterOptions,
    muscleFacetLabel,
    exerciseEquipmentTokens,
    exercisePatternLabels,
    equipmentDisplayLine,
    getGroupColor,
    getLevelLabel,
    getLevelTextClass,
    getMuscleLabel,
    getEquipmentLabel,
    normalizeLevel,
    localViewToExercise,
    tipoLabelFromBackend,
} from "@/utils/exercises";

type ViewMode = "grid" | "list";

/** Misma talla de página que la lista de clientes (VISTA_CLIENTES_SPEC). */
const PAGE_SIZE = 9;

const LEVEL_FILTERS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
] as const;

interface NewExerciseFormState {
    name: string;
    muscleGroup: string;
    tipo: "Compuesto" | "Aislamiento";
    equipment: string;
    level: string;
    movementPattern: string;
    descripcion: string;
    instrucciones: string;
    notas: string;
    videoUrl: string;
}

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

const selectClass =
    "h-9 rounded-md border border-border bg-surface px-2 text-xs text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]";

export const ExercisesPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError, isFetching, refetch } = useGetExerciseLibraryQuery();

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState("all");
    const [equipFilter, setEquipFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const [patternFilter, setPatternFilter] = useState("all");
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
            list = list.filter(
                (e) =>
                    muscleFacetLabel(e).trim().toLowerCase() ===
                    groupFilter.trim().toLowerCase()
            );
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
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((e) => {
                const muscle = muscleFacetLabel(e).toLowerCase();
                const equip = equipmentDisplayLine(e).toLowerCase();
                const pat = exercisePatternLabels(e).join(" ").toLowerCase();
                return (
                    e.nombre.toLowerCase().includes(q) ||
                    (e.nombre_ingles || "").toLowerCase().includes(q) ||
                    muscle.includes(q) ||
                    equip.includes(q) ||
                    pat.includes(q) ||
                    (e.musculatura_principal || "").toLowerCase().includes(q)
                );
            });
        }
        return list.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }, [exercises, groupFilter, equipFilter, levelFilter, patternFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [groupFilter, equipFilter, levelFilter, patternFilter, search]);

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

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
            tipo_carga: "ext",
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
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle title="Ejercicios" subtitle={`${exercises.length} ejercicios disponibles`} />
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                    className="w-full min-h-touch sm:w-auto sm:min-h-0"
                >
                    <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                    Nuevo ejercicio
                </Button>
            </div>

            {/* Formulario nuevo ejercicio */}
            {showForm && (
                <div className="space-y-4 rounded-lg border border-primary/30 bg-card p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Nuevo ejercicio</h2>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 p-0"
                            onClick={() => setShowForm(false)}
                            aria-label="Cerrar formulario"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Nombre *
                            </label>
                            <Input
                                size="sm"
                                placeholder="Nombre del ejercicio"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="bg-surface"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Grupo muscular *
                            </label>
                            {filterOpts.groups.length > 0 ? (
                                <select
                                    className={cn(selectClass, "w-full")}
                                    value={form.muscleGroup}
                                    onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value }))}
                                >
                                    <option value="">Seleccionar…</option>
                                    {filterOpts.groups.map((g) => (
                                        <option key={g} value={g}>
                                            {getMuscleLabel(g)}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    size="sm"
                                    placeholder="Ej. Pecho, Espalda…"
                                    value={form.muscleGroup}
                                    onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value }))}
                                    className="bg-surface"
                                />
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
                            <select
                                className={cn(selectClass, "w-full")}
                                value={form.tipo}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        tipo: e.target.value as "Compuesto" | "Aislamiento",
                                    }))
                                }
                            >
                                <option value="Compuesto">Compuesto</option>
                                <option value="Aislamiento">Aislamiento</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Equipamiento
                            </label>
                            <Input
                                size="sm"
                                placeholder="Barra, Mancuernas..."
                                value={form.equipment}
                                onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
                                className="bg-surface"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nivel</label>
                            <select
                                className={cn(selectClass, "w-full")}
                                value={form.level}
                                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                            >
                                {LEVEL_FILTERS.map((l) => (
                                    <option key={l.value} value={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Patrón de movimiento
                            </label>
                            <select
                                className={cn(selectClass, "w-full")}
                                value={form.movementPattern}
                                onChange={(e) => setForm((f) => ({ ...f, movementPattern: e.target.value }))}
                            >
                                <option value="">Seleccionar…</option>
                                {filterOpts.patterns.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Descripción
                            </label>
                            <Textarea
                                value={form.descripcion}
                                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                                className="bg-surface min-h-[80px]"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Instrucciones
                            </label>
                            <Textarea
                                value={form.instrucciones}
                                onChange={(e) => setForm((f) => ({ ...f, instrucciones: e.target.value }))}
                                className="bg-surface min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Notas</label>
                            <Textarea
                                value={form.notas}
                                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                                className="bg-surface min-h-[60px]"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                URL de video (opcional)
                            </label>
                            <Input
                                size="sm"
                                type="url"
                                placeholder="https://youtube.com/..."
                                value={form.videoUrl}
                                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                                className="bg-surface"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" variant="default" size="sm" onClick={saveExercise}>
                            Guardar
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Una fila: Buscar a la izquierda, filtros, toggle (wrap en pantallas estrechas) */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex min-w-0 flex-1 flex-col basis-[12rem]">
                    <label
                        htmlFor="exercises-library-search"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                    >
                        Buscar
                    </label>
                    <div className="relative w-full min-w-0">
                        <Search
                            className="pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-primary"
                            aria-hidden
                        />
                        <Input
                            id="exercises-library-search"
                            size="sm"
                            placeholder="Buscar ejercicio..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full min-w-0 bg-surface pl-9"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="flex w-36 shrink-0 flex-col">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Grupo muscular
                    </span>
                    <select
                        className={cn(selectClass, "w-full")}
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        aria-label="Filtrar por grupo muscular"
                    >
                        <option value="all">Todos</option>
                        {filterOpts.groups.map((g) => (
                            <option key={g} value={g}>
                                {getMuscleLabel(g)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex w-36 shrink-0 flex-col">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Equipamiento</span>
                    <select
                        className={cn(selectClass, "w-full")}
                        value={equipFilter}
                        onChange={(e) => setEquipFilter(e.target.value)}
                        aria-label="Filtrar por equipamiento"
                    >
                        <option value="all">Todos</option>
                        {filterOpts.equip.map((eq) => (
                            <option key={eq} value={eq}>
                                {getEquipmentLabel(eq.replace(/_/g, " "))}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex w-32 shrink-0 flex-col">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Nivel</span>
                    <select
                        className={cn(selectClass, "w-full")}
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
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
                <div className="flex w-40 shrink-0 flex-col">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Patrón de movimiento
                    </span>
                    <select
                        className={cn(selectClass, "w-full")}
                        value={patternFilter}
                        onChange={(e) => setPatternFilter(e.target.value)}
                        aria-label="Filtrar por patrón de movimiento"
                    >
                        <option value="all">Todos</option>
                        {filterOpts.patterns.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex shrink-0 self-end" role="group" aria-label="Vista">
                    <div className="flex gap-1 rounded-md border border-border p-0.5">
                        <button
                            type="button"
                            className={cn(
                                "rounded p-1.5 transition-colors",
                                viewMode === "grid"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setViewMode("grid")}
                            aria-pressed={viewMode === "grid"}
                            aria-label="Vista cuadrícula"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "rounded p-1.5 transition-colors",
                                viewMode === "list"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setViewMode("list")}
                            aria-pressed={viewMode === "list"}
                            aria-label="Vista lista"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Estados error / loading */}
            {isError && (
                <Alert
                    variant="error"
                    action={
                        <Button type="button" variant="outline-destructive" size="sm" onClick={() => refetch()}>
                            Reintentar
                        </Button>
                    }
                >
                    <span className="font-medium">Error al cargar ejercicios</span>
                </Alert>
            )}

            {showLoading && (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {!showLoading && !isError && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg bg-surface py-20 text-center">
                    <p className="mb-1 font-medium text-foreground">Tu biblioteca está vacía.</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Añade ejercicios para construir tu biblioteca.
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="w-full min-h-touch sm:w-auto sm:min-h-0"
                    >
                        <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                        Añadir primer ejercicio
                    </Button>
                </div>
            )}

            {!showLoading && !isError && filtered.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedExercises.map((ex) => {
                        const key = ex.exercise_id.startsWith("ex-new") ? ex.exercise_id : String(ex.id);
                        const vid =
                            ex.exercise_id.startsWith("ex-new")
                                ? localAdditions.find((l) => l.rowId === ex.exercise_id)?.videoUrl ?? null
                                : null;
                        return (
                            <ExerciseCard
                                key={key}
                                exercise={ex}
                                videoUrl={vid}
                                onSelect={() => openExercise(ex)}
                                className="h-full border border-border/60"
                            />
                        );
                    })}
                </div>
            )}

            {!showLoading && !isError && filtered.length > 0 && viewMode === "list" && (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-surface text-left text-xs text-muted-foreground">
                                <th className="p-3 font-medium">Nombre</th>
                                <th className="p-3 font-medium">Grupo muscular</th>
                                <th className="p-3 font-medium">Tipo</th>
                                <th className="p-3 font-medium">Equipamiento</th>
                                <th className="p-3 font-medium">Nivel</th>
                                <th className="w-16 p-3 text-center font-medium">Video</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExercises.map((ex) => {
                                const muscle = muscleFacetLabel(ex);
                                const gc = getGroupColor(muscle || ex.musculatura_principal || "");
                                const ln = normalizeLevel(ex.nivel || "");
                                const vid =
                                    ex.exercise_id.startsWith("ex-new")
                                        ? localAdditions.find((l) => l.rowId === ex.exercise_id)?.videoUrl ??
                                          null
                                        : null;
                                const equipLine = equipmentDisplayLine(ex);
                                return (
                                    <tr
                                        key={ex.exercise_id.startsWith("ex-new") ? ex.exercise_id : String(ex.id)}
                                        className="cursor-pointer border-b border-border transition-colors hover:bg-surface-2"
                                        onClick={() => openExercise(ex)}
                                    >
                                        <td className="p-3 font-medium text-foreground">{exerciseDisplayName(ex)}</td>
                                        <td className="p-3">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "border-0 px-1.5 py-0 text-[10px] font-medium",
                                                    gc.bg,
                                                    gc.text
                                                )}
                                            >
                                                {getMuscleLabel(muscle)}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">
                                            {tipoLabelFromBackend(ex.tipo || "")}
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">
                                            {equipLine || getEquipmentLabel(ex.equipo || "")}
                                        </td>
                                        <td
                                            className={cn(
                                                "p-3 text-xs font-medium",
                                                getLevelTextClass(ln)
                                            )}
                                        >
                                            {getLevelLabel(ex.nivel || "")}
                                        </td>
                                        <td className="p-3 text-center">
                                            {vid ? (
                                                <Play className="mx-auto h-3.5 w-3.5 text-primary" aria-label="Video" />
                                            ) : null}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
                <p className="text-xs text-muted-foreground" aria-live="polite">
                    Actualizando…
                </p>
            )}
        </div>
    );
};

/**
 * ExercisePickerPanel.tsx — Panel lateral de seleccion de ejercicios
 *
 * Contexto:
 * - Panel fijo 300px a la derecha del Constructor (no overlay).
 * - Visible cuando exercisePickerOpen && viewport >= lg.
 * - En movil (< lg): oculto (hidden). Flujo alternativo: drawer/modal.
 * - Lista agrupada por letra inicial, busqueda en tiempo real.
 * - Fase 4: safety-check batch via motor real, alternativas integradas en panel.
 * - UX: el motor recomienda; el entrenador puede añadir con precaución (nunca bloqueo duro en UI).
 * - Reutilizable: CreateSession, EditSession.
 *
 * @author Frontend Team
 * @since v6.4.0
 * @updated Fase 4 — batch safety-check + vista alternativas + añadir con precaución
 */

import React, { useEffect, useMemo, useState } from "react";
import { X, Search, Plus, TriangleAlert, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import {
    useGetExercisesQuery,
    useCheckExerciseSafetyBatchMutation,
    useGetSafeAlternativesQuery,
} from "@nexia/shared/hooks/exercises";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyResponse, ExerciseSafetyBatchResponse } from "@nexia/shared/types/engineSafety";
import { exerciseDisplayName } from "@nexia/shared";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

/** Normaliza texto para búsqueda insensible a mayúsculas y tildes. */
function foldForSearch(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase();
}

function groupExercisesByLetter(exercises: Exercise[]): [string, Exercise[]][] {
    const map = new Map<string, Exercise[]>();
    for (const ex of exercises) {
        const letter = (exerciseDisplayName(ex)[0] ?? "?").toUpperCase();
        const list = map.get(letter) ?? [];
        list.push(ex);
        map.set(letter, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export interface ExercisePickerPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
    clientId?: number | null;
    activeInjuries?: InjuryWithDetails[];
}

export const ExercisePickerPanel: React.FC<ExercisePickerPanelProps> = ({
    isOpen,
    onClose,
    onSelect,
    clientId,
    activeInjuries = [],
}) => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"list" | "alternatives">("list");
    const [selectedExerciseIdForAlternatives, setSelectedExerciseIdForAlternatives] = useState<number | null>(null);
    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);
    const [safetyResults, setSafetyResults] = useState<Map<number, ExerciseSafetyResponse>>(new Map());

    const { data, isLoading } = useGetExercisesQuery({
        skip: 0,
        limit: 500,
    });

    const [checkBatch, { isLoading: isLoadingBatch }] = useCheckExerciseSafetyBatchMutation();

    const exercises = useMemo(() => data?.exercises ?? [], [data]);

    // Batch safety-check al montar o cuando cambia clientId / exercises
    useEffect(() => {
        if (!clientId || exercises.length === 0) {
            setSafetyResults(new Map());
            return;
        }
        const ids = exercises.map((e) => e.id);
        checkBatch({ client_id: clientId, exercise_ids: ids })
            .unwrap()
            .then((data: ExerciseSafetyBatchResponse) => {
                const map = new Map<number, ExerciseSafetyResponse>();
                for (const [key, value] of Object.entries(data.results)) {
                    map.set(Number(key), value as ExerciseSafetyResponse);
                }
                setSafetyResults(map);
            })
            .catch(() => {
                // Fallback: no safety data => all exercises appear safe
                setSafetyResults(new Map());
            });
    }, [clientId, exercises, checkBatch]);

    const filteredAndGrouped = useMemo(() => {
        const term = foldForSearch(search.trim());
        const filtered = term
            ? exercises.filter((ex) => {
                  const n = foldForSearch(exerciseDisplayName(ex));
                  const en = foldForSearch(ex.nombre_ingles ?? "");
                  return n.includes(term) || en.includes(term);
              })
            : exercises;
        return groupExercisesByLetter(filtered);
    }, [exercises, search]);

    const hasActiveInjuries = activeInjuries.length > 0;

    const handleShowAlternatives = (exerciseId: number) => {
        setSelectedExerciseIdForAlternatives(exerciseId);
        setView("alternatives");
        setExpandedExerciseId(null);
    };

    const handleSelectAlternative = (ex: Exercise) => {
        onSelect(ex);
        setView("list");
        setSelectedExerciseIdForAlternatives(null);
    };

    const handleBackToList = () => {
        setView("list");
        setSelectedExerciseIdForAlternatives(null);
    };

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "rounded-lg border border-border border-l-2 border-l-primary bg-card text-card-foreground shadow-sm overflow-hidden",
                "flex w-[300px] shrink-0 flex-col self-start",
                "max-h-[600px] lg:max-h-[600px]",
                "fixed right-0 top-0 bottom-0 z-50 shadow-xl",
                "lg:relative lg:right-auto lg:top-auto lg:bottom-auto lg:z-auto lg:shadow-sm"
            )}
        >
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-border p-3">
                <h3 className="text-sm font-semibold text-foreground">
                    {view === "alternatives" ? "Alternativas seguras" : "Lista de Ejercicios"}
                </h3>
                <div className="flex items-center gap-1">
                    {view === "alternatives" && (
                        <button
                            type="button"
                            onClick={handleBackToList}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label="Volver a lista"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label="Cerrar panel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {view === "list" ? (
                <ListView
                    isLoading={isLoading}
                    isLoadingBatch={isLoadingBatch}
                    hasActiveInjuries={hasActiveInjuries}
                    search={search}
                    setSearch={setSearch}
                    filteredAndGrouped={filteredAndGrouped}
                    safetyResults={safetyResults}
                    expandedExerciseId={expandedExerciseId}
                    setExpandedExerciseId={setExpandedExerciseId}
                    onSelect={onSelect}
                    onShowAlternatives={handleShowAlternatives}
                />
            ) : (
                <AlternativesView
                    exerciseId={selectedExerciseIdForAlternatives}
                    clientId={clientId}
                    onSelectAlternative={handleSelectAlternative}
                />
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Sub-component: List view
// ---------------------------------------------------------------------------

interface ListViewProps {
    isLoading: boolean;
    isLoadingBatch: boolean;
    hasActiveInjuries: boolean;
    search: string;
    setSearch: (s: string) => void;
    filteredAndGrouped: [string, Exercise[]][];
    safetyResults: Map<number, ExerciseSafetyResponse>;
    expandedExerciseId: number | null;
    setExpandedExerciseId: (id: number | null) => void;
    onSelect: (exercise: Exercise) => void;
    onShowAlternatives: (exerciseId: number) => void;
}

const ListView: React.FC<ListViewProps> = ({
    isLoading,
    isLoadingBatch,
    hasActiveInjuries,
    search,
    setSearch,
    filteredAndGrouped,
    safetyResults,
    expandedExerciseId,
    setExpandedExerciseId,
    onSelect,
    onShowAlternatives,
}) => {
    return (
        <>
            {/* Aviso lesiones */}
            {hasActiveInjuries && (
                <div className="mx-3 mt-3 flex items-start gap-2 rounded-md bg-warning/10 p-2 text-[11px] text-warning">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Ejercicios contraindicados marcados.</span>
                </div>
            )}

            {/* Batch loading indicator */}
            {isLoadingBatch && (
                <div className="mx-3 mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <LoadingSpinner size="sm" />
                    <span>Verificando seguridad...</span>
                </div>
            )}

            {/* Busqueda */}
            <div className="relative mx-3 mt-3 min-w-0">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-primary pointer-events-none z-10" />
                <Input
                    type="text"
                    size="compact"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ejercicio..."
                    className="w-full pl-7"
                    aria-label="Buscar ejercicio"
                />
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 scrollbar-primary">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                ) : filteredAndGrouped.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No se encontraron ejercicios.
                    </p>
                ) : (
                    filteredAndGrouped.map(([letter, groupExercises]) => (
                        <div key={letter}>
                            <span className="block text-[11px] font-bold text-primary/70 mb-1">
                                {letter}
                            </span>
                            <div className="space-y-0.5">
                                {groupExercises.map((ex) => {
                                    const safety = safetyResults.get(ex.id);
                                    const isUnsafe = safety ? !safety.is_safe : false;
                                    const isExpanded = expandedExerciseId === ex.id;

                                    return (
                                        <div key={ex.id}>
                                            <button
                                                type="button"
                                                aria-disabled={isUnsafe}
                                                onClick={() => {
                                                    if (isUnsafe) {
                                                        setExpandedExerciseId(isExpanded ? null : ex.id);
                                                    } else {
                                                        onSelect(ex);
                                                    }
                                                }}
                                                title={
                                                    isUnsafe
                                                        ? safety?.reason?.trim() ||
                                                          "Contraindicado por lesión activa"
                                                        : undefined
                                                }
                                                className={cn(
                                                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                                                    isUnsafe
                                                        ? "cursor-pointer opacity-90 hover:bg-surface-2"
                                                        : "hover:bg-surface-2"
                                                )}
                                            >
                                                {isUnsafe && (
                                                    <TriangleAlert className="h-3 w-3 shrink-0 text-destructive" />
                                                )}
                                                <span className="flex-1 truncate text-xs">
                                                    {exerciseDisplayName(ex)}
                                                </span>
                                                {isUnsafe ? (
                                                    <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive ring-1 ring-destructive/40">
                                                        LESIÓN
                                                    </span>
                                                ) : (
                                                    <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                )}
                                            </button>

                                            {/* Expanded detail for unsafe exercise */}
                                            {isExpanded && safety && (
                                                <div className="mx-1 mb-1 rounded-md border border-destructive/30 bg-destructive/10 p-2 space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-semibold text-destructive">
                                                                Contraindicado
                                                            </p>
                                                            {safety.reason && (
                                                                <p className="text-[11px] text-destructive/80 leading-snug">
                                                                    {safety.reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onShowAlternatives(ex.id)}
                                                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                                                        >
                                                            <ShieldAlert className="h-3 w-3 shrink-0" />
                                                            Ver alternativas
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                onSelect(ex);
                                                                setExpandedExerciseId(null);
                                                            }}
                                                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-warning/40 bg-warning/10 px-2 py-1.5 text-[11px] font-medium text-warning transition-colors hover:bg-warning/20"
                                                        >
                                                            <Plus className="h-3 w-3 shrink-0" />
                                                            Añadir con precaución
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

// ---------------------------------------------------------------------------
// Sub-component: Alternatives view
// ---------------------------------------------------------------------------

interface AlternativesViewProps {
    exerciseId: number | null;
    clientId?: number | null;
    onSelectAlternative: (exercise: Exercise) => void;
}

const AlternativesView: React.FC<AlternativesViewProps> = ({
    exerciseId,
    clientId,
    onSelectAlternative,
}) => {
    const { data, isLoading, isError } = useGetSafeAlternativesQuery(
        { exerciseId: exerciseId ?? 0, clientId: clientId ?? 0 },
        { skip: !exerciseId || !clientId }
    );

    if (!exerciseId || !clientId) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">Selecciona un ejercicio.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex-1 p-4">
                <Alert variant="error">No se pudieron cargar las alternativas.</Alert>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 scrollbar-primary">
            {/* Original exercise */}
            <div
                className={cn(
                    "rounded-md border p-3 space-y-1",
                    data.is_original_safe
                        ? "border-success/30 bg-success/10"
                        : "border-destructive/30 bg-destructive/10"
                )}
            >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Ejercicio original
                </p>
                <div className="flex items-center gap-2">
                    {data.is_original_safe ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    ) : (
                        <TriangleAlert className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span
                        className={cn(
                            "text-xs font-medium",
                            data.is_original_safe ? "text-success" : "text-destructive"
                        )}
                    >
                        {data.is_original_safe ? "Seguro" : "Contraindicado"}
                    </span>
                </div>
            </div>

            {/* Alternatives list */}
            {data.alternatives.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-4 text-center space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {data.no_alternatives_found
                            ? "No hay alternativas seguras que trabajen los mismos músculos principales con puntuación suficiente."
                            : "No hay alternativas seguras sugeridas para este ejercicio con las lesiones activas."}
                    </p>
                    {data.no_alternatives_found ? (
                        <p className="text-xs text-muted-foreground">
                            Revisa lesiones activas, el catálogo del ejercicio o registra sustituciones
                            manuales en el backend.
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Alternativas seguras
                    </p>
                    {data.alternatives.map((alt: Exercise, _idx: number) => (
                        <button
                            key={alt.id}
                            type="button"
                            onClick={() => onSelectAlternative(alt)}
                            className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-2 py-2 text-left transition-colors hover:border-primary/30 hover:bg-surface-2"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground truncate">
                                    {exerciseDisplayName(alt)}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {alt.patron_movimiento}
                                    {alt.equipo ? ` · ${alt.equipo}` : ""}
                                </p>
                            </div>
                            <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

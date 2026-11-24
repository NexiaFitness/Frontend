/**
 * ExercisePickerPanel.tsx — Panel lateral de seleccion de ejercicios
 *
 * Contexto:
 * - Panel fijo 300px a la derecha del Constructor (no overlay).
 * - Visible cuando exercisePickerOpen && viewport >= lg.
 * - En movil (< lg): oculto (hidden). Flujo alternativo: drawer/modal.
 * - Lista agrupada por letra inicial, busqueda en tiempo real.
 * - Fase 4: safety-check batch via motor real, alternativas integradas en panel.
 * - H7: si blocking es verdadero no hay botón de añadir. Un aviso articular sin bloqueo
 *   sigue con «Añadir con precaución». Si el lote falla, se avisa y ninguna fila se pinta
 *   como sin hallazgo.
 * - Fila en ExercisePickerRow (H4) y vista de alternativas en
 *   ExercisePickerAlternativesView (PERF-7); este archivo queda con el panel y la lista,
 *   que comparten el estado de seguridad.
 * - Reutilizable: CreateSession, EditSession.
 *
 * @author Frontend Team
 * @since v6.4.0
 * @updated Fase 4 — batch safety-check + vista alternativas + añadir con precaución
 */

import React, { useEffect, useMemo, useState } from "react";
import { X, Search, ArrowLeft, RotateCcw } from "lucide-react";
import {
    useGetExercisesQuery,
    useCheckExerciseSafetyBatchMutation,
} from "@nexia/shared/hooks/exercises";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type {
    ExerciseSafetyResponse,
    ExerciseSafetyBatchResponse,
} from "@nexia/shared/types/engineSafety";
import { exerciseDisplayName } from "@nexia/shared";
import { exerciseSafetyUiState } from "@nexia/shared/utils/exerciseSafetyState";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner, Alert, NexiaSemanticIcon } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { ExercisePickerAlternativesView } from "./ExercisePickerAlternativesView";
import { ExercisePickerRow } from "./ExercisePickerRow";
import {
    EXERCISE_PICKER_BATCH_ALERT,
    EXERCISE_PICKER_COPY,
    EXERCISE_PICKER_INJURY_BANNER,
} from "./exercisePickerPresentation";

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
    mode?: 'sidebar' | 'inline';
}

export const ExercisePickerPanel: React.FC<ExercisePickerPanelProps> = ({
    isOpen,
    onClose,
    onSelect,
    clientId,
    activeInjuries = [],
    mode = 'sidebar',
}) => {
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"list" | "alternatives">("list");
    const [selectedExerciseIdForAlternatives, setSelectedExerciseIdForAlternatives] = useState<number | null>(null);
    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);
    const [safetyResults, setSafetyResults] = useState<Map<number, ExerciseSafetyResponse>>(new Map());
    const [safetyCheckFailed, setSafetyCheckFailed] = useState(false);
    const [safetyRetry, setSafetyRetry] = useState(0);

    // Solo ejercicios con contrato completo: los incompletos no se pueden añadir (H1 R3).
    const { data, isLoading } = useGetExercisesQuery({
        skip: 0,
        limit: 500,
        contract: "complete",
        ...(clientId != null ? { client_id: clientId } : {}),
    });

    const [checkBatch, { isLoading: isLoadingBatch }] = useCheckExerciseSafetyBatchMutation();

    const exercises = useMemo(() => data?.exercises ?? [], [data]);

    const activeInjuriesKey = useMemo(
        () => activeInjuries.map((i) => i.id).sort((a, b) => a - b).join(","),
        [activeInjuries]
    );

    // Batch safety-check al montar o cuando cambia clientId / exercises / lesiones activas
    useEffect(() => {
        setSafetyCheckFailed(false);
        if (!clientId || exercises.length === 0) {
            setSafetyResults(new Map());
            return;
        }
        // Vacía el mapa anterior: mientras llega el lote nuevo, ninguna fila queda como segura.
        let cancelled = false;
        setSafetyResults((current) => (current.size === 0 ? current : new Map()));
        const ids = exercises.map((e) => e.id);
        checkBatch({ client_id: clientId, exercise_ids: ids })
            .unwrap()
            .then((data: ExerciseSafetyBatchResponse) => {
                if (cancelled) return;
                const map = new Map<number, ExerciseSafetyResponse>();
                for (const [key, value] of Object.entries(data.results)) {
                    map.set(Number(key), value as ExerciseSafetyResponse);
                }
                setSafetyResults(map);
            })
            .catch(() => {
                if (cancelled) return;
                // H4: no data is never «safe»; rows stay unchecked and the error is shown.
                setSafetyResults(new Map());
                setSafetyCheckFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [clientId, exercises, checkBatch, activeInjuriesKey, safetyRetry]);

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
    // Con cliente, hasta que el lote trae un veredicto la fila no puede pintarse como segura.
    const safetyPending =
        Boolean(clientId) &&
        !safetyCheckFailed &&
        (isLoadingBatch || safetyResults.size === 0) &&
        exercises.length > 0;

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
                mode === 'sidebar' && [
                    "fixed right-0 top-0 bottom-0 z-50 shadow-xl",
                    "lg:relative lg:right-auto lg:top-auto lg:bottom-auto lg:z-auto lg:shadow-sm",
                ]
            )}
        >
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-border p-3">
                <h3 className="text-sm font-semibold text-foreground">
                    {view === "alternatives" ? "Alternativas sin hallazgo" : "Lista de Ejercicios"}
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
                    safetyCheckFailed={safetyCheckFailed}
                    safetyPending={safetyPending}
                    onRetrySafety={() => setSafetyRetry((n) => n + 1)}
                    expandedExerciseId={expandedExerciseId}
                    setExpandedExerciseId={setExpandedExerciseId}
                    onSelect={onSelect}
                    onShowAlternatives={handleShowAlternatives}
                />
            ) : (
                <ExercisePickerAlternativesView
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
    safetyCheckFailed: boolean;
    safetyPending: boolean;
    onRetrySafety: () => void;
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
    safetyCheckFailed,
    safetyPending,
    onRetrySafety,
    expandedExerciseId,
    setExpandedExerciseId,
    onSelect,
    onShowAlternatives,
}) => {
    return (
        <>
            {/* Aviso lesiones */}
            {hasActiveInjuries && (
                <div className={EXERCISE_PICKER_INJURY_BANNER}>
                    <NexiaSemanticIcon tone="warning" size="sm" />
                    <span>{EXERCISE_PICKER_COPY.injuryBanner}</span>
                </div>
            )}

            {/* Batch loading indicator */}
            {isLoadingBatch && (
                <div className="mx-3 mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <LoadingSpinner size="sm" />
                    <span>Verificando seguridad...</span>
                </div>
            )}

            {safetyCheckFailed ? (
                <Alert
                    variant="error"
                    className={EXERCISE_PICKER_BATCH_ALERT}
                    description={EXERCISE_PICKER_COPY.batchFailed}
                    action={
                        <Button variant="ghost-primary" size="sm" onClick={onRetrySafety}>
                            <RotateCcw aria-hidden />
                            {EXERCISE_PICKER_COPY.retry}
                        </Button>
                    }
                />
            ) : null}

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
                                    const isExpanded = expandedExerciseId === ex.id;
                                    return (
                                        <ExercisePickerRow
                                            key={ex.id}
                                            exercise={ex}
                                            safety={safety}
                                            state={exerciseSafetyUiState(safety, {
                                                checkFailed: safetyCheckFailed,
                                                checkPending: safetyPending && safety == null,
                                            })}
                                            isExpanded={isExpanded}
                                            onToggle={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                                            onSelect={onSelect}
                                            onShowAlternatives={onShowAlternatives}
                                        />
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

/**
 * ExercisePickerPanel.tsx — Panel lateral de seleccion de ejercicios
 *
 * Contexto:
 * - Inline (constructor): 300px a la derecha del bloque desde lg; por debajo, debajo del
 *   bloque y a todo el ancho (a 375px la fila en edición quedaba con 0px).
 * - Sidebar: overlay fijo a la derecha en móvil, en flujo desde lg.
 * - Lista agrupada por letra inicial, busqueda en tiempo real.
 * - Fase 4: safety-check batch via motor real, alternativas integradas en panel.
 * - H11: ningún hallazgo impide añadir. Aviso articular y tope: «Añadir con precaución».
 *   Si el lote falla, se avisa con «Reintentar», las filas muestran «Sin comprobar» y se
 *   añaden con un clic; ninguna se pinta como sin hallazgo.
 * - Lista en ExercisePickerList, fila en ExercisePickerRow (H4) y vista de alternativas en
 *   ExercisePickerAlternativesView (PERF-7). Este archivo guarda el catálogo, el lote de
 *   seguridad y el filtrado, que la lista solo pinta.
 * - PERF-7: el catálogo no tiene tope. La lista sale del listado `view=picker` (todas las
 *   páginas, useGetExercisePickerLibraryQuery), que oculta los ejercicios inactivos.
 *   Nunca usar aquí el lookup por ids (useExerciseNamesByIds): resuelve inactivos y solo
 *   sirve para pintar contenido ya guardado.
 * - Sin clientId (plantillas) no hay lote de seguridad: la fila no lleva estado y se añade
 *   con un clic. Con cliente, nada se añade hasta que el lote trae veredicto.
 * - Reutilizable: CreateSession, EditSession, plantillas y sesiones sueltas.
 *
 * @author Frontend Team
 * @since v6.4.0
 * @updated Fase 4 — batch safety-check + vista alternativas + añadir con precaución
 */

import React, { useEffect, useMemo, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import {
    useGetExercisePickerLibraryQuery,
    useCheckExerciseSafetyBatchMutation,
} from "@nexia/shared/hooks/exercises";
import type { Exercise, ExercisePickerOut } from "@nexia/shared/hooks/exercises";
import type {
    ExerciseSafetyResponse,
    ExerciseSafetyBatchResponse,
} from "@nexia/shared/types/engineSafety";
import { exerciseDisplayName } from "@nexia/shared";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { cn } from "@/lib/utils";
import { ExercisePickerAlternativesView } from "./ExercisePickerAlternativesView";
import { ExercisePickerList } from "./ExercisePickerList";

/** Normaliza texto para búsqueda insensible a mayúsculas y tildes. */
function foldForSearch(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase();
}

function groupExercisesByLetter(
    exercises: ExercisePickerOut[]
): [string, ExercisePickerOut[]][] {
    const map = new Map<string, ExercisePickerOut[]>();
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
    /** Recibe la fila del selector (o la alternativa elegida): id y nombres. */
    onSelect: (exercise: ExercisePickerOut) => void;
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
    const {
        data,
        isLoading,
        isError: catalogFailed,
        refetch: refetchCatalog,
    } = useGetExercisePickerLibraryQuery({
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

    const selectedExerciseForAlternatives = exercises.find(
        (e) => e.id === selectedExerciseIdForAlternatives
    );
    const selectedExerciseNameForAlternatives = selectedExerciseForAlternatives
        ? exerciseDisplayName(selectedExerciseForAlternatives)
        : undefined;

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
                "flex shrink-0 flex-col self-start",
                mode === 'inline' ? "w-full lg:w-[300px]" : "w-[300px]",
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
                <ExercisePickerList
                    isLoading={isLoading}
                    catalogFailed={catalogFailed}
                    onRetryCatalog={() => void refetchCatalog()}
                    isLoadingBatch={isLoadingBatch}
                    hasActiveInjuries={hasActiveInjuries}
                    search={search}
                    setSearch={setSearch}
                    filteredAndGrouped={filteredAndGrouped}
                    safetyApplies={clientId != null}
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
                    exerciseName={selectedExerciseNameForAlternatives}
                    clientId={clientId}
                    onSelectAlternative={handleSelectAlternative}
                />
            )}
        </div>
    );
};

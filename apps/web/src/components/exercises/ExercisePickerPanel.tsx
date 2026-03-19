/**
 * ExercisePickerPanel.tsx — Panel lateral de selección de ejercicios
 *
 * Contexto:
 * - Panel fijo 300px a la derecha del Constructor (no overlay).
 * - Visible cuando exercisePickerOpen && viewport >= lg.
 * - En móvil (< lg): oculto (hidden). Flujo alternativo: drawer/modal.
 * - Lista agrupada por letra inicial, búsqueda en tiempo real.
 * - Ejercicios contraindicados por lesiones: disabled, marcados.
 * - Reutilizable: CreateSession, EditSession.
 *
 * @author Frontend Team
 * @since v6.4.0
 */

import React, { useMemo, useState } from "react";
import { X, Search, Plus, TriangleAlert } from "lucide-react";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { cn } from "@/lib/utils";

function isContraindicated(
    activeInjuries: InjuryWithDetails[],
    exercise: Exercise
): boolean {
    if (activeInjuries.length === 0) return false;
    const injuryTerms = activeInjuries.flatMap((i) => {
        const terms: string[] = [];
        if (i.joint_name) terms.push(i.joint_name.toLowerCase());
        if (i.muscle_name) terms.push(i.muscle_name.toLowerCase());
        if (i.movement_name) terms.push(i.movement_name.toLowerCase());
        return terms;
    });
    const exerciseText = [
        exercise.musculatura_principal ?? "",
        exercise.musculatura_secundaria ?? "",
        exercise.patron_movimiento ?? "",
    ]
        .join(" ")
        .toLowerCase();
    return injuryTerms.some((t) => t && exerciseText.includes(t));
}

function groupExercisesByLetter(exercises: Exercise[]): [string, Exercise[]][] {
    const map = new Map<string, Exercise[]>();
    for (const ex of exercises) {
        const letter = (ex.nombre?.[0] ?? "?").toUpperCase();
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
    activeInjuries = [],
}) => {
    const [search, setSearch] = useState("");

    const { data, isLoading } = useGetExercisesQuery({
        skip: 0,
        limit: 500,
    });

    const exercises = useMemo(() => data?.exercises ?? [], [data]);

    const filteredAndGrouped = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = term
            ? exercises.filter((ex) =>
                  (ex.nombre ?? "").toLowerCase().includes(term)
              )
            : exercises;
        return groupExercisesByLetter(filtered);
    }, [exercises, search]);

    const hasActiveInjuries = activeInjuries.length > 0;

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
                    Lista de Ejercicios
                </h3>
                <div className="flex items-center gap-1">
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

            {/* Aviso lesiones */}
            {hasActiveInjuries && (
                <div className="mx-3 mt-3 flex items-start gap-2 rounded-md bg-[hsl(var(--warning))]/10 p-2 text-[11px] text-[hsl(var(--warning))]">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Ejercicios contraindicados marcados.</span>
                </div>
            )}

            {/* Búsqueda */}
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
                                    const contra = isContraindicated(
                                        activeInjuries,
                                        ex
                                    );
                                    return (
                                        <button
                                            key={ex.id}
                                            type="button"
                                            disabled={contra}
                                            onClick={() => {
                                                if (!contra) onSelect(ex);
                                            }}
                                            title={
                                                contra
                                                    ? "Contraindicado por lesión activa"
                                                    : undefined
                                            }
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                                                contra
                                                    ? "cursor-not-allowed opacity-40"
                                                    : "hover:bg-surface-2"
                                            )}
                                        >
                                            {contra && (
                                                <TriangleAlert className="h-3 w-3 shrink-0 text-destructive" />
                                            )}
                                            <span className="flex-1 truncate text-xs">{ex.nombre}</span>
                                            {!contra && (
                                                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

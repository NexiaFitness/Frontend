/**
 * ExercisePickerAlternativesView.tsx — Vista «Alternativas sin hallazgo» del selector.
 *
 * Contexto: extraída de ExercisePickerPanel (regla de tamaño, agent.md §7.1; era la
 * extracción pendiente que anotaba su header). Muestra si el ejercicio original tiene
 * hallazgo con la lesión del cliente y las alternativas seguras de
 * GET /exercises/{id}/safe-alternatives; elegir una llama a onSelectAlternative.
 * Notas de mantenimiento: el copy de los estados vacíos vive en
 * exercisePickerPresentation.ts (getAlternativesEmptyCopy).
 *
 * @author Frontend Team
 * @since v6.4.0
 */

import React from "react";
import { CheckCircle2, Plus, TriangleAlert } from "lucide-react";
import { useGetSafeAlternativesQuery } from "@nexia/shared/hooks/exercises";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { equipmentDisplayLine } from "@/utils/exercises";
import { getAlternativesEmptyCopy } from "./exercisePickerPresentation";

export interface ExercisePickerAlternativesViewProps {
    exerciseId: number | null;
    clientId?: number | null;
    onSelectAlternative: (exercise: Exercise) => void;
}

export const ExercisePickerAlternativesView: React.FC<ExercisePickerAlternativesViewProps> = ({
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
                        {data.is_original_safe ? "Sin hallazgo" : "Con hallazgo"}
                    </span>
                </div>
            </div>

            {/* Alternatives list */}
            {data.alternatives.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-4 text-center space-y-1">
                    {(() => {
                        const copy = getAlternativesEmptyCopy(
                            data.empty_reason ??
                                (data.no_alternatives_found ? "score_threshold" : "none")
                        );
                        return (
                            <>
                                <p className="text-sm text-muted-foreground">{copy.title}</p>
                                {copy.subtitle ? (
                                    <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
                                ) : null}
                            </>
                        );
                    })()}
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Alternativas sin hallazgo
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
                                    {[alt.patron_movimiento, equipmentDisplayLine(alt)]
                                        .filter(Boolean)
                                        .join(" · ")}
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

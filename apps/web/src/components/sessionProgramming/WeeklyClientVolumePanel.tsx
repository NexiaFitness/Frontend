/**
 * Panel «Volumen semanal del cliente» — solo presentación (datos vía useWeeklyClientVolumePanel).
 */

import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/feedback";
import type {
    SessionLoadUnmappedExerciseOut,
    WeeklyClientVolumePanelIntent,
    WeeklyVolumePanelRowModel,
} from "@nexia/shared";
import {
    VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE,
    VOLUME_WEEKLY_SAVED_SUBTITLE,
} from "@nexia/shared/training/weeklyVolumePanelPresentation";
import { MuscleVolumeRow } from "./MuscleVolumeRow";

export interface WeeklyClientVolumePanelProps {
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    isLoading: boolean;
    isError: boolean;
    hasClient: boolean;
    intent?: WeeklyClientVolumePanelIntent;
    /** True cuando el panel refleja el borrador del constructor (no acumulado semanal). */
    usesDraftProjection?: boolean;
    weeklyTarget?: number | null;
    unmappedExercises?: SessionLoadUnmappedExerciseOut[];
}

export const WeeklyClientVolumePanel: React.FC<WeeklyClientVolumePanelProps> = ({
    weekLabel,
    rows,
    isLoading,
    isError,
    hasClient,
    intent = "edit_session",
    usesDraftProjection = false,
    weeklyTarget = null,
    unmappedExercises = [],
}) => {
    const [open, setOpen] = useState(true);

    const noBlockMode = useMemo(() => {
        if (!usesDraftProjection || rows.length === 0) return false;
        const wt = weeklyTarget ?? 0;
        if (wt <= 0) return false;
        return rows.every((r) => r.targetToday == null || r.targetToday === 0);
    }, [usesDraftProjection, rows, weeklyTarget]);

    const panelTitle = useMemo(() => {
        if (intent === "create_session" || usesDraftProjection) {
            return noBlockMode
                ? "Volumen semanal de referencia"
                : "Series recomendadas para esta sesión";
        }
        return "Volumen semanal del cliente";
    }, [intent, usesDraftProjection, noBlockMode]);

    const panelSubtitle = useMemo(() => {
        if (intent === "create_session") {
            return usesDraftProjection
                ? VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE
                : "Sin ejercicios en el constructor — el panel se actualiza al añadir ejercicios";
        }
        if (usesDraftProjection) {
            return VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE;
        }
        return VOLUME_WEEKLY_SAVED_SUBTITLE;
    }, [intent, usesDraftProjection]);

    const emptyMessage = useMemo(() => {
        if (intent === "create_session") {
            return "Añade ejercicios al constructor para ver el reparto de series de esta sesión.";
        }
        if (usesDraftProjection) {
            return "Aún no hay grupos musculares con reparto para esta sesión. Añade ejercicios al constructor o comprueba que el plan defina objetivos por grupo para la semana.";
        }
        return "No hay volumen registrado esta semana. Aparecerá al guardar sesiones con ejercicios del catálogo o cuando el plan active reparto y acumulados.";
    }, [intent, usesDraftProjection]);

    if (!hasClient) {
        return null;
    }

    return (
        <section
            className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden"
            aria-label="Volumen semanal del cliente"
        >
            <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{panelTitle}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {panelSubtitle}
                        {weekLabel ? ` · Semana del ${weekLabel}` : ""}
                    </p>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                        open ? "rotate-180" : "rotate-0"
                    )}
                    aria-hidden
                />
            </button>

            {open ? (
                <div className="border-t border-border px-4 pb-4 pt-2">
                    {isLoading ? (
                        <div className="flex min-h-[120px] items-center justify-center py-6">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive py-4">
                            No se pudo cargar el volumen semanal. Revisa la conexión o vuelve a intentar.
                        </p>
                    ) : rows.length === 0 && unmappedExercises.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground leading-relaxed">{emptyMessage}</p>
                    ) : (
                        <div className="space-y-3">
                            {unmappedExercises.length > 0 ? (
                                <div
                                    role="alert"
                                    className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2.5 text-xs leading-relaxed text-warning"
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                        <div>
                                            <p className="font-medium">
                                                {unmappedExercises.length === 1
                                                    ? "1 ejercicio no suma volumen muscular"
                                                    : `${unmappedExercises.length} ejercicios no suman volumen muscular`}
                                            </p>
                                            <p className="mt-1 text-warning/90">
                                                Falta mapeo en catálogo:{" "}
                                                {unmappedExercises
                                                    .map((e) => e.name_es || e.exercise_code)
                                                    .join(", ")}
                                                . El admin debe corregir el catálogo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            {noBlockMode ? (
                                <div
                                    role="status"
                                    className="rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs font-medium leading-snug text-amber-800 dark:text-amber-300"
                                >
                                    El plan no tiene una fase activa para esta fecha. Se muestra el volumen
                                    semanal de referencia, no el reparto por sesión.
                                </div>
                            ) : null}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {rows.map((row) => (
                                    <MuscleVolumeRow key={row.muscleGroupId} row={row} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
};

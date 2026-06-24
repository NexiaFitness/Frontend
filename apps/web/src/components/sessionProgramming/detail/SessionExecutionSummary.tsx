/**
 * SessionExecutionSummary — Ejecución real por sesión (F5).
 * Vista condicional en SessionDetail cuando la sesión está completada.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Activity, ChevronRight } from "lucide-react";
import { useGetSessionExecutionSummaryQuery } from "@nexia/shared/api/trainingSessionsApi";
import {
    formatSetExecutionLabel,
    formatSetExecutionLine,
} from "@nexia/shared/utils/trainer/formatSetExecutionDisplay";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/Badge";

export interface SessionExecutionSummaryProps {
    sessionId: number;
    clientId: number;
    /** When false, skip fetch (planned sessions). */
    enabled?: boolean;
}

export const SessionExecutionSummary: React.FC<SessionExecutionSummaryProps> = ({
    sessionId,
    clientId,
    enabled = true,
}) => {
    const { data, isLoading, isError } = useGetSessionExecutionSummaryQuery(sessionId, {
        skip: !enabled || !sessionId,
    });

    if (!enabled) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-border bg-card p-8">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError || !data) {
        return null;
    }

    if (!data.has_executions) {
        return (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
                El atleta aún no ha registrado series en esta sesión.
            </div>
        );
    }

    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Activity className="size-5 text-primary" aria-hidden />
                    <h2 className="text-lg font-semibold text-foreground">Ejecución real</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{data.tonnage_kg} kg tonnage</Badge>
                    <Badge variant="outline">{data.executions_count} series</Badge>
                    {data.rpe_adherence_pct != null && (
                        <Badge variant="outline">
                            RPE en objetivo: {data.rpe_adherence_pct.toFixed(0)}%
                        </Badge>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {data.exercises.map((exercise) => (
                    <div
                        key={exercise.exercise_id}
                        className="rounded-lg border border-border/60 bg-muted/20 p-4"
                    >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">
                                {exercise.exercise_name}
                            </p>
                            {exercise.prescribed_rpe != null && (
                                <span className="text-xs text-muted-foreground">
                                    Objetivo RPE {exercise.prescribed_rpe}
                                </span>
                            )}
                        </div>
                        <ul className="divide-y divide-border/50 rounded-md border border-border/40 bg-card">
                            {exercise.executions.map((row) => (
                                <li
                                    key={row.id}
                                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 min-h-12"
                                >
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {formatSetExecutionLabel(row)}
                                    </span>
                                    <span className="text-sm text-foreground">
                                        {formatSetExecutionLine(row)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            to={`/dashboard/clients/${clientId}?tab=progress&subtab=performance&historyExercise=${exercise.exercise_id}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                            Ver historial de este ejercicio
                            <ChevronRight className="size-3.5" aria-hidden />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

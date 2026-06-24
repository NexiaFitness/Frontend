/**
 * StandaloneSessionLoadSummary — Tonnage legacy actual_* (F5-FE-03).
 * Sesiones libres: sin SetExecution ni SessionExecutionSummary.
 */

import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import type { StandaloneSessionExerciseOut } from "@nexia/shared/types/standaloneSessions";
import { computeStandaloneSessionTonnage } from "@nexia/shared/utils/trainer/computeStandaloneSessionTonnage";
import { Badge } from "@/components/ui/Badge";

export interface StandaloneSessionLoadSummaryProps {
    exercises: StandaloneSessionExerciseOut[];
    /** When false, skip render (planned sessions). */
    enabled?: boolean;
}

export const StandaloneSessionLoadSummary: React.FC<
    StandaloneSessionLoadSummaryProps
> = ({ exercises, enabled = true }) => {
    const summary = useMemo(
        () => computeStandaloneSessionTonnage(exercises),
        [exercises],
    );

    if (!enabled) {
        return null;
    }

    if (summary.exercisesWithLoad === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
                Sin carga registrada (actual_sets × reps × peso) en esta sesión libre.
            </div>
        );
    }

    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Activity className="size-5 text-primary" aria-hidden />
                    <h2 className="text-lg font-semibold text-foreground">
                        Carga registrada
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{summary.tonnageKg} kg tonnage</Badge>
                    <Badge variant="outline">
                        {summary.exercisesWithLoad} ejercicio
                        {summary.exercisesWithLoad === 1 ? "" : "s"}
                    </Badge>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Calculado desde datos legacy de la sesión libre (actual_sets × reps ×
                peso). No incluye run atleta ni SetExecution.
            </p>
            <ul className="space-y-2">
                {summary.rows.map((row) => (
                    <li
                        key={`${row.exerciseId}-${row.orderInSession}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                    >
                        <span className="font-medium text-foreground">
                            Ejercicio #{row.exerciseId}
                        </span>
                        <span className="text-muted-foreground">
                            {row.sets}×{row.reps} @ {row.weightKg} kg ·{" "}
                            {row.tonnageKg} kg
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

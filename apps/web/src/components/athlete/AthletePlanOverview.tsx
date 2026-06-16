/**
 * AthletePlanOverview.tsx — Vista lectura del plan activo (V08).
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { Target, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/cards";
import type { ClientTrainingPlanSummary } from "@nexia/shared/types/trainingAnalytics";

export interface AthletePlanOverviewProps {
    summary: ClientTrainingPlanSummary;
    planGoalLabel: string;
}

export const AthletePlanOverview: React.FC<AthletePlanOverviewProps> = ({
    summary,
    planGoalLabel,
}) => {
    const { training_load: load, summary: stats } = summary;

    return (
        <div className="space-y-6">
            <header className="space-y-2 rounded-lg border border-border bg-card p-4">
                <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                    Plan activo
                </p>
                <h1 className="text-xl font-bold text-foreground">
                    {summary.plan_name ?? "Mi plan de entrenamiento"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="size-4 shrink-0 text-primary" aria-hidden />
                    <span>{planGoalLabel}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MetricCard
                    title="Adherencia"
                    value={`${Math.round(stats.adherence_rate)}%`}
                    subtitle={`${stats.sessions_completed} / ${stats.total_sessions_planned} sesiones`}
                    color="green"
                />
                <MetricCard
                    title="Volumen"
                    value={load.volume_level.toFixed(1)}
                    subtitle="Nivel planificado (1-10)"
                    color="blue"
                />
                <MetricCard
                    title="Intensidad"
                    value={load.intensity_level.toFixed(1)}
                    subtitle="Nivel planificado (1-10)"
                    color="orange"
                />
            </div>

            {summary.physical_qualities.length > 0 && (
                <section className="space-y-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <TrendingUp className="size-4 text-primary" aria-hidden />
                        Cualidades del plan
                    </h2>
                    <ul className="space-y-2">
                        {summary.physical_qualities.map((q) => (
                            <li
                                key={q.name}
                                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                            >
                                <span className="text-sm text-foreground">{q.name}</span>
                                <span className="text-sm font-semibold text-primary">
                                    {Math.round(q.percentage)}%
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {summary.yearly_progression.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-foreground">Progresión mensual</h2>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {summary.yearly_progression.map((month) => (
                            <div
                                key={month.month}
                                className="rounded-lg border border-border bg-card p-2 text-center"
                            >
                                <p className="text-caption text-muted-foreground">
                                    {new Date(2000, month.month - 1, 1).toLocaleDateString("es-ES", {
                                        month: "short",
                                    })}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    V{month.volume_level.toFixed(0)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

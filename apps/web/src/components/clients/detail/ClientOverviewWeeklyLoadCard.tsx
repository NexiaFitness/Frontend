/**
 * ClientOverviewWeeklyLoadCard — Carga semanal plan vs extra (D10 Fase 1).
 *
 * Diseño: DESIGN_PREMIUM.md §2 (glass+rim), §3 (warning solo exceso carga).
 * Sin aviso de estructura: el entrenador actúa en PeriodBlockCard.
 */

import React from "react";
import { AlertTriangle, Gauge } from "lucide-react";
import type { TrainingPlanWeeklySummary } from "@nexia/shared/types/trainingAnalytics";
import { LoadingSpinner } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";
import {
    WEEKLY_LOAD_COPY,
    WEEKLY_LOAD_EXCESS_BANNER,
    WEEKLY_LOAD_METRIC_ROW,
    WEEKLY_LOAD_SECTION_LABEL,
    WEEKLY_LOAD_SHELL,
    formatLoadIndex,
} from "./clientWeeklyLoadPresentation";

export interface ClientOverviewWeeklyLoadCardProps {
    weeklySummary: TrainingPlanWeeklySummary | undefined;
    isLoading?: boolean;
    isError?: boolean;
}

export const ClientOverviewWeeklyLoadCard: React.FC<
    ClientOverviewWeeklyLoadCardProps
> = ({ weeklySummary, isLoading = false, isError = false }) => {
    if (isLoading) {
        return (
            <div
                className={cn(WEEKLY_LOAD_SHELL, "flex min-h-[160px] items-center justify-center")}
                data-testid="client-overview-weekly-load"
            >
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError || !weeklySummary?.has_active_plan) {
        return null;
    }

    const pva = weeklySummary.planned_vs_actual;
    const summary = weeklySummary.summary;
    const hasCompleted =
        (summary.sessions_completed ?? 0) + (summary.sessions_extra_completed ?? 0) > 0;

    return (
        <article
            className={WEEKLY_LOAD_SHELL}
            data-testid="client-overview-weekly-load"
        >
            <NexiaGlassAccentRim />
            <div className="flex items-start gap-3">
                <Gauge className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1 space-y-1">
                    <p className={WEEKLY_LOAD_SECTION_LABEL}>{WEEKLY_LOAD_COPY.sectionTitle}</p>
                    <h4 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                        {summary.sessions_completed ?? 0} de {summary.total_sessions_planned ?? 0}{" "}
                        del plan
                        {(summary.sessions_extra_completed ?? 0) > 0
                            ? ` · ${summary.sessions_extra_completed} extra`
                            : ""}
                    </h4>
                    <p className="text-xs text-muted-foreground">{WEEKLY_LOAD_COPY.sectionHint}</p>
                </div>
            </div>

            {!hasCompleted ? (
                <p className="text-sm text-muted-foreground">{WEEKLY_LOAD_COPY.noData}</p>
            ) : (
                <dl className="space-y-2 border-t border-border/60 pt-4">
                    <div className={WEEKLY_LOAD_METRIC_ROW}>
                        <dt className="text-muted-foreground">{WEEKLY_LOAD_COPY.planRow}</dt>
                        <dd className="font-medium tabular-nums text-foreground">
                            {formatLoadIndex(pva.actual_volume_plan)}
                        </dd>
                    </div>
                    <div className={WEEKLY_LOAD_METRIC_ROW}>
                        <dt className="text-muted-foreground">{WEEKLY_LOAD_COPY.extraRow}</dt>
                        <dd className="font-medium tabular-nums text-foreground">
                            {formatLoadIndex(pva.actual_volume_extra)}
                            {(summary.sessions_extra_completed ?? 0) > 0
                                ? ` (${summary.sessions_extra_completed})`
                                : ""}
                        </dd>
                    </div>
                    {(pva.actual_volume_estimated ?? 0) > 0 && (
                        <div className={WEEKLY_LOAD_METRIC_ROW}>
                            <dt className="text-muted-foreground">{WEEKLY_LOAD_COPY.estimatedRow}</dt>
                            <dd className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
                                {formatLoadIndex(pva.actual_volume_estimated)}
                            </dd>
                        </div>
                    )}
                    <div className={WEEKLY_LOAD_METRIC_ROW}>
                        <dt className="text-muted-foreground">{WEEKLY_LOAD_COPY.totalRow}</dt>
                        <dd className="font-medium tabular-nums text-foreground">
                            {formatLoadIndex(pva.load_index_plan_sum)} plan +{" "}
                            {formatLoadIndex(pva.load_index_extra_sum)} extra
                        </dd>
                    </div>
                </dl>
            )}

            {pva.extra_load_excess && (
                <div
                    className={WEEKLY_LOAD_EXCESS_BANNER}
                    role="status"
                    data-testid="client-weekly-load-excess"
                >
                    <div className="flex gap-2">
                        <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {WEEKLY_LOAD_COPY.excessTitle}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {WEEKLY_LOAD_COPY.excessDetail}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">{WEEKLY_LOAD_COPY.formulaNote}</p>
        </article>
    );
};

/**
 * ClientPlansSection.tsx — Sección de planes de entrenamiento del cliente
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import {
    labelTrainingGoal,
    resolveTrainingPlanDisplayBadge,
    trainingPlanLifecycleBadgeClass,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientPlansSectionProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
    isLoading: boolean;
    onPlanificar?: () => void;
    onViewPlan?: (planId: number) => void;
}

function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })} – ${endDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })}`;
}

export const ClientPlansSection: React.FC<ClientPlansSectionProps> = ({
    clientId,
    trainingPlans,
    isLoading,
    onPlanificar,
    onViewPlan,
}) => {
    const navigate = useNavigate();

    if (!clientId || clientId <= 0) return null;

    if (isLoading) {
        return (
            <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-border bg-surface p-6">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    const hasPlans = trainingPlans && trainingPlans.length > 0;

    return (
        <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-foreground`}>
                        Planes de entrenamiento
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {hasPlans
                            ? "Planes asignados a este cliente."
                            : "Aún no hay plan activo para este cliente."}
                    </p>
                </div>
                {onPlanificar ? (
                    <Button variant="primary" size="sm" onClick={onPlanificar}>
                        Planificar
                    </Button>
                ) : null}
            </div>

            {hasPlans ? (
                <div className="mt-4 space-y-3">
                    {trainingPlans.map((plan) => {
                        const statusBadge = resolveTrainingPlanDisplayBadge(plan);
                        return (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() =>
                                    onViewPlan
                                        ? onViewPlan(plan.id)
                                        : navigate(
                                              `/dashboard/clients/${clientId}?tab=planning&plan=${plan.id}`,
                                          )
                                }
                                className="block w-full rounded-lg border border-border bg-surface-2 p-4 text-left transition-colors hover:border-border hover:bg-muted/50"
                                aria-label={`Ver plan ${plan.name}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-foreground">
                                            {plan.name}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {formatDateRange(plan.start_date, plan.end_date)}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary">
                                                {labelTrainingGoal(plan.goal)}
                                            </span>
                                            <span
                                                className={trainingPlanLifecycleBadgeClass(plan)}
                                            >
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="shrink-0 text-muted-foreground"
                                        aria-hidden
                                    >
                                        →
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Pulsa Planificar para elegir plantilla o crear un plan personalizado.
                    </p>
                </div>
            )}
        </div>
    );
};

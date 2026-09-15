/**
 * ClientPlansSection.tsx — Sección de planes de entrenamiento del cliente
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";
import { PlanningProgramSummaryCard } from "@/components/trainingPlans/periodization/PlanningProgramSummaryCard";
import {
    sortClientTrainingPlansForDisplay,
    toActivePlanDisplay,
} from "@/components/trainingPlans/periodization/planningShellUtils";

interface ClientPlansSectionProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
    isLoading: boolean;
    onPlanificar?: () => void;
    onViewPlan?: (planId: number) => void;
    /** Solo lista (sin cabecera ni CTA); para sección colapsable en tab Planificación. */
    embedded?: boolean;
}

export const ClientPlansSection: React.FC<ClientPlansSectionProps> = ({
    clientId,
    trainingPlans,
    isLoading,
    onPlanificar,
    onViewPlan,
    embedded = false,
}) => {
    const navigate = useNavigate();

    const sortedPlans = useMemo(
        () => sortClientTrainingPlansForDisplay(trainingPlans ?? []),
        [trainingPlans],
    );

    if (!clientId || clientId <= 0) return null;

    if (isLoading) {
        const loadingShell = (
            <div
                className={
                    embedded
                        ? "flex min-h-[120px] items-center justify-center py-8"
                        : "flex min-h-[160px] items-center justify-center rounded-lg border border-border bg-surface p-6"
                }
            >
                <LoadingSpinner size="md" />
            </div>
        );
        return loadingShell;
    }

    const hasPlans = trainingPlans && trainingPlans.length > 0;

    const openPlan = (planId: number) => {
        if (onViewPlan) {
            onViewPlan(planId);
        } else {
            navigate(`/dashboard/clients/${clientId}?tab=planning&plan=${planId}`);
        }
    };

    const planList = hasPlans ? (
        <div className={embedded ? "space-y-3" : "mt-4 space-y-3"}>
            {sortedPlans.map((plan) => (
                <PlanningProgramSummaryCard
                    key={plan.id}
                    plan={toActivePlanDisplay(plan)}
                    sectionEyebrow="Planificación"
                    onActivate={() => openPlan(plan.id)}
                    showAccentRim={!embedded}
                    testId={`client-plan-summary-${plan.id}`}
                />
            ))}
        </div>
    ) : embedded ? null : (
        <div className="mt-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
                Pulsa Planificar para elegir plantilla o crear un plan personalizado.
            </p>
        </div>
    );

    if (embedded) {
        return (
            <div data-testid="client-plans-section-embedded">{planList}</div>
        );
    }

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
            {planList}
        </div>
    );
};

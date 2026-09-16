/**
 * ClientPlanningHubShell — Hub de planificación sin plan operativo (cliente).
 *
 * Empty state + lista de planes del cliente (sin ruido de "Historial" si solo hay uno).
 */

import React from "react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    shouldShowPlanningHubHistoryLabel,
    shouldShowPlanningHubPlanList,
} from "@/components/trainingPlans/periodization/planningShellUtils";
import { ClientNoActivePlanEmpty } from "./ClientNoActivePlanEmpty";
import { ClientPlansSection } from "./ClientPlansSection";

export interface ClientPlanningHubShellProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
    isLoadingPlans: boolean;
    onPlanificar?: () => void;
    onViewPlan?: (planId: number) => void;
    className?: string;
}

export const ClientPlanningHubShell: React.FC<ClientPlanningHubShellProps> = ({
    clientId,
    trainingPlans,
    isLoadingPlans,
    onPlanificar,
    onViewPlan,
    className,
}) => {
    const showPlanList = shouldShowPlanningHubPlanList(trainingPlans);
    const showHistoryLabel = shouldShowPlanningHubHistoryLabel(trainingPlans);

    return (
        <div
            className={cn("min-w-0 space-y-6", className)}
            data-testid="client-planning-hub"
        >
            <ClientNoActivePlanEmpty
                onPlanificar={onPlanificar}
                testId="client-planning-tab-no-plan"
            />

            {showPlanList ? (
                <div
                    className="space-y-3"
                    data-testid={
                        showHistoryLabel
                            ? "client-planning-hub-history"
                            : "client-planning-hub-single-plan"
                    }
                >
                    {showHistoryLabel ? (
                        <div>
                            <h3 className={cn(TYPOGRAPHY.sectionTitle, "text-foreground")}>
                                Historial
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Planes asignados a este cliente.
                            </p>
                        </div>
                    ) : null}
                    <ClientPlansSection
                        clientId={clientId}
                        trainingPlans={trainingPlans}
                        isLoading={isLoadingPlans}
                        embedded
                        onViewPlan={onViewPlan}
                    />
                </div>
            ) : null}
        </div>
    );
};

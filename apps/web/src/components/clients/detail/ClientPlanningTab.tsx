/**
 * ClientPlanningTab.tsx — Planificación desde perfil de cliente
 *
 * Obtiene el plan activo del cliente vía GET active-by-client/{client_id}.
 * Si no hay plan activo: estado vacío + CTA "Crear plan".
 * Si hay plan activo: muestra PlanPeriodizationSection (bloques de periodización).
 *
 * @author Frontend Team
 * @since Fase 1 U3
 * @updated v9.0.0 — Eliminado PlanningTab legacy; solo PlanPeriodizationSection
 */

import React from "react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useGetActivePlanByClientQuery } from "@nexia/shared/api/trainingPlansApi";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PlanPeriodizationSection } from "@/components/trainingPlans/periodization";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientPlanningTabProps {
    clientId: number;
    trainingPlans?: TrainingPlan[];
    isLoadingPlans?: boolean;
    onOpenCreatePlan?: () => void;
    onOpenUseTemplate?: () => void;
}

export const ClientPlanningTab: React.FC<ClientPlanningTabProps> = ({
    clientId,
    trainingPlans: _trainingPlans = [],
    isLoadingPlans = false,
    onOpenCreatePlan,
}) => {
    const {
        data: activePlan,
        isLoading: isLoadingActive,
    } = useGetActivePlanByClientQuery(clientId, { skip: !clientId || clientId <= 0 });

    const isLoading = isLoadingPlans || isLoadingActive;
    const hasActivePlan = activePlan != null && activePlan.id != null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!hasActivePlan) {
        return (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Sin plan activo
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                    Este cliente no tiene un plan de entrenamiento activo.
                    Crea uno para empezar a planificar.
                </p>
                {onOpenCreatePlan && (
                    <Button
                        variant="primary"
                        onClick={onOpenCreatePlan}
                        aria-label="Crear plan de entrenamiento"
                    >
                        Crear plan
                    </Button>
                )}
            </div>
        );
    }

    return (
        <PlanPeriodizationSection
            planId={activePlan.id}
            clientId={clientId}
            planStartDate={activePlan.start_date}
            planEndDate={activePlan.end_date}
        />
    );
};

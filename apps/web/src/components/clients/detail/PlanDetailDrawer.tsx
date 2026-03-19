/**
 * PlanDetailDrawer.tsx — Drawer con detalle del plan desde contexto cliente
 *
 * Contexto:
 * - U4 paso 1.5: se muestra cuando el usuario hace "Ver plan" en ClientPlansSection
 * - Mantiene la URL en clients/:id
 * - Compone SidePanel + TrainingPlanDetailPanel
 *
 * Responsabilidades:
 * - Renderizar SidePanel con TrainingPlanDetailPanel
 * - Gestionar cierre (onClose)
 *
 * @author Frontend Team
 * @since U4 paso 1.5
 */

import React from "react";
import { SidePanel } from "@/components/ui/layout/SidePanel";
import { TrainingPlanDetailPanel } from "@/components/trainingPlans/TrainingPlanDetailPanel";

export interface PlanDetailDrawerProps {
    planId: number;
    clientId: number;
    onClose: () => void;
}

export const PlanDetailDrawer: React.FC<PlanDetailDrawerProps> = ({
    planId,
    clientId,
    onClose,
}) => {
    return (
        <SidePanel
            isOpen={true}
            onClose={onClose}
            ariaLabel="Detalle del plan de entrenamiento"
        >
            <TrainingPlanDetailPanel
                planId={planId}
                clientId={clientId}
                onClose={onClose}
            />
        </SidePanel>
    );
};

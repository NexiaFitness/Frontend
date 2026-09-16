/**
 * DeleteTrainingPlanModal.tsx — Confirmación eliminar plan (NexiaPremiumConfirmModal).
 */

import React from "react";

import type { TrainingPlan } from "@nexia/shared/types/training";

import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";

interface DeleteTrainingPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: TrainingPlan | null;
    isLoading?: boolean;
    isOperationalPlan?: boolean;
}

export const DeleteTrainingPlanModal: React.FC<DeleteTrainingPlanModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    plan,
    isLoading = false,
    isOperationalPlan = false,
}) => {
    if (!plan) return null;

    return (
        <NexiaPremiumConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            isLoading={isLoading}
            loadingConfirmLabel="Eliminando…"
            title="Eliminar plan de entrenamiento"
            description={
                <>
                    ¿Estás seguro de que deseas eliminar el plan{" "}
                    <span className={NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS}>
                        «{plan.name}»
                    </span>
                    ?
                </>
            }
            bodyContent={
                <div className="space-y-3">
                    <p className={NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS}>
                        Esta acción eliminará permanentemente el plan y todas sus sesiones
                        asociadas.
                    </p>
                    {isOperationalPlan ? (
                        <p className="text-sm text-muted-foreground">
                            Es el plan operativo de este cliente: tras eliminarlo no habrá plan
                            activo hasta que planifiques uno nuevo.
                        </p>
                    ) : null}
                </div>
            }
            confirmLabel="Eliminar plan"
        />
    );
};

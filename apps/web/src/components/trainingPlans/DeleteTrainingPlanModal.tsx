/**
 * DeleteTrainingPlanModal.tsx — Modal de confirmación para eliminar un plan de entrenamiento.
 *
 * Contexto:
 * - Proporciona una confirmación profesional antes de eliminar datos críticos.
 * - Alineado con el diseño de DeleteClientModal y el sistema BaseModal.
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import type { TrainingPlan } from "@nexia/shared/types/training";

interface DeleteTrainingPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: TrainingPlan | null;
    isLoading?: boolean;
}

export const DeleteTrainingPlanModal: React.FC<DeleteTrainingPlanModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    plan,
    isLoading = false,
}) => {
    if (!plan) return null;

    const description = `¿Estás seguro de que deseas eliminar el plan "${plan.name}"?`;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Eliminar Plan de Entrenamiento"
            description={description}
            iconType="danger"
            isLoading={isLoading}
            titleId="delete-plan-title"
            descriptionId="delete-plan-description"
        >
            {/* Warning text */}
            <div className="text-center mb-6 sm:mb-8">
                <p className={`${TYPOGRAPHY.errorText} text-red-600 font-medium`}>
                    Esta acción eliminará permanentemente el plan y todas sus sesiones asociadas.
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    size="md"
                    className={BUTTON_PRESETS.modalEqual}
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className={BUTTON_PRESETS.modalEqual}
                >
                    Eliminar Plan
                </Button>
            </div>
        </BaseModal>
    );
};

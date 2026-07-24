/**
 * ConvertPlanToTemplateModal — Confirmación para convertir plan cliente en plantilla.
 *
 * Usa useConvertPlanToTemplate (RTK); la conversión e import del árbol es solo backend.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { useConvertPlanToTemplate } from "@nexia/shared/hooks/training/useConvertPlanToTemplate";
import { getMutationErrorMessage } from "@nexia/shared";
import type { TrainingPlan } from "@nexia/shared/types/training";

interface ConvertPlanToTemplateModalProps {
    open: boolean;
    onClose: () => void;
    plan: TrainingPlan | null;
}

export const ConvertPlanToTemplateModal: React.FC<ConvertPlanToTemplateModalProps> = ({
    open,
    onClose,
    plan,
}) => {
    const navigate = useNavigate();
    const { convertPlan, isConverting, isError, error } = useConvertPlanToTemplate();
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setActionError(null);
        }
    }, [open]);

    if (!plan) {
        return null;
    }

    const resolvedError =
        actionError ??
        (isError && error
            ? getMutationErrorMessage(error)
            : null);

    const handleConfirm = async () => {
        setActionError(null);
        try {
            const template = await convertPlan({
                plan_id: plan.id,
                template_data: {
                    trainer_id: plan.trainer_id,
                    name: `${plan.name} (Template)`,
                    goal: plan.goal,
                    description: plan.description,
                },
            });
            onClose();
            navigate(`/dashboard/training-plans/templates/${template.id}/edit`);
        } catch (err: unknown) {
            setActionError(getMutationErrorMessage(err));
        }
    };

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Convertir en plantilla"
            description={`Se creará una plantilla en borrador a partir de «${plan.name}». El plan del cliente no se modifica.`}
            closeOnBackdrop={!isConverting}
            closeOnEsc={!isConverting}
            isLoading={isConverting}
        >
            <div className="space-y-4">
                {resolvedError ? (
                    <Alert variant="error">{resolvedError}</Alert>
                ) : null}

                <p className="text-sm text-muted-foreground">
                    Se copiarán bloques, estructura semanal y sesiones del plan a semanas relativas.
                    Después podrás validar y publicar la plantilla en el editor.
                </p>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isConverting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => void handleConfirm()}
                        isLoading={isConverting}
                        disabled={isConverting}
                    >
                        {isConverting ? "Convirtiendo…" : "Convertir en plantilla"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};

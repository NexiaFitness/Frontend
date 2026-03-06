/**
 * SelectTemplateModal.tsx — Modal para elegir una plantilla al flujo "Usar plantilla" desde cliente
 *
 * Contexto:
 * - Desde la ficha del cliente, "Usar plantilla" abre este modal para elegir qué plantilla asignar.
 * - Al seleccionar una fila se llama onSelect(templateId, templateName) y el padre abre AssignTemplateModal
 *   con ese template y clientId.
 *
 * Mantenimiento:
 * - Usa useGetTrainingPlanTemplatesQuery; trainerId desde useGetCurrentTrainerProfileQuery.
 * - Tipografía: TYPOGRAPHY (fuente única en @/utils/typography).
 *
 * @author Frontend Team
 * @since v6.4.0 - Fase 1 paso 1.1 (Plan integración flujo planificación UX)
 */

import React from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useGetTrainingPlanTemplatesQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { TYPOGRAPHY } from "@/utils/typography";

export interface SelectTemplateModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (templateId: number, templateName: string) => void;
}

export const SelectTemplateModal: React.FC<SelectTemplateModalProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id ?? 0;

    const { data: templates = [], isLoading } = useGetTrainingPlanTemplatesQuery(
        trainerId ? { trainerId } : { trainerId: 0 },
        { skip: !trainerId || !open }
    );

    const handleChoose = (templateId: number, templateName: string) => {
        onSelect(templateId, templateName);
        onClose();
    };

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Usar plantilla"
            description="Elige una plantilla para asignar a este cliente"
            closeOnBackdrop
            closeOnEsc
        >
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex min-h-[120px] items-center justify-center py-6">
                        <LoadingSpinner size="md" />
                    </div>
                ) : templates.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-6">
                        No tienes plantillas. Crea una desde Planes de entrenamiento.
                    </p>
                ) : (
                    <ul className="max-h-[280px] space-y-1 overflow-y-auto rounded-lg border border-border bg-surface-2 p-2">
                        {templates.map((t) => (
                            <li key={t.id}>
                                <button
                                    type="button"
                                    onClick={() => handleChoose(t.id, t.name)}
                                    className="block w-full rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    aria-label={`Asignar plantilla ${t.name}`}
                                >
                                    <span className={`${TYPOGRAPHY.bodyMedium} text-foreground`}>
                                        {t.name}
                                    </span>
                                    {t.goal && (
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {t.goal}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BaseModal>
    );
};

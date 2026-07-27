/**
 * SelectTemplateModal.tsx — Modal para elegir plantilla publicada al flujo desde cliente.
 */

import React, { useMemo } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useGetTrainingPlanTemplatesQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { isTemplateAssignable, labelTrainingGoal } from "@nexia/shared";
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
        { skip: !trainerId || !open },
    );

    const assignableTemplates = useMemo(
        () =>
            templates.filter((t) =>
                isTemplateAssignable({
                    lifecycle_status: t.lifecycle_status,
                    validation_status: t.validation_status,
                }),
            ),
        [templates],
    );

    const handleChoose = (templateId: number, templateName: string) => {
        onSelect(templateId, templateName);
        onClose();
    };

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Elegir plantilla"
            description="Solo se listan plantillas publicadas y listas para asignar"
            closeOnBackdrop
            closeOnEsc
        >
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex min-h-[120px] items-center justify-center py-6">
                        <LoadingSpinner size="md" />
                    </div>
                ) : assignableTemplates.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        No tienes plantillas publicadas. Créala y publícala desde Planes →
                        Plantillas.
                    </p>
                ) : (
                    <ul className="max-h-[280px] space-y-1 overflow-y-auto rounded-lg border border-border bg-surface-2 p-2">
                        {assignableTemplates.map((t) => (
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
                                    {t.goal ? (
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {labelTrainingGoal(t.goal)}
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BaseModal>
    );
};

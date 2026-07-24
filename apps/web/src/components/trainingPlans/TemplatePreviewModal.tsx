/**
 * TemplatePreviewModal.tsx — Vista previa de plantilla (metadata greenfield v3).
 */

import React from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import {
    formatTemplateDurationHint,
    formatTemplateProgramWeekCount,
    labelTemplateLifecycle,
    labelTemplateValidation,
} from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: number | null;
    onUseTemplate?: () => void;
}

const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    isOpen,
    onClose,
    templateId,
    onUseTemplate,
}) => {
    const { data: template, isLoading } = useGetTrainingPlanTemplateQuery(templateId || 0, {
        skip: !templateId || !isOpen,
    });

    const handleUseTemplate = (): void => {
        onUseTemplate?.();
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Vista previa de la plantilla"
            description="Metadata y estado del programa"
            iconType="info"
            closeOnBackdrop
            closeOnEsc
            isLoading={isLoading}
        >
            {isLoading ? (
                <div className="py-8 text-center">
                    <p className="text-muted-foreground">Cargando plantilla…</p>
                </div>
            ) : template ? (
                <div className="space-y-6">
                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} mb-3 text-foreground`}>
                            Información básica
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Nombre:</span>
                                <p className="text-foreground">{template.name}</p>
                            </div>
                            {template.description ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Descripción:
                                    </span>
                                    <p className="text-foreground">{template.description}</p>
                                </div>
                            ) : null}
                            <div>
                                <span className="font-semibold text-muted-foreground">Objetivo:</span>
                                <p className="text-foreground">{template.goal}</p>
                            </div>
                            {template.category ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Categoría:
                                    </span>
                                    <p className="text-foreground">{template.category}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} mb-3 text-foreground`}>
                            Estado del programa
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Ciclo:</span>
                                <p className="text-foreground">
                                    {labelTemplateLifecycle(template.lifecycle_status)}
                                </p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">
                                    Validación:
                                </span>
                                <p className="text-foreground">
                                    {labelTemplateValidation(template.validation_status)}
                                </p>
                            </div>
                            {template.folder_name ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Carpeta:
                                    </span>
                                    <p className="text-foreground">{template.folder_name}</p>
                                </div>
                            ) : null}
                            {template.level ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">Nivel:</span>
                                    <p className="text-foreground">
                                        {levelLabels[template.level] ?? template.level}
                                    </p>
                                </div>
                            ) : null}
                            {formatTemplateProgramWeekCount(template.program_week_count) ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Estructura:
                                    </span>
                                    <p className="text-foreground">
                                        {formatTemplateProgramWeekCount(template.program_week_count)}
                                    </p>
                                </div>
                            ) : null}
                            {formatTemplateDurationHint(template.estimated_duration_weeks) ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Duración referencia:
                                    </span>
                                    <p className="text-foreground">
                                        {formatTemplateDurationHint(template.estimated_duration_weeks)}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {template.tags && template.tags.length > 0 ? (
                        <div>
                            <span className="mb-2 block text-sm font-semibold text-muted-foreground">
                                Etiquetas
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} mb-3 text-foreground`}>
                            Estadísticas
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Veces usada:</span>
                                <p className="text-foreground">{template.usage_count}</p>
                            </div>
                            {template.success_rate != null ? (
                                <div>
                                    <span className="font-semibold text-muted-foreground">
                                        Tasa de éxito:
                                    </span>
                                    <p className="text-foreground">
                                        {template.success_rate.toFixed(1)}%
                                    </p>
                                </div>
                            ) : null}
                            <div>
                                <span className="font-semibold text-muted-foreground">Visibilidad:</span>
                                <p className="text-foreground">
                                    {template.is_public ? "Pública" : "Privada"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
                        <Button variant="outline" size="lg" onClick={onClose} className="w-full sm:w-auto">
                            Cerrar
                        </Button>
                        {onUseTemplate ? (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleUseTemplate}
                                className="w-full sm:ml-auto sm:w-auto"
                            >
                                Usar plantilla
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-muted-foreground">No se pudo cargar la plantilla</p>
                </div>
            )}
        </BaseModal>
    );
};

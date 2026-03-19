/**
 * TemplatePreviewModal.tsx — Modal para previsualizar template de plan de entrenamiento
 *
 * Contexto:
 * - Muestra información completa del template en modo solo lectura
 * - Permite usar el template directamente desde el modal
 * - Diseño limpio y profesional
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
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

const durationUnitLabels: Record<string, string> = {
    days: "días",
    weeks: "semanas",
    months: "meses",
};

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    isOpen,
    onClose,
    templateId,
    onUseTemplate,
}) => {
    const { data: template, isLoading } = useGetTrainingPlanTemplateQuery(
        templateId || 0,
        { skip: !templateId || !isOpen }
    );

    const handleUseTemplate = (): void => {
        if (onUseTemplate) {
            onUseTemplate();
        }
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Vista Previa del Template"
            description="Información completa del template de plan de entrenamiento"
            iconType="info"
            closeOnBackdrop={true}
            closeOnEsc={true}
            isLoading={isLoading}
        >
            {isLoading ? (
                <div className="py-8 text-center">
                    <p className="text-gray-600">Cargando información del template...</p>
                </div>
            ) : template ? (
                <div className="space-y-6">
                    {/* Información Básica */}
                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-3`}>
                            Información Básica
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Nombre:</span>
                                <p className="text-gray-900">{template.name}</p>
                            </div>
                            {template.description && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Descripción:</span>
                                    <p className="text-gray-900">{template.description}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Objetivo:</span>
                                <p className="text-gray-900">{template.goal}</p>
                            </div>
                            {template.category && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Categoría:</span>
                                    <p className="text-gray-900">{template.category}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configuración Genérica (si aplica) */}
                    {template.is_generic && (
                        <div>
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-3`}>
                                Configuración Genérica
                            </h3>
                            <div className="space-y-2">
                                {template.level && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Nivel:</span>
                                        <p className="text-gray-900">{levelLabels[template.level] || template.level}</p>
                                    </div>
                                )}
                                {template.training_days_per_week && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Días por semana:</span>
                                        <p className="text-gray-900">{template.training_days_per_week}x/semana</p>
                                    </div>
                                )}
                                {template.duration_value && template.duration_unit && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Duración:</span>
                                        <p className="text-gray-900">
                                            {template.duration_value} {durationUnitLabels[template.duration_unit] || template.duration_unit}
                                        </p>
                                    </div>
                                )}
                                {template.folder_name && (
                                    <div>
                                        <span className="text-sm font-semibold text-gray-700">Carpeta:</span>
                                        <p className="text-gray-900">{template.folder_name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Duración Estimada (si no es genérico) */}
                    {!template.is_generic && template.estimated_duration_weeks && (
                        <div>
                            <span className="text-sm font-semibold text-gray-700">Duración estimada:</span>
                            <p className="text-gray-900">{template.estimated_duration_weeks} semanas</p>
                        </div>
                    )}

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                        <div>
                            <span className="text-sm font-semibold text-gray-700 mb-2 block">Etiquetas:</span>
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Estadísticas */}
                    <div>
                        <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-3`}>
                            Estadísticas
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Veces usado:</span>
                                <p className="text-gray-900">{template.usage_count} {template.usage_count === 1 ? "vez" : "veces"}</p>
                            </div>
                            {template.success_rate !== null && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Tasa de éxito:</span>
                                    <p className="text-gray-900">{template.success_rate.toFixed(1)}%</p>
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Visibilidad:</span>
                                <p className="text-gray-900">{template.is_public ? "Público" : "Privado"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Cerrar
                        </Button>
                        {onUseTemplate && (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleUseTemplate}
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                Usar Template
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center">
                    <p className="text-gray-600">No se pudo cargar la información del template</p>
                </div>
            )}
        </BaseModal>
    );
};


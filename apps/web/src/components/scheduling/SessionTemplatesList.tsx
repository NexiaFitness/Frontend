/**
 * SessionTemplatesList.tsx — Lista de plantillas de sesión para sidebar
 *
 * Contexto:
 * - Componente para sidebar de SchedulingPage
 * - Muestra lista de templates disponibles
 * - Permite usar template o crear nuevo
 * - Diseño similar al existente pero adaptado para ScheduledSession
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React from "react";
import type { SessionTemplate } from "@nexia/shared/types/sessionProgramming";
import { Button } from "@/components/ui/buttons";

interface SessionTemplatesListProps {
    templates: SessionTemplate[];
    onUseTemplate: (templateId: number) => void;
    onCreateTemplate: () => void;
}

export const SessionTemplatesList: React.FC<SessionTemplatesListProps> = ({
    templates,
    onUseTemplate,
    onCreateTemplate,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
                Plantillas de Sesión
            </h3>

            <div className="space-y-3">
                {templates.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                        No hay plantillas disponibles
                    </p>
                ) : (
                    templates.map((template) => (
                        <div
                            key={template.id}
                            className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
                        >
                            <h4 className="font-semibold text-slate-800 mb-1">
                                {template.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                <span>{template.session_type}</span>
                                {template.estimated_duration && (
                                    <span>{template.estimated_duration} min</span>
                                )}
                                {template.usage_count > 0 && (
                                    <span>Usado {template.usage_count} veces</span>
                                )}
                            </div>
                            {template.description && (
                                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                    {template.description}
                                </p>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUseTemplate(template.id)}
                                className="w-full"
                            >
                                Usar Plantilla
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={onCreateTemplate}
                className="w-full mt-4"
            >
                + Crear Plantilla
            </Button>
        </div>
    );
};


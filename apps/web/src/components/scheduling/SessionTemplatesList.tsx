/**
 * SessionTemplatesList.tsx — Lista de plantillas de sesión para sidebar
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v8.1.0 — Migrado a design tokens
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
        <div className="rounded-lg bg-surface border border-border/50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Plantillas de Sesión
            </h3>

            <div className="space-y-3">
                {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No hay plantillas disponibles
                    </p>
                ) : (
                    templates.map((template) => (
                        <div
                            key={template.id}
                            className="border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors"
                        >
                            <h4 className="font-semibold text-foreground text-sm mb-1">
                                {template.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span>{template.session_type}</span>
                                {template.estimated_duration && (
                                    <span>{template.estimated_duration} min</span>
                                )}
                                {template.usage_count > 0 && (
                                    <span>Usado {template.usage_count} veces</span>
                                )}
                            </div>
                            {template.description && (
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
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

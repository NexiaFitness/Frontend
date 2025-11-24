/**
 * TrainingPlanCard.tsx — Card individual para mostrar plan o plantilla
 *
 * Contexto:
 * - Muestra información de un plan o plantilla con acciones contextuales
 * - Diseño consistente con otros dashboards
 * - Acciones visibles según tipo (template, active, archived)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";

interface TrainingPlanCardProps {
    item: TrainingPlan | TrainingPlanTemplate;
    type: "template" | "active" | "archived";
    clientName?: string;
    onEdit?: () => void;
    onAssign?: () => void;
    onDuplicate?: () => void;
    onConvert?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    isProcessing?: boolean; // Indica si el item está siendo procesado
}

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
    item,
    type,
    clientName,
    onEdit,
    onAssign,
    onDuplicate,
    onConvert,
    onDelete,
    onView,
    isProcessing = false,
}) => {
    // Determinar si es template o plan
    const isTemplate = "usage_count" in item;
    const template = isTemplate ? (item as TrainingPlanTemplate) : null;
    const plan = !isTemplate ? (item as TrainingPlan) : null;

    // Calcular duración
    const getDuration = () => {
        if (template?.estimated_duration_weeks) {
            return `${template.estimated_duration_weeks} semanas`;
        }
        if (plan?.start_date && plan?.end_date) {
            const start = new Date(plan.start_date);
            const end = new Date(plan.end_date);
            const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
            return `${weeks} semanas`;
        }
        return "Duración no especificada";
    };

    // Badge de estado
    const getStatusBadge = () => {
        if (type === "archived") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Archivado
                </span>
            );
        }
        if (type === "active" && plan?.status) {
            const statusColors: Record<string, string> = {
                active: "bg-green-100 text-green-800",
                completed: "bg-blue-100 text-blue-800",
                paused: "bg-yellow-100 text-yellow-800",
                cancelled: "bg-red-100 text-red-800",
            };
            const statusLabels: Record<string, string> = {
                active: "Activo",
                completed: "Completado",
                paused: "Pausado",
                cancelled: "Cancelado",
            };
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[plan.status] || statusColors.active}`}>
                    {statusLabels[plan.status] || plan.status}
                </span>
            );
        }
        if (isTemplate) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Plantilla
                </span>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
            {/* Header con título y badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                        {item.name}
                    </h3>
                    {getStatusBadge()}
                </div>
            </div>

            {/* Información */}
            <div className="space-y-2 mb-4">
                {/* Objetivo */}
                <div className="flex items-center text-sm text-slate-600">
                    <svg
                        className="w-4 h-4 mr-2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="font-medium">Objetivo:</span>
                    <span className="ml-2">{item.goal}</span>
                </div>

                {/* Duración */}
                <div className="flex items-center text-sm text-slate-600">
                    <svg
                        className="w-4 h-4 mr-2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{getDuration()}</span>
                </div>

                {/* Cliente (solo para planes activos) */}
                {type === "active" && clientName && (
                    <div className="flex items-center text-sm text-slate-600">
                        <svg
                            className="w-4 h-4 mr-2 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span className="font-medium">Cliente:</span>
                        <span className="ml-2">{clientName}</span>
                    </div>
                )}

                {/* Uso (solo para templates) */}
                {isTemplate && template && template.usage_count > 0 && (
                    <div className="flex items-center text-sm text-slate-600">
                        <svg
                            className="w-4 h-4 mr-2 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span>Usado {template.usage_count} {template.usage_count === 1 ? "vez" : "veces"}</span>
                    </div>
                )}

                {/* Categoría (solo para templates) */}
                {isTemplate && template && template.category && (
                    <div className="flex items-center text-sm text-slate-600">
                        <svg
                            className="w-4 h-4 mr-2 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                        </svg>
                        <span className="capitalize">{template.category}</span>
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                {/* Ver/Editar - Siempre disponible */}
                {(onView || onEdit) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onView || onEdit}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none"
                    >
                        {onView ? "Ver" : "Editar"}
                    </Button>
                )}

                {/* Asignar - Solo para templates */}
                {type === "template" && onAssign && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onAssign}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none"
                    >
                        Asignar
                    </Button>
                )}

                {/* Duplicar - Solo para templates */}
                {type === "template" && onDuplicate && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDuplicate}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="flex-1 sm:flex-none"
                    >
                        Duplicar
                    </Button>
                )}

                {/* Convertir a plantilla - Solo para planes activos */}
                {type === "active" && onConvert && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onConvert}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="flex-1 sm:flex-none"
                    >
                        Guardar como modelo
                    </Button>
                )}

                {/* Eliminar - Siempre disponible */}
                {onDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onDelete}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="flex-1 sm:flex-none"
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </div>
    );
};


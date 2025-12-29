/**
 * TrainingPlanCard.tsx — Card individual para mostrar plan o plantilla
 *
 * Contexto:
 * - Muestra información de un plan o plantilla con acciones contextuales
 * - Diseño alineado con imagen de referencia
 * - Acciones visibles según tipo (template, active, archived)
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v6.0.0 - Rediseño completo según imagen de referencia
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { ClientAvatarsGroup } from "@/components/ui/avatar";
import { FormSelect } from "@/components/ui/forms";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";

interface TrainingPlanCardProps {
    item: TrainingPlan | TrainingPlanTemplate;
    type: "template" | "active" | "archived";
    clientName?: string;
    clients?: Client[]; // Múltiples clientes para programas activos
    onEdit?: () => void;
    onAssign?: () => void;
    onDuplicate?: () => void;
    onConvert?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onPreview?: () => void; // Para templates
    onAddClient?: () => void; // Para programas activos
    onStatusChange?: (status: string) => void; // Para dropdown de progreso
    isProcessing?: boolean;
}

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
    item,
    type,
    clientName: _clientName,
    clients = [],
    onEdit: _onEdit,
    onAssign,
    onDuplicate: _onDuplicate,
    onConvert: _onConvert,
    onDelete: _onDelete,
    onView,
    onPreview,
    onAddClient,
    onStatusChange,
    isProcessing = false,
}) => {
    // Determinar si es template o plan
    const isTemplate = "usage_count" in item;
    const template = isTemplate ? (item as TrainingPlanTemplate) : null;
    const plan = !isTemplate ? (item as TrainingPlan) : null;

    // Calcular duración
    const getDuration = (): string => {
        if (template) {
            if (template.duration_value && template.duration_unit) {
                const unitLabels: Record<string, string> = {
                    days: "días",
                    weeks: "semanas",
                    months: "meses",
                };
                return `${template.duration_value} ${unitLabels[template.duration_unit] || template.duration_unit}`;
            }
            if (template.estimated_duration_weeks) {
                return `${template.estimated_duration_weeks} semanas`;
            }
        }
        if (plan?.start_date && plan?.end_date) {
            const start = new Date(plan.start_date);
            const end = new Date(plan.end_date);
            const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
            return `${weeks} semanas`;
        }
        return "Duración no especificada";
    };

    // Calcular frecuencia de entrenamiento
    const getFrequency = (): string | null => {
        if (template?.training_days_per_week) {
            return `${template.training_days_per_week}x/semana`;
        }
        // Para planes activos, intentar obtener desde template_id si existe
        if (plan?.template_id) {
            // Esto se puede mejorar obteniendo el template, pero por ahora retornamos null
            return null;
        }
        return null;
    };

    // Badge de estado o nivel
    const getBadge = (): React.ReactNode => {
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
        if (isTemplate && template?.level) {
            const levelColors: Record<string, string> = {
                beginner: "bg-green-100 text-green-800",
                intermediate: "bg-yellow-100 text-yellow-800",
                advanced: "bg-red-100 text-red-800",
            };
            const levelLabels: Record<string, string> = {
                beginner: "Principiante",
                intermediate: "Intermedio",
                advanced: "Avanzado",
            };
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[template.level] || "bg-slate-100 text-slate-800"}`}>
                    {levelLabels[template.level] || template.level}
                </span>
            );
        }
        return null;
    };

    const duration = getDuration();
    const frequency = getFrequency();

    // Layout diferente para programas activos (horizontal) vs templates (vertical)
    if (type === "active") {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                {/* Título y badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {item.name}
                    </h3>
                    {getBadge()}
                </div>

                {/* Fila: Descripción a la izquierda, info (duración, frecuencia, avatares, progreso, ellipsis) a la derecha */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                    {/* Descripción a la izquierda */}
                    <div className="flex-1 min-w-0">
                        {item.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                                {item.description}
                            </p>
                        )}
                    </div>

                    {/* Información a la derecha: Duración, Frecuencia, Avatares, Progress y Ellipsis */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 flex-shrink-0">
                        <span>{duration}</span>
                        {frequency && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span>{frequency}</span>
                            </>
                        )}
                        
                        {/* Avatares de clientes */}
                        {clients.length > 0 && (
                            <>
                                <span className="text-slate-300">•</span>
                                <div className="flex items-center gap-2">
                                    <ClientAvatarsGroup
                                        clients={clients}
                                        maxVisible={3}
                                        size="sm"
                                    />
                                    <span className="text-slate-600">
                                        {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Dropdown de Progreso */}
                        {plan && onStatusChange && (
                            <>
                                <span className="text-slate-300">•</span>
                                <div className="w-auto min-w-[120px]">
                                    <FormSelect
                                        value={plan.status || "active"}
                                        onChange={(e) => onStatusChange(e.target.value)}
                                        options={[
                                            { value: "active", label: "Progreso" },
                                            { value: "paused", label: "Pausado" },
                                            { value: "completed", label: "Completado" },
                                            { value: "cancelled", label: "Cancelado" },
                                        ]}
                                        className="text-sm"
                                    />
                                </div>
                            </>
                        )}

                        {/* Menú de opciones (ellipsis vertical) - Al lado del progreso */}
                        <button
                            type="button"
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            disabled={isProcessing}
                            title="Más opciones"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Botones abajo en fila horizontal - Ocupan todo el ancho */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    {/* Ver Detalles */}
                    {onView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onView}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Ver Detalles
                        </Button>
                    )}

                    {/* Agregar Cliente */}
                    {onAddClient && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddClient}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Agregar Cliente
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Layout vertical para templates - Siempre con botones abajo
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
            {/* Header con título y badge en la misma línea */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
                            {item.name}
                        </h3>
                        {getBadge()}
                    </div>
                </div>
            </div>

            {/* Descripción - Siempre ocupa espacio mínimo */}
            <div className="mb-4 min-h-[2.5rem]">
                {item.description ? (
                    <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400 italic">Sin descripción</p>
                )}
            </div>

            {/* Información: Duración y Frecuencia en la misma línea */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <span>{duration}</span>
                {frequency && (
                    <>
                        <span className="text-slate-300">•</span>
                        <span>{frequency}</span>
                    </>
                )}
            </div>

            {/* Tags (solo para templates) */}
            {isTemplate && template && template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                        >
                            {tag}
                        </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            +{template.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Spacer para empujar botones abajo */}
            <div className="flex-1"></div>

            {/* Acciones - Botones y ellipsis - Siempre abajo */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200 mt-auto">
                {/* Vista Previa - Solo para templates */}
                {type === "template" && onPreview && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreview}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        Vista Previa
                    </Button>
                )}

                {/* Usar Template - Solo para templates */}
                {type === "template" && onAssign && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onAssign}
                        disabled={isProcessing}
                        className="flex-1"
                    >
                        Usar Template
                    </Button>
                )}

                {/* Menú de opciones (ellipsis vertical) - Siempre disponible */}
                <button
                    type="button"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
                    disabled={isProcessing}
                    title="Más opciones"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

/**
 * TrainingPlansSection.tsx — Sección con grid de cards de planes/plantillas
 *
 * Contexto:
 * - Renderiza una sección completa (templates, activos, archivados)
 * - Grid responsive con cards
 * - Botón de crear nuevo
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { TrainingPlanCard } from "./TrainingPlanCard";
import { TYPOGRAPHY } from "@/utils/typography";
import type { TrainingPlan, TrainingPlanTemplate } from "@nexia/shared/types/training";

interface TrainingPlansSectionProps {
    title: string;
    description?: string;
    items: (TrainingPlan | TrainingPlanTemplate)[];
    type: "template" | "active" | "archived";
    clientNames?: Record<number, string>; // Map de client_id -> nombre
    onCreate?: () => void;
    onAssign?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onConvert?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
    onView?: (id: number) => void;
    isLoading?: boolean;
    processingIds?: Set<number>; // IDs de items que están siendo procesados
}

export const TrainingPlansSection: React.FC<TrainingPlansSectionProps> = ({
    title,
    description,
    items,
    type,
    clientNames = {},
    onCreate,
    onAssign,
    onDuplicate,
    onConvert,
    onDelete,
    onEdit,
    onView,
    isLoading = false,
    processingIds = new Set(),
}) => {
    // Determinar si es template
    const isTemplate = items.length > 0 && "usage_count" in items[0];

    return (
        <div className="mb-8 lg:mb-12">
            {/* Header */}
            <div className="mb-6 px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <h2 className={`${TYPOGRAPHY.sectionTitle} text-white mb-2`}>
                            {title}
                        </h2>
                        {description && (
                            <p className="text-white/80 text-sm md:text-base">
                                {description}
                            </p>
                        )}
                    </div>
                    {onCreate && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onCreate}
                            className="w-full sm:w-auto"
                        >
                            + Crear {isTemplate ? "Modelo Base" : "Plan"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid de Cards */}
            {isLoading ? (
                <div className="px-4 lg:px-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Cargando...</p>
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="px-4 lg:px-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                No hay {isTemplate ? "plantillas" : "planes"} aún
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {isTemplate
                                    ? "Crea tu primera plantilla reutilizable para asignar a múltiples clientes."
                                    : type === "active"
                                    ? "No hay planes activos en este momento."
                                    : "No hay planes archivados."}
                            </p>
                            {onCreate && (
                                <Button variant="primary" size="lg" onClick={onCreate}>
                                    + Crear {isTemplate ? "Primera Plantilla" : "Primer Plan"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => {
                            // Obtener nombre del cliente si es plan activo
                            const clientId = !isTemplate && "client_id" in item ? item.client_id : null;
                            const clientName = clientId && clientId !== null ? clientNames[clientId] : undefined;

                            // Determinar si este item está siendo procesado
                            const isProcessing = processingIds.has(item.id);

                            return (
                                <TrainingPlanCard
                                    key={item.id}
                                    item={item}
                                    type={type}
                                    clientName={clientName}
                                    onEdit={onEdit ? () => onEdit(item.id) : undefined}
                                    onAssign={onAssign ? () => onAssign(item.id) : undefined}
                                    onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
                                    onConvert={onConvert ? () => onConvert(item.id) : undefined}
                                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                                    onView={onView ? () => onView(item.id) : undefined}
                                    isProcessing={isProcessing}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};


/**
 * OverviewTab.tsx — Tab de overview del training plan
 *
 * Contexto:
 * - Muestra información detallada del plan
 * - Datos básicos, descripción, metadata
 * - Read-only (edición desde header o modal)
 *
 * Responsabilidades:
 * - Renderizar info del plan de forma visual
 * - Mostrar estadísticas básicas
 * - Cards con info organizada
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React from "react";
import type { TrainingPlan } from "@nexia/shared/types/training";

interface OverviewTabProps {
    plan: TrainingPlan;
    clientName?: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ plan, clientName }) => {
    // Formatear fechas
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatDateTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Función para traducir status
    const translateStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            active: "Activo",
            completed: "Completado",
            paused: "Pausado",
            cancelled: "Cancelado",
        };
        return statusMap[status] || status;
    };

    // Info cards data
    const infoCards = [
        {
            label: "Fecha de Inicio",
            value: formatDate(plan.start_date),
            icon: "📅",
        },
        {
            label: "Fecha de Fin",
            value: formatDate(plan.end_date),
            icon: "🏁",
        },
        {
            label: "Objetivo",
            value: plan.goal,
            icon: "🎯",
        },
        {
            label: "Estado",
            value: translateStatus(plan.status),
            icon: "📊",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{card.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                    {card.label}
                                </p>
                                <p className="text-base font-semibold text-gray-900 mt-1 truncate">
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles del Plan</h3>

                <div className="space-y-4">
                    {/* Plan Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Plan
                        </label>
                        <p className="text-base text-gray-900">{plan.name}</p>
                    </div>

                    {/* Client Assigned */}
                    {clientName && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente Asignado
                            </label>
                            <p className="text-base text-gray-900">{clientName}</p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <p className="text-base text-gray-700 whitespace-pre-wrap">
                            {plan.description || "No se ha proporcionado descripción."}
                        </p>
                    </div>

                    {/* Training Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Objetivo de Entrenamiento
                        </label>
                        <p className="text-base text-gray-900">{plan.goal}</p>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado Actual
                        </label>
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                plan.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : plan.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : plan.status === "paused"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {plan.status === "active" ? "Activo" :
                             plan.status === "completed" ? "Completado" :
                             plan.status === "paused" ? "Pausado" :
                             plan.status === "cancelled" ? "Cancelado" :
                             plan.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Metadatos</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Creado el
                        </label>
                        <p className="text-sm text-gray-600">
                            {formatDateTime(plan.created_at)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Última Actualización
                        </label>
                        <p className="text-sm text-gray-600">
                            {formatDateTime(plan.updated_at)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID del Plan
                        </label>
                        <p className="text-sm font-mono text-gray-600">{plan.id}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activo
                        </label>
                        <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                plan.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {plan.is_active ? "Sí" : "No"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
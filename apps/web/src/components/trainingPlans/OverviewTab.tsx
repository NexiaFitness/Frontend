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

    // Info cards data
    const infoCards = [
        {
            label: "Start Date",
            value: formatDate(plan.start_date),
            icon: "📅",
        },
        {
            label: "End Date",
            value: formatDate(plan.end_date),
            icon: "🏁",
        },
        {
            label: "Goal",
            value: plan.goal,
            icon: "🎯",
        },
        {
            label: "Status",
            value: plan.status,
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Details</h3>

                <div className="space-y-4">
                    {/* Plan Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan Name
                        </label>
                        <p className="text-base text-gray-900">{plan.name}</p>
                    </div>

                    {/* Client Assigned */}
                    {clientName && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned Client
                            </label>
                            <p className="text-base text-gray-900">{clientName}</p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <p className="text-base text-gray-700 whitespace-pre-wrap">
                            {plan.description || "No description provided."}
                        </p>
                    </div>

                    {/* Training Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Training Goal
                        </label>
                        <p className="text-base text-gray-900">{plan.goal}</p>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Status
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
                            {plan.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Metadata</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Created At
                        </label>
                        <p className="text-sm text-gray-600">
                            {formatDateTime(plan.created_at)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Updated
                        </label>
                        <p className="text-sm text-gray-600">
                            {formatDateTime(plan.updated_at)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan ID
                        </label>
                        <p className="text-sm font-mono text-gray-600">{plan.id}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Active
                        </label>
                        <span
                            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                plan.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {plan.is_active ? "Yes" : "No"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
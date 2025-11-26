/**
 * TrainingPlanSummaryCard.tsx — Card de resumen de estadísticas del plan
 *
 * Contexto:
 * - Muestra estadísticas generales del Training Plan
 * - Usado en dashboards de planning analytics
 * - Incluye: sesiones planificadas, completadas, y tasa de adherencia
 *
 * Responsabilidades:
 * - Mostrar 3 métricas principales en grid
 * - Colorizar adherence rate según porcentaje
 * - Mostrar descripción opcional
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";
import type { TrainingPlanSummaryStats } from "@nexia/shared/types/trainingAnalytics";
import { TYPOGRAPHY } from "@/utils/typography";

export interface TrainingPlanSummaryCardProps {
    stats: TrainingPlanSummaryStats;
    description?: string;
}

const getAdherenceColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
};

export const TrainingPlanSummaryCard: React.FC<TrainingPlanSummaryCardProps> = ({
    stats,
    description,
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-6`}>Resumen del Plan de Entrenamiento</h3>

            {/* Grid de 3 métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total Sessions Planned */}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                        {stats.total_sessions_planned}
                    </p>
                    <p className="text-sm font-medium text-slate-600">Planificadas</p>
                </div>

                {/* Sessions Completed */}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                        {stats.sessions_completed}
                    </p>
                    <p className="text-sm font-medium text-slate-600">Completadas</p>
                </div>

                {/* Adherence Rate */}
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <p
                        className={`text-3xl font-bold mb-1 ${getAdherenceColor(
                            stats.adherence_rate
                        )}`}
                    >
                        {stats.adherence_rate.toFixed(0)}%
                    </p>
                    <p className="text-sm font-medium text-slate-600">Tasa de Adherencia</p>
                </div>
            </div>

            {/* Descripción opcional */}
            {description && (
                <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>
            )}
        </div>
    );
};


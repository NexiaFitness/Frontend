/**
 * ClientStatusSection.tsx — Sección de Estado del Cliente (Indicadores Informativos)
 *
 * Contexto:
 * - Muestra indicadores informativos sobre el estado del cliente
 * - NO son alertas persistentes, son información de contexto
 * - Incluye: coherencia, monotonía, adherencia, tendencias, nivel de riesgo
 * - NO tiene acciones de "marcar como leída" o "resolver"
 * - Se usa para contexto y soporte de decisiones
 *
 * Responsabilidades:
 * - Mostrar métricas de coherencia (adherencia, monotonía)
 * - Mostrar nivel de riesgo de fatiga
 * - Mostrar tendencias de progreso
 * - Proporcionar contexto para tomar decisiones sobre alertas
 *
 * @author Frontend Team
 * @since v6.3.0 - Fase 2: Separación Alerts/Status
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import type { MetricCardColor } from "@nexia/shared/types/coherence";
import { MetricCard } from "@/components/ui/cards";
import { TYPOGRAPHY } from "@/utils/typography";
import { useCoherence } from "@nexia/shared/hooks/clients/useCoherence";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";

interface ClientStatusSectionProps {
    client: Client;
    clientId: number;
}

/**
 * Sección de Estado del Cliente
 *
 * Muestra indicadores informativos para contexto y soporte de decisiones.
 * NO son alertas persistentes, solo información de estado.
 */
export const ClientStatusSection: React.FC<ClientStatusSectionProps> = ({ client, clientId }) => {
    const navigate = useNavigate();

    // Validar clientId antes de hacer cualquier llamada
    const isValidClientId = clientId && clientId > 0;

    // Obtener datos de coherencia (adherencia, monotonía)
    const { data: coherenceData, isLoading: isLoadingCoherence } = useCoherence(
        isValidClientId ? clientId : 0,
        undefined,
        undefined,
        undefined,
        "week"
    );

    // Obtener datos de fatiga
    const {
        currentRiskLevel,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(isValidClientId ? clientId : 0);

    // Obtener datos de progreso (tendencias)
    const {
        trend,
        isLoading: isLoadingProgress,
    } = useClientProgress(isValidClientId ? clientId : 0, client);

    // Determinar color de adherencia
    const adherenceColor = useMemo((): MetricCardColor => {
        if (!isValidClientId) return "green";
        const adherence = coherenceData?.adherence_percentage || 0;
        if (adherence >= 80) return "green";
        if (adherence >= 60) return "orange";
        return "red";
    }, [isValidClientId, coherenceData?.adherence_percentage]);

    // Determinar color de monotonía
    const monotonyColor = useMemo((): MetricCardColor => {
        if (!isValidClientId) return "green";
        const monotony = coherenceData?.monotony || 0;
        if (monotony <= 2.0) return "green";
        if (monotony <= 3.0) return "orange";
        return "red";
    }, [isValidClientId, coherenceData?.monotony]);

    // Determinar color de riesgo
    const riskColor = useMemo((): MetricCardColor => {
        if (!currentRiskLevel) return "green";
        if (currentRiskLevel === "high") return "red";
        if (currentRiskLevel === "medium") return "orange";
        return "green";
    }, [currentRiskLevel]);

    // Loading state
    const isLoading = isLoadingCoherence || isLoadingFatigue || isLoadingProgress;

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500">Cargando estado del cliente...</p>
                </div>
            </div>
        );
    }

    // Si no hay datos válidos, no mostrar la sección
    if (!isValidClientId || (!coherenceData && !currentRiskLevel)) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6" id="client-status-section">
            <div className="mb-4">
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    Estado del Cliente
                </h3>
                <p className="text-sm text-gray-600">
                    Indicadores informativos sobre coherencia, adherencia y tendencias. Usa esta información como contexto para tomar decisiones.
                </p>
            </div>

            {/* Métricas de Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {coherenceData && (
                    <>
                        <MetricCard
                            title="Adherencia"
                            value={`${coherenceData.adherence_percentage.toFixed(0)}%`}
                            subtitle={`${coherenceData.sessions_completed || 0}/${coherenceData.sessions_total || 0} sesiones`}
                            color={adherenceColor}
                        />
                        <MetricCard
                            title="Monotonía"
                            value={coherenceData.monotony ? coherenceData.monotony.toFixed(1) : "N/A"}
                            subtitle={coherenceData.monotony && coherenceData.monotony > 2.0 ? "Alta - Revisar planificación" : "Normal"}
                            color={monotonyColor}
                        />
                    </>
                )}
                {currentRiskLevel && (
                    <MetricCard
                        title="Nivel de Riesgo"
                        value={
                            currentRiskLevel === "high"
                                ? "Alto"
                                : currentRiskLevel === "medium"
                                  ? "Medio"
                                  : "Bajo"
                        }
                        subtitle="Basado en análisis de fatiga"
                        color={riskColor}
                    />
                )}
            </div>

            {/* Indicadores de Tendencias */}
            {trend && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Tendencia de Progreso</p>
                    <p className="text-sm text-blue-700">
                        {trend === "gaining_weight" && "📈 Ganando peso"}
                        {trend === "losing_weight" && "📉 Perdiendo peso"}
                        {trend === "stable" && "➡️ Estable"}
                        {trend === "maintaining_weight" && "➡️ Manteniendo peso"}
                    </p>
                </div>
            )}

            {/* Información Contextual */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {coherenceData?.monotony && coherenceData.monotony > 2.0 && (
                        <button
                            onClick={() => navigate(`/dashboard/clients/${clientId}?tab=daily-coherence`)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                            Ver detalles de coherencia →
                        </button>
                    )}
                    {currentRiskLevel && currentRiskLevel !== "low" && (
                        <button
                            onClick={() => navigate(`/dashboard/clients/${clientId}?tab=progress`)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                            Ver análisis de fatiga →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


/**
 * ClientProgressTab.tsx — Tab Progress del cliente
 *
 * Contexto:
 * - Muestra gráficos de evolución de peso, IMC, intensity, volume
 * - Usa Recharts para visualización
 * - Analytics de tendencias y cambios
 * - Basado en Figma Profile Page V2 (gráficos de línea)
 *
 * Responsabilidades:
 * - Gráficos de progreso físico (peso, IMC)
 * - Gráficos de entrenamiento (intensity, volume)
 * - Métricas de cambio y tendencias
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React from "react";
import type { ClientProgress, ProgressAnalytics } from "@nexia/shared/types/progress";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Formatea fechas para gráficos de Recharts
 * @param date - Fecha en formato string o number (timestamp)
 * @returns Fecha formateada para locale
 */
const formatDate = (date: string | number): string => {
    return new Date(date).toLocaleDateString();
};

// ========================================
// COMPONENT
// ========================================

interface ClientProgressTabProps {
    clientId: number;
    progressHistory?: ClientProgress[];
    progressAnalytics?: ProgressAnalytics;
}

export const ClientProgressTab: React.FC<ClientProgressTabProps> = ({
    clientId,
}) => {
    const {
        weightChartData,
        bmiChartData,
        latestWeight,
        latestBmi,
        weightChange,
        bmiChange,
        trend,
        isLoading: isLoadingProgress,
        error: progressError,
    } = useClientProgress(clientId);

    const {
        fatigueChartData,
        energyChartData,
        workloadChartData,
        currentRiskLevel,
        avgPreFatigue,
        avgPostFatigue,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(clientId);

    const isLoading = isLoadingProgress || isLoadingFatigue;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (progressError) {
        return (
            <Alert variant="error">
                Error al cargar datos de progreso. Por favor, intenta de nuevo.
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryCard
                    label="Peso Actual"
                    value={latestWeight ? `${latestWeight} kg` : "N/A"}
                    change={weightChange}
                    trend={trend}
                />
                <SummaryCard
                    label="IMC Actual"
                    value={latestBmi ? latestBmi.toFixed(1) : "N/A"}
                    change={bmiChange}
                />
                <SummaryCard
                    label="Fatiga Promedio (Pre)"
                    value={avgPreFatigue ? avgPreFatigue.toFixed(1) : "N/A"}
                />
                <SummaryCard
                    label="Fatiga Promedio (Post)"
                    value={avgPostFatigue ? avgPostFatigue.toFixed(1) : "N/A"}
                />
                <SummaryCard
                    label="Nivel de Riesgo"
                    value={currentRiskLevel || "N/A"}
                    riskLevel={currentRiskLevel}
                />
            </div>

            {/* Weight Chart */}
            {weightChartData.length > 0 && (
                <ChartCard title="Evolución del Peso">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weightChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#3b82f6"
                                name="Peso (kg)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* BMI Chart */}
            {bmiChartData.length > 0 && (
                <ChartCard title="Evolución del IMC">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bmiChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="bmi"
                                stroke="#10b981"
                                name="IMC"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Fatigue Chart */}
            {fatigueChartData.length > 0 && (
                <ChartCard title="Análisis de Fatiga">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={fatigueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis domain={[0, 10]} />
                            <Tooltip
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="pre_fatigue"
                                stroke="#f59e0b"
                                name="Fatiga Pre-Sesión"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="post_fatigue"
                                stroke="#ef4444"
                                name="Fatiga Post-Sesión"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Energy Chart */}
            {energyChartData.length > 0 && (
                <ChartCard title="Niveles de Energía">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={energyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis domain={[0, 10]} />
                            <Tooltip
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="pre_energy"
                                stroke="#8b5cf6"
                                name="Energía Pre-Sesión"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="post_energy"
                                stroke="#6366f1"
                                name="Energía Post-Sesión"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Workload Chart */}
            {workloadChartData.length > 0 && (
                <ChartCard title="Carga de Trabajo y Recuperación">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={workloadChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={formatDate}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="workload_score"
                                stroke="#06b6d4"
                                name="Carga de Trabajo"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="recovery_need_score"
                                stroke="#ec4899"
                                name="Necesidad de Recuperación"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Empty state */}
            {weightChartData.length === 0 && bmiChartData.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        No hay datos de progreso disponibles para este cliente.
                    </p>
                </div>
            )}
        </div>
    );
};

// ========================================
// HELPER COMPONENTS
// ========================================

interface SummaryCardProps {
    label: string;
    value: string;
    change?: number | null;
    trend?: string | null;
    riskLevel?: string | null;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    label,
    value,
    change,
    trend,
    riskLevel,
}) => {
    const getRiskColor = (level?: string | null) => {
        if (!level) return "text-gray-600";
        if (level === "low") return "text-green-600";
        if (level === "medium") return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`${TYPOGRAPHY.metric} ${getRiskColor(riskLevel)}`}>
                {value}
            </p>
            {change !== null && change !== undefined && (
                <p className={`text-sm mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}
                </p>
            )}
            {trend && (
                <p className="text-xs text-gray-500 mt-1">
                    Tendencia: {trend}
                </p>
            )}
        </div>
    );
};

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                {title}
            </h3>
            {children}
        </div>
    );
};
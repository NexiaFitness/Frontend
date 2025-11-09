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

import React, { useState, useRef, useEffect } from "react";
import type { ClientProgress, ProgressAnalytics } from "@nexia/shared/types/progress";
import type { Client } from "@nexia/shared/types/client";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { TYPOGRAPHY } from "@/utils/typography";
import { ProgressForm } from "./ProgressForm";
import { EditProgressModal } from "../modals/EditProgressModal";
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
    client?: Client | null;
    progressHistory?: ClientProgress[];
    progressAnalytics?: ProgressAnalytics;
}

export const ClientProgressTab: React.FC<ClientProgressTabProps> = ({
    clientId,
    client,
}) => {
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ClientProgress | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        progressHistory,
        weightChartData,
        bmiChartData,
        latestWeight,
        latestBmi,
        weightChange,
        bmiChange,
        trend,
        isLoading: isLoadingProgress,
        error: progressError,
    } = useClientProgress(clientId, client);

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

    // Verificar si es un error 404 (sin datos) o un error real
    const isNotFoundError: boolean = Boolean(
        progressError &&
        typeof progressError === 'object' &&
        'status' in progressError &&
        progressError.status === 404
    );

    const hasRealError: boolean = Boolean(progressError && !isNotFoundError);

    // Scroll automático cuando se expande el formulario
    useEffect(() => {
        if (showProgressForm && formRef.current) {
            // Pequeño delay para asegurar que el DOM se haya actualizado
            setTimeout(() => {
                formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }
    }, [showProgressForm]);

    // Handlers para edición
    const handleEditClick = (record: ClientProgress) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditModalOpen(false);
        setSelectedRecord(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Si hay un error real (no 404), mostrar alerta y no renderizar el resto
    if (hasRealError) {
        return (
            <Alert variant="error">
                Error al cargar datos de progreso. Por favor, intenta de nuevo.
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mensaje de sin datos (404) - solo si no hay datos y no hay error real */}
            {isNotFoundError && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        Aún no hay datos de progreso para este cliente.
                    </p>
                </div>
            )}

            {/* Summary Cards - solo mostrar si hay datos */}
            {!isNotFoundError && (
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
            )}

            {/* Lista de registros de progreso con botones de editar */}
            {!isNotFoundError && progressHistory && progressHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 space-y-3">
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                        Historial de Registros
                    </h3>
                    {progressHistory.map((record: ClientProgress) => (
                        <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                            <div className="text-gray-700">
                                <p><strong>Fecha:</strong> {new Date(record.fecha_registro).toLocaleDateString()}</p>
                                <p><strong>Peso:</strong> {record.peso ? `${record.peso} kg` : "N/A"} — <strong>IMC:</strong> {record.imc ? record.imc.toFixed(1) : "N/A"}</p>
                                {record.notas && (
                                    <p className="text-sm text-gray-500 mt-1"><strong>Notas:</strong> {record.notas}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleEditClick(record)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar registro"
                                aria-label="Editar registro"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Weight Chart - solo mostrar si hay datos */}
            {!isNotFoundError && weightChartData.length > 0 && (
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

            {/* BMI Chart - solo mostrar si hay datos */}
            {!isNotFoundError && bmiChartData.length > 0 && (
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

            {/* Fatigue Chart - solo mostrar si hay datos */}
            {!isNotFoundError && fatigueChartData.length > 0 && (
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

            {/* Energy Chart - solo mostrar si hay datos */}
            {!isNotFoundError && energyChartData.length > 0 && (
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

            {/* Workload Chart - solo mostrar si hay datos */}
            {!isNotFoundError && workloadChartData.length > 0 && (
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

            {/* Empty state - solo si no es 404 y no hay datos en los gráficos */}
            {!isNotFoundError && weightChartData.length === 0 && bmiChartData.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        No hay datos de progreso disponibles para este cliente.
                    </p>
                </div>
            )}

            {/* Sección colapsable para agregar nuevo registro */}
            <div className="mt-8" ref={formRef}>
                <button
                    type="button"
                    onClick={() => setShowProgressForm(!showProgressForm)}
                    className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition-colors"
                >
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                        {showProgressForm ? "➖" : "➕"} Añadir nuevo registro de progreso
                    </h3>
                    <span className="text-gray-500 text-sm">
                        {showProgressForm ? "Ocultar" : "Mostrar"}
                    </span>
                </button>
                {showProgressForm && (
                    <div className="mt-4">
                        <ProgressForm clientId={clientId} />
                    </div>
                )}
            </div>

            {/* Modal de edición */}
            {selectedRecord && (
                <EditProgressModal
                    isOpen={editModalOpen}
                    onClose={handleCloseModal}
                    progressRecord={selectedRecord}
                    clientId={clientId}
                    onSuccess={() => window.location.reload()}
                />
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
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
import { FatigueAlertsSection } from "../fatigue/FatigueAlertsSection";
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
import type { LegendProps } from "recharts";

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
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
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
    const defaultChartMargin = { top: 5, right: 10, left: 30, bottom: 60 };
    const chartHeight = 400;
    const minChartContainerHeight = 360;
    const legendConfig: LegendProps = {
        align: "left",
        verticalAlign: "bottom",
        wrapperStyle: { paddingTop: 15 },
    };

    const hasBodyCompCharts = weightChartData.length > 0 || bmiChartData.length > 0;
    const hasFatigueEnergyCharts =
        fatigueChartData.length > 0 || energyChartData.length > 0;
    const hasWorkloadChart = workloadChartData.length > 0;

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
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Progreso del Cliente
                    </h2>
                    <p className="text-slate-600 mt-2">
                        Evolución de métricas corporales, fatiga, energía y carga de trabajo
                    </p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Exportar PDF
                </button>
            </div>

            <nav aria-label="Tabs progreso" className="flex gap-1 border-b border-gray-200">
                {[
                    { id: "overview", label: "Resumen" },
                    { id: "history", label: "Historial de Registros" },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "overview" | "history")}
                            className={`relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[140px] text-center ${
                                isActive
                                    ? "text-[#4A67B3]"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {tab.label}
                            {isActive && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#4A67B3]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Mensaje de sin datos (404) - solo si no hay datos y no hay error real */}
            {isNotFoundError && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">
                        Aún no hay datos de progreso para este cliente.
                    </p>
                </div>
            )}

            {activeTab === "overview" && (
                <>
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
                </>
            )}

            {activeTab === "history" && !isNotFoundError && progressHistory && progressHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow px-4 pt-4 pb-4 space-y-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Historial de Registros
                    </h3>
                    {progressHistory.map((record: ClientProgress) => (
                        <div key={record.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                            <div className="text-gray-700">
                                <p>
                                    <strong>Fecha:</strong>{" "}
                                    {new Date(record.fecha_registro).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Peso:</strong>{" "}
                                    {record.peso ? `${record.peso} kg` : "N/A"} —{" "}
                                    <strong>IMC:</strong>{" "}
                                    {record.imc ? record.imc.toFixed(1) : "N/A"}
                                </p>
                                {record.notas && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        <strong>Notas:</strong> {record.notas}
                                    </p>
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

            {activeTab === "overview" && (
                <>
                    {!isNotFoundError && hasBodyCompCharts && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {weightChartData.length > 0 && (
                                <ChartCard title="Evolución del Peso">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={weightChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tickFormatter={formatDate} />
                                            <YAxis
                                                domain={[0, 150]}
                                                allowDataOverflow
                                                label={{
                                                    value: "Peso (kg)",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    style: { textAnchor: "middle" },
                                                }}
                                            />
                                                    <Tooltip labelFormatter={formatDate} />
                                            <Legend {...legendConfig} />
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
                                        </div>
                                    </div>
                                </ChartCard>
                            )}

                            {bmiChartData.length > 0 && (
                                <ChartCard title="Evolución del IMC">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={bmiChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tickFormatter={formatDate} />
                                            <YAxis
                                                domain={[0, 40]}
                                                allowDataOverflow
                                                label={{
                                                    value: "IMC",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    style: { textAnchor: "middle" },
                                                }}
                                            />
                                                    <Tooltip labelFormatter={formatDate} />
                                            <Legend {...legendConfig} />
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
                                        </div>
                                    </div>
                                </ChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasFatigueEnergyCharts && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {fatigueChartData.length > 0 && (
                                <ChartCard title="Análisis de Fatiga">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={fatigueChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tickFormatter={formatDate} />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        label={{
                                                            value: "Nivel de Fatiga (1-10)",
                                                            angle: -90,
                                                            position: "insideLeft",
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                    />
                                                    <Tooltip labelFormatter={formatDate} />
                                            <Legend {...legendConfig} />
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
                                        </div>
                                    </div>
                                </ChartCard>
                            )}

                            {energyChartData.length > 0 && (
                                <ChartCard title="Niveles de Energía">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={energyChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tickFormatter={formatDate} />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        label={{
                                                            value: "Nivel de Energía (1-10)",
                                                            angle: -90,
                                                            position: "insideLeft",
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                    />
                                                    <Tooltip labelFormatter={formatDate} />
                                            <Legend {...legendConfig} />
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
                                        </div>
                                    </div>
                                </ChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasWorkloadChart && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Carga de Trabajo y Recuperación" className="lg:col-span-2">
                                <div
                                    className="w-full flex items-center justify-center"
                                    style={{ minHeight: `${minChartContainerHeight}px` }}
                                >
                                    <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                        <ResponsiveContainer width="100%" height={chartHeight}>
                                            <LineChart data={workloadChartData} margin={defaultChartMargin}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                            <YAxis
                                                domain={[0, 1500]}
                                                allowDataOverflow
                                                label={{
                                                    value: "Carga / Recuperación",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    style: { textAnchor: "middle" },
                                                }}
                                            />
                                                <Tooltip labelFormatter={formatDate} />
                                            <Legend {...legendConfig} />
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
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                    )}
                </>
            )}

            {/* Sección de Alertas de Fatiga */}
            <FatigueAlertsSection clientId={clientId} />

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
    const themeMap: Record<string, { bg: string; border: string; text: string }> = {
        "Peso Actual": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
        "IMC Actual": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" },
        "Fatiga Promedio (Pre)": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800" },
        "Fatiga Promedio (Post)": { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800" },
        "Nivel de Riesgo": { bg: "bg-rose-50", border: "border-rose-200", text: riskLevel === "low" ? "text-emerald-700" : riskLevel === "medium" ? "text-amber-600" : "text-rose-700" },
    };

    const theme = themeMap[label] || { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800" };

    return (
        <div className={`rounded-lg border ${theme.bg} ${theme.border} p-4 min-h-[136px] flex flex-col gap-1`}>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className={`text-3xl font-bold ${theme.text}`}>{value}</p>
            {change !== null && change !== undefined && (
                <p className={`text-sm mt-1 font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(1)}
                </p>
            )}
            {trend && (
                <p className="text-xs text-slate-500 mt-1">
                    Tendencia: {trend}
                </p>
            )}
        </div>
    );
};

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => {
    return (
        <div className={`bg-white rounded-lg shadow px-4 pt-4 pb-2 min-w-0 ${className ?? ""}`}>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                {title}
            </h3>
            <div className="w-full min-w-0">{children}</div>
        </div>
    );
};
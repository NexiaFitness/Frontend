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

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { ClientProgress, ProgressAnalytics } from "@nexia/shared/types/progress";
import type { Client } from "@nexia/shared/types/client";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { CompactChartCard } from "@/components/ui/cards";
import { TYPOGRAPHY } from "@/utils/typography";
import { ProgressForm } from "./ProgressForm";
import { EditProgressModal } from "../modals/EditProgressModal";
import { FatigueAlertsSection } from "../fatigue/FatigueAlertsSection";
import {
    LineChart,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { LegendProps } from "recharts";

// ========================================
// TYPES
// ========================================

interface NormalizedWorkloadDataPoint {
    date: string;
    workload_score: number | null;
    recovery_need_score: number | null;
    workload_score_original?: number | null;
    recovery_need_score_original?: number | null;
}

interface WorkloadTooltipPayloadItem {
    payload?: NormalizedWorkloadDataPoint;
    value?: number;
    name?: string;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Formatea fechas para gráficos de Recharts
 * @param date - Fecha en formato string o number (timestamp)
 * @returns Fecha formateada en formato corto (día/mes)
 */
const formatDate = (date: string | number): string => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${day}/${month}`;  // Formato corto: 20/8
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

// Función de comparación personalizada para React.memo
const arePropsEqual = (
    prevProps: ClientProgressTabProps,
    nextProps: ClientProgressTabProps
): boolean => {
    return (
        prevProps.clientId === nextProps.clientId &&
        prevProps.client?.id === nextProps.client?.id &&
        prevProps.client?.updated_at === nextProps.client?.updated_at
    );
};

const ClientProgressTabComponent: React.FC<ClientProgressTabProps> = ({
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
    const chartHeight = 400;
    const minChartContainerHeight = 360;
    
    // Memoizar objetos de configuración para evitar recreaciones innecesarias
    const defaultChartMargin = useMemo(() => ({ top: 5, right: 10, left: 30, bottom: 60 }), []);
    const legendConfig: LegendProps = useMemo(() => ({
        align: "left" as const,
        wrapperStyle: { paddingTop: "15px" },
    }), []);

    // Calcular dominios dinámicos para Peso (memoizado para evitar recálculos innecesarios)
    const weightDomain = useMemo(() => {
        if (weightChartData.length === 0) return [0, 150];
        const weights = weightChartData.map(d => d.weight).filter((w): w is number => w !== null && w !== undefined);
        if (weights.length === 0) return [0, 150];
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        return [
            Math.floor(min - 10),
            Math.ceil(max + 10)
        ];
    }, [weightChartData]);

    // Calcular dominios dinámicos para IMC (memoizado para evitar recálculos innecesarios)
    const bmiDomain = useMemo(() => {
        if (bmiChartData.length === 0) return [0, 40];
        const bmis = bmiChartData.map(d => d.bmi).filter((b): b is number => b !== null && b !== undefined);
        if (bmis.length === 0) return [0, 40];
        const min = Math.min(...bmis);
        const max = Math.max(...bmis);
        return [
            Math.floor(min - 2),
            Math.ceil(max + 2)
        ];
    }, [bmiChartData]);

    // Normalizar datos de workload a escala 0-10
    const normalizedWorkloadChartData = useMemo(() => {
        if (!workloadChartData || workloadChartData.length === 0) return [];
        
        // Calcular el máximo histórico de ambos scores
        const allValues = workloadChartData
            .map(d => [d.workload_score, d.recovery_need_score])
            .flat()
            .filter((v): v is number => v !== null && v !== undefined);
        
        if (allValues.length === 0) return [];
        
        const maxValue = Math.max(...allValues);
        
        // Si el máximo es 0, retornar datos sin normalizar
        if (maxValue === 0) return workloadChartData;
        
        // Normalizar cada valor a escala 0-10
        return workloadChartData.map(d => ({
            date: d.date,
            workload_score: d.workload_score !== null && d.workload_score !== undefined
                ? (d.workload_score / maxValue) * 10
                : null,
            recovery_need_score: d.recovery_need_score !== null && d.recovery_need_score !== undefined
                ? (d.recovery_need_score / maxValue) * 10
                : null,
            // Guardar valores originales para el tooltip
            workload_score_original: d.workload_score,
            recovery_need_score_original: d.recovery_need_score,
        }));
    }, [workloadChartData]);

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

    // Handlers para edición (memoizados para evitar recreaciones innecesarias)
    const handleEditClick = useCallback((record: ClientProgress) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setEditModalOpen(false);
        setSelectedRecord(null);
    }, []);

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
                                <CompactChartCard title="Evolución del Peso">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={weightChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={weightDomain}
                                                        label={{
                                                            value: "Peso (kg)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="weight"
                                                        stroke="#4A67B3"
                                                        name="Peso (kg)"
                                                        strokeWidth={2}
                                                        dot={{ r: 4, fill: "#4A67B3" }}
                                                        isAnimationActive={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}

                            {bmiChartData.length > 0 && (
                                <CompactChartCard title="Evolución del IMC">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <LineChart data={bmiChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={bmiDomain}
                                                        label={{
                                                            value: "IMC",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="bmi"
                                                        stroke="#4A67B3"
                                                        name="IMC"
                                                        strokeWidth={2}
                                                        dot={{ r: 4, fill: "#4A67B3" }}
                                                        isAnimationActive={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasFatigueEnergyCharts && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {fatigueChartData.length > 0 && (
                                <CompactChartCard title="Análisis de Fatiga">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <ComposedChart data={fatigueChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        label={{
                                                            value: "Nivel de Fatiga (0-10)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_fatigue"
                                                        stroke="#4A67B3"
                                                        fill="#4A67B3"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Fatiga Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_fatigue"
                                                        stroke="#ef4444"
                                                        fill="#ef4444"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Fatiga Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}

                            {energyChartData.length > 0 && (
                                <CompactChartCard title="Niveles de Energía">
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ minHeight: `${minChartContainerHeight}px` }}
                                    >
                                        <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                            <ResponsiveContainer width="100%" height={chartHeight}>
                                                <ComposedChart data={energyChartData} margin={defaultChartMargin}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        tickFormatter={formatDate}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                        label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        label={{
                                                            value: "Nivel de Energía (0-10)",
                                                            angle: -90,
                                                            position: "left",
                                                            offset: -5,
                                                            style: { textAnchor: "middle" },
                                                        }}
                                                        style={{ fontSize: '12px', fill: '#6b7280' }}
                                                    />
                                                    <Tooltip 
                                                        labelFormatter={formatDate}
                                                        contentStyle={{ 
                                                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend {...legendConfig} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_energy"
                                                        stroke="#4A67B3"
                                                        fill="#4A67B3"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Energía Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_energy"
                                                        stroke="#ef4444"
                                                        fill="#ef4444"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Energía Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </CompactChartCard>
                            )}
                        </div>
                    )}

                    {!isNotFoundError && hasWorkloadChart && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CompactChartCard title="Carga de Trabajo y Recuperación" className="lg:col-span-2">
                                <div
                                    className="w-full flex items-center justify-center"
                                    style={{ minHeight: `${minChartContainerHeight}px` }}
                                >
                                    <div className="w-full" style={{ minHeight: `${minChartContainerHeight}px` }}>
                                        <ResponsiveContainer width="100%" height={chartHeight}>
                                            <ComposedChart data={normalizedWorkloadChartData} margin={defaultChartMargin}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={formatDate}
                                                    style={{ fontSize: '12px', fill: '#6b7280' }}
                                                    label={{ value: "Fecha de medición", position: "insideBottom", offset: -5 }}
                                                />
                                                <YAxis
                                                    domain={[0, 10]}
                                                    label={{
                                                        value: "Índice de Carga (0-10)",
                                                        angle: -90,
                                                        position: "left",
                                                        offset: -5,
                                                        style: { textAnchor: "middle" },
                                                    }}
                                                    style={{ fontSize: '12px', fill: '#6b7280' }}
                                                />
                                                <Tooltip 
                                                    labelFormatter={formatDate}
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    formatter={(value: number, name: string, props?: WorkloadTooltipPayloadItem) => {
                                                        if (!props?.payload) {
                                                            return [`${value.toFixed(1)}/10`, name];
                                                        }
                                                        
                                                        const payload = props.payload;
                                                        const originalValue = name === "Carga de Trabajo" 
                                                            ? payload.workload_score_original
                                                            : payload.recovery_need_score_original;
                                                        
                                                        return [
                                                            `${value.toFixed(1)}/10 (${originalValue?.toFixed(1) ?? 'N/A'})`,
                                                            name
                                                        ];
                                                    }}
                                                />
                                                <Legend {...legendConfig} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="workload_score"
                                                    stroke="#4A67B3"
                                                    fill="#4A67B3"
                                                    fillOpacity={0.08}
                                                    strokeWidth={2}
                                                    name="Carga de Trabajo"
                                                    isAnimationActive={false}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="recovery_need_score"
                                                    stroke="#ef4444"
                                                    fill="#ef4444"
                                                    fillOpacity={0.06}
                                                    strokeWidth={2}
                                                    name="Necesidad de Recuperación"
                                                    isAnimationActive={false}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CompactChartCard>
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

// Exportar componente memoizado para evitar re-renders innecesarios
export const ClientProgressTab = React.memo(ClientProgressTabComponent, arePropsEqual);

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

const SummaryCardComponent: React.FC<SummaryCardProps> = ({
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

// Memoizar SummaryCard para evitar re-renders innecesarios
const SummaryCard = React.memo(SummaryCardComponent);
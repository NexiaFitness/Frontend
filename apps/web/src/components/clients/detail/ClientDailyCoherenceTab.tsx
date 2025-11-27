/**
 * ClientDailyCoherenceTab.tsx — Tab Daily Coherence del cliente
 *
 * Contexto:
 * - Muestra métricas de coherencia diaria (adherence, sRPE, monotony, strain)
 * - Gráficos de evolución y análisis
 * - Consume datos reales del backend mediante RTK Query
 * - Basado en Figma Profile Page V2
 *
 * Responsabilidades:
 * - Visualizar adherence percentage
 * - Comparar prescribed vs perceived intensity
 * - Monitorear monotony y strain por semana
 * - Mostrar summary y recomendaciones
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.4.1 - Corregidas dimensiones de gráficos y tipos TypeScript
 */

import React, { useState } from "react";
import { useCoherence } from "@nexia/shared";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import type {
    MetricCardProps,
    ChartCardProps,
    MonotonyWeekData,
    StrainWeekData,
    MetricCardColor,
} from "@nexia/shared/types/coherence";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    LineChart,
    Line,
    Bar,
    Scatter,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    ReferenceLine,
} from "recharts";

interface ClientDailyCoherenceTabProps {
    clientId: number;
}

// ========================================
// COMPONENTES HELPER
// ========================================

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    color = "blue",
}) => {
    const colorClasses: Record<MetricCardColor, string> = {
        blue: "bg-blue-50 border-blue-200 text-blue-800",
        green: "bg-green-50 border-green-200 text-green-800",
        orange: "bg-orange-50 border-orange-200 text-orange-800",
        red: "bg-red-50 border-red-200 text-red-800",
    };

    const selectedColor: MetricCardColor = color || "blue";

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[selectedColor]}`}>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
        </div>
    );
};

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
    return (
        <div className="bg-white rounded-lg shadow px-4 pt-4 pb-2 min-w-0">
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-6`}>{title}</h3>
            <div className="w-full min-w-0">
    {children}
</div>
        </div>
    );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

type PeriodType = "week" | "month" | "training_block";

export const ClientDailyCoherenceTab: React.FC<ClientDailyCoherenceTabProps> = ({ clientId }) => {
    const [periodType, setPeriodType] = useState<PeriodType>("week");
    const {
        data,
        adherenceData,
        scatterData,
        idealLineData,
        colors,
        isLoading,
        isError,
    } = useCoherence(clientId, undefined, undefined, undefined, periodType);

    const [summary, setSummary] = useState<string>(data.summary || "");

    // Actualizar summary cuando cambien los datos
    React.useEffect(() => {
        if (data.summary) {
            setSummary(data.summary);
        }
    }, [data.summary]);

    const chartHeight = 400;
    const minChartHeight = 360;

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    Error al cargar los datos de coherencia. Por favor, intenta de nuevo.
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header con botón Export PDF */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className={TYPOGRAPHY.sectionTitle}>Coherencia Diaria</h2>
                    <p className="text-slate-600 mt-2">
                        Análisis de adherencia, percepción de esfuerzo y carga de entrenamiento
                    </p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Exportar PDF
                </button>
            </div>

            {/* Sub-tabs: Week, Month, Training Block */}
            <nav aria-label="Period tabs" className="flex gap-1 border-b border-gray-200">
                {[
                    { id: "week" as PeriodType, label: "Semana" },
                    { id: "month" as PeriodType, label: "Mes" },
                    { id: "training_block" as PeriodType, label: "Bloque de Entrenamiento" },
                ].map((tab) => {
                    const isActive = periodType === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setPeriodType(tab.id)}
                            className={`
                                relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[120px] text-center
                                ${isActive
                                    ? "text-[#4A67B3]"
                                    : "text-gray-500 hover:text-gray-700"
                                }
                                cursor-pointer
                            `}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {/* Cards de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Adherencia"
                    value={`${data.adherence_percentage}%`}
                    subtitle={`${data.sessions_completed}/${data.sessions_total} sesiones`}
                    color="blue"
                />
                <MetricCard
                    title="sRPE Promedio"
                    value={data.average_srpe.toFixed(1)}
                    subtitle="Escala 1-10"
                    color="green"
                />
                <MetricCard
                    title="Monotonía"
                    value={data.monotony.toFixed(1)}
                    subtitle={data.monotony > 2.0 ? "⚠️ Alta" : "Normal"}
                    color={data.monotony > 2.0 ? "orange" : "green"}
                />
                <MetricCard
                    title="Carga"
                    value={data.strain}
                    subtitle="Carga acumulada"
                    color="blue"
                />
            </div>

            {/* Gráficos en 2 columnas: Adherence Overview y Scatter Plot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 1: Adherence Overview (Donut Chart con texto en el centro) */}
                <ChartCard title="Adherencia - Sesiones Completadas">
                    <div className="w-full flex items-center justify-center" style={{ minHeight: `${minChartHeight}px` }}>
                        <div className="relative w-full" style={{ height: `${chartHeight}px`, minHeight: `${chartHeight}px` }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adherenceData as Array<{ name: string; value: number; [key: string]: string | number }>}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        labelLine={false}
                                        label={false}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {adherenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-4xl font-bold text-gray-900">
                                    {data.adherence_percentage.toFixed(0)}%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {data.sessions_completed}/{data.sessions_total} sesiones
                                </div>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                {/* Gráfico 2: Prescribed vs Perceived Intensity (Scatter Plot) */}
                {scatterData && scatterData.length > 0 && (
                    <ChartCard title="Intensidad Prescrita vs Percibida">
                        <div className="w-full flex items-center justify-center" style={{ minHeight: `${minChartHeight}px` }}>
                            <div className="w-full" style={{ minHeight: `${minChartHeight}px` }}>
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <ComposedChart margin={{ top: 5, right: 10, left: 30, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="Prescrita"
                                            domain={[0, 10]}
                                            label={{ value: "Intensidad Prescrita (RPE)", position: "insideBottom", offset: -5 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="Percibida"
                                            domain={[0, 10]}
                                            label={{ value: "Intensidad Percibida (RPE)", angle: -90, position: "left", offset: -5, style: { textAnchor: "middle" } }}
                                        />
                                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                        <Legend wrapperStyle={{ paddingTop: "15px" }} align="left" />
                                        {/* Línea de referencia y=x (ideal) */}
                                        <Line
                                            type="linear"
                                            dataKey="y"
                                            data={idealLineData}
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Ideal (y=x)"
                                            isAnimationActive={false}
                                        />
                                        <Scatter name="Sesiones" data={scatterData} fill="#4A67B3">
                                            {scatterData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={colors[0]} />
                                            ))}
                                        </Scatter>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ChartCard>
                )}
            </div>

            {/* Gráficos en 2 columnas: Monotony y Strain & Load */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 3: Monotony (Line Chart) */}
                <ChartCard title="Monotonía">
                    {data.monotony_by_week && data.monotony_by_week.length > 0 ? (
                        <div className="w-full flex items-center justify-center" style={{ minHeight: `${minChartHeight}px` }}>
                            <div className="w-full" style={{ minHeight: `${minChartHeight}px` }}>
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <LineChart
                                        data={data.monotony_by_week}
                                        margin={{ top: 5, right: 10, left: 30, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="week"
                                            label={{ value: "Semana", position: "insideBottom", offset: -5 }}
                                        />
                                        <YAxis
                                            domain={[0, "dataMax + 1"]}
                                            label={{ value: "Monotonía", angle: -90, position: "left", offset: -5, style: { textAnchor: "middle" } }}
                                        />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ paddingTop: "15px" }} align="left" />
                                        <Line
                                            type="monotone"
                                            dataKey="monotony"
                                            stroke="#4A67B3"
                                            strokeWidth={3}
                                            name="Monotonía"
                                            dot={{ r: 6, fill: "#4A67B3" }}
                                            isAnimationActive={false}
                                            connectNulls={false}
                                        />
                                        <ReferenceLine
                                            y={2.0}
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            label={{ value: "Umbral (2.0)", position: "right" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex items-center justify-center w-full min-w-0 text-gray-500"
                            style={{ minHeight: `${minChartHeight}px` }}
                        >
                            No hay datos de monotonía disponibles
                        </div>
                    )}
                </ChartCard>

                {/* Gráfico 4: Strain & Load (Bar + Line Chart) */}
                <ChartCard title="Carga y Volumen">
                    {data.strain_by_week && data.strain_by_week.length > 0 ? (() => {
                        // ✅ FIX: Usar 'strain' en lugar de 'cumulative_strain'
                        const maxLoad = Math.max(...data.strain_by_week.map(d => d.load || 0));
                        const maxStrain = Math.max(...data.strain_by_week.map(d => d.strain || 0));
                        const maxValue = Math.max(maxLoad, maxStrain);
                        
                        // Normalizar datos a escala 0-1000
                        const normalizedData = data.strain_by_week.map(d => ({
                            week: d.week,
                            load: maxValue > 0 ? (d.load / maxValue) * 1000 : 0,
                            strain: maxValue > 0 ? (d.strain / maxValue) * 1000 : 0,
                        }));
                        
                        return (
                            <div className="w-full flex items-center justify-center" style={{ minHeight: `${minChartHeight}px` }}>
                                <div className="w-full" style={{ minHeight: `${minChartHeight}px` }}>
                                    <ResponsiveContainer width="100%" height={chartHeight}>
                                        <ComposedChart
                                            data={normalizedData}
                                            margin={{ top: 5, right: 10, left: 30, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="week"
                                                label={{ value: "Semana", position: "insideBottom", offset: -5 }}
                                            />
                                            <YAxis
                                                domain={[0, 1000]}
                                                label={{ value: "Carga de Entrenamiento / Carga", angle: -90, position: "left", offset: -5, style: { textAnchor: "middle" } }}
                                            />
                                            <Tooltip />
                                            <Legend wrapperStyle={{ paddingTop: "15px" }} align="left" />
                                            <Bar dataKey="load" fill="#94a3b8" name="Volumen" />
                                            <Line
                                                type="monotone"
                                                dataKey="strain"
                                                stroke="#4A67B3"
                                                strokeWidth={3}
                                                name="Carga Acumulada"
                                                dot={{ r: 6, fill: "#4A67B3" }}
                                                isAnimationActive={false}
                                                connectNulls={false}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })() : (
                        <div
                            className="flex items-center justify-center w-full min-w-0 text-gray-500"
                            style={{ minHeight: `${minChartHeight}px` }}
                        >
                            No hay datos de carga y volumen disponibles
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Summary interpretativo (editable) con botón Edit */}
            <div className="bg-white rounded-lg shadow px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`${TYPOGRAPHY.cardTitle}`}>Resumen Interpretativo</h3>
                    <button className="px-4 py-2 text-sm font-semibold text-[#4A67B3] border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        Editar
                    </button>
                </div>

                <div className="space-y-5">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {summary || "Sin información disponible."}
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full">
                        <div className="text-xs font-semibold text-slate-500 tracking-wide mb-3">
                            RECOMENDACIONES PRINCIPALES
                        </div>
                        <ul className="space-y-3">
                            {data.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span className="text-slate-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
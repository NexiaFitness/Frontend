/**
 * ClientDailyCoherenceTab.tsx — Tab Daily Coherence del cliente
 *
 * Contexto:
 * - Muestra métricas de coherencia diaria (adherence, sRPE, monotony, strain)
 * - Gráficos de evolución y análisis
 * - Datos mockeados temporalmente (endpoint en desarrollo)
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
 */

import React, { useState } from "react";
import { useCoherence } from "@nexia/shared";
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
    BarChart,
    Bar,
    ScatterChart,
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
    Area,
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
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-4`}>{title}</h3>
            {children}
        </div>
    );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export const ClientDailyCoherenceTab: React.FC<ClientDailyCoherenceTabProps> = ({ clientId }) => {
    const {
        data,
        adherenceData,
        scatterData,
        idealLineData,
        monotonyThresholdData,
        colors,
    } = useCoherence(clientId);

    const [summary, setSummary] = useState<string>(data.summary);

    return (
        <div className="p-6 space-y-6">
            {/* Banner de datos de prueba */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Datos de prueba - Endpoint en desarrollo
                        </p>
                        <p className="mt-1 text-sm text-yellow-700">
                            Esta vista muestra datos mockeados. El endpoint GET /clients/{clientId}/coherence está en desarrollo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div>
                <h2 className={TYPOGRAPHY.sectionTitle}>Coherencia Diaria</h2>
                <p className="text-slate-600 mt-2">
                    Análisis de adherencia, percepción de esfuerzo y carga de entrenamiento
                </p>
            </div>

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

            {/* Gráfico 1: Adherence Overview (Donut Chart) */}
            <ChartCard title="Adherencia - Sesiones Completadas">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={adherenceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {adherenceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Gráfico 2: Prescribed vs Perceived Intensity (Scatter Plot) */}
            <ChartCard title="Intensidad Prescrita vs Percibida">
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
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
                            label={{ value: "Intensidad Percibida (RPE)", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend />
                        <Scatter name="Sesiones" data={scatterData} fill="#4A67B3">
                            {scatterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[0]} />
                            ))}
                        </Scatter>
                        {/* Línea de referencia y=x (ideal) */}
                        <Line
                            type="monotone"
                            dataKey="x"
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            dot={false}
                            legendType="line"
                            name="Ideal (y=x)"
                            data={idealLineData}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Gráfico 3: Monotony por Semana (Line Chart con zona roja) */}
            <ChartCard title="Monotonía por Semana">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data.monotony_by_week as MonotonyWeekData[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                        <YAxis domain={[0, 3]} label={{ value: "Monotonía", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        {/* Zona de riesgo (monotony > 2.0) - área sombreada */}
                        <Area
                            type="monotone"
                            dataKey="monotony"
                            stroke="none"
                            fill="#ef4444"
                            fillOpacity={0.1}
                            name="Zona de riesgo (>2.0)"
                            data={monotonyThresholdData}
                            stackId="threshold"
                        />
                        <Line
                            type="monotone"
                            dataKey="monotony"
                            stroke="#4A67B3"
                            strokeWidth={3}
                            name="Monotonía"
                            dot={{ r: 6 }}
                        />
                        {/* Línea de referencia en 2.0 */}
                        <Line
                            type="monotone"
                            dataKey="monotony"
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                            name="Umbral (2.0)"
                            data={monotonyThresholdData}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Gráfico 4: Strain & Load (Dual Line + Bar Chart) */}
            <ChartCard title="Carga y Volumen por Semana">
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data.strain_by_week as StrainWeekData[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                        <YAxis yAxisId="left" label={{ value: "Volumen", angle: -90, position: "insideLeft" }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: "Carga", angle: 90, position: "insideRight" }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="load" fill="#94a3b8" name="Volumen" />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="strain"
                            stroke="#4A67B3"
                            strokeWidth={3}
                            name="Carga"
                            dot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Summary interpretativo (editable) */}
            <ChartCard title="Resumen Interpretativo">
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    placeholder="Escribe un resumen interpretativo de los datos..."
                />
            </ChartCard>

            {/* Key Recommendations */}
            <ChartCard title="Recomendaciones Principales">
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
            </ChartCard>
        </div>
    );
};

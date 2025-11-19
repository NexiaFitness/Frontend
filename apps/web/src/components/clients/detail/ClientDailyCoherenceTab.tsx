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
 * @updated v5.4.0 - Reemplazado mock por datos reales del backend
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
        colors,
        isLoading,
        isError,
    } = useCoherence(clientId);

    const [summary, setSummary] = useState<string>(data.summary || "");

    // Actualizar summary cuando cambien los datos
    React.useEffect(() => {
        if (data.summary) {
            setSummary(data.summary);
        }
    }, [data.summary]);

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
                            data={adherenceData as Array<{ name: string; value: number; [key: string]: string | number }>}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: { name?: string; percent?: number; value?: number }) => {
                                const percent = entry.percent || 0;
                                const name = entry.name || '';
                                return `${name}: ${(percent * 100).toFixed(0)}%`;
                            }}
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
            {scatterData && scatterData.length > 0 && (
                <ChartCard title="Intensidad Prescrita vs Percibida">
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Prescrita"
                            domain={[0, 10]}
                            label={{ value: "Intensidad Prescrita (RPE)", position: "insideBottom", offset: -10 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Percibida"
                            domain={[0, 10]}
                            label={{ value: "Intensidad Percibida (RPE)", angle: -90, position: "left", offset: 10, style: { textAnchor: "middle" } }}
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} align="left" />
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
            </ChartCard>
            )}

            {/* Gráfico 3: Monotony por Semana (Line Chart con zona roja) */}
            {data.monotony_by_week && data.monotony_by_week.length > 0 && (() => {
                // Filtrar y normalizar datos de monotony
                // Aceptar valores hasta 999 (que significa alta monotonía) pero limitarlos a 10 para visualización
                const validData = data.monotony_by_week
                    .filter(w => {
                        const val = w.monotony;
                        return val !== null && val !== undefined && !isNaN(val) && isFinite(val);
                    })
                    .map((w, index) => ({
                        week: w.week || `W${index + 1}`,
                        monotony: typeof w.monotony === 'number' && w.monotony > 10 ? 10 : (w.monotony || 0),
                        threshold: 2.0 // Línea de umbral constante
                    }));
                
                if (validData.length === 0) {
                    console.warn('No valid monotony data after processing');
                    return null;
                }
                
                // Calcular dominio Y dinámico basado en los datos
                const maxMonotony = Math.max(...validData.map(d => d.monotony || 0), 2.0);
                const yDomain = [0, Math.max(10, Math.ceil(maxMonotony * 1.2))];
                
                return (
                    <ChartCard title="Monotonía por Semana">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart 
                                data={validData as MonotonyWeekData[]} 
                                margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                            <YAxis 
                                domain={yDomain}
                                label={{ value: "Monotonía", angle: -90, position: "left", offset: 10, style: { textAnchor: "middle" } }} 
                            />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} align="left" />
                            {/* Línea principal de Monotonía */}
                            <Line
                                type="monotone"
                                dataKey="monotony"
                                stroke="#4A67B3"
                                strokeWidth={3}
                                name="Monotonía"
                                dot={{ r: 6 }}
                                isAnimationActive={false}
                                connectNulls={false}
                            />
                            {/* Línea de referencia en 2.0 (umbral) */}
                            <ReferenceLine 
                                y={2.0} 
                                stroke="#ef4444" 
                                strokeDasharray="5 5" 
                                strokeWidth={2}
                                label={{ value: "Umbral (2.0)", position: "right" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
                );
            })()}

            {/* Gráfico 4: Strain & Load (Dual Line + Bar Chart) */}
            {data.strain_by_week && data.strain_by_week.length > 0 && (() => {
                // Filtrar y procesar datos válidos
                const validData = data.strain_by_week
                    .filter(w => {
                        const loadValid = w.load !== null && w.load !== undefined && !isNaN(w.load) && isFinite(w.load);
                        const strainValid = w.strain !== null && w.strain !== undefined && !isNaN(w.strain) && isFinite(w.strain);
                        return loadValid && strainValid;
                    })
                    .map((w, index) => ({
                        week: w.week || `W${index + 1}`,
                        load: typeof w.load === 'number' ? w.load : 0,
                        strain: typeof w.strain === 'number' ? w.strain : 0,
                    }));
                
                if (validData.length === 0) {
                    console.warn('No valid strain data after processing');
                    return null;
                }
                
                // Calcular dominios Y dinámicos basados en los datos
                const maxLoad = Math.max(...validData.map(d => d.load || 0));
                const maxStrain = Math.max(...validData.map(d => d.strain || 0));
                const loadDomain = [0, maxLoad > 0 ? Math.ceil(maxLoad * 1.1) : 1000];
                const strainDomain = [0, maxStrain > 0 ? Math.ceil(maxStrain * 1.1) : 4000];
                
                return (
                    <ChartCard title="Carga y Volumen por Semana">
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={validData as StrainWeekData[]} margin={{ top: 20, right: 60, left: 60, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: "Semana", position: "insideBottom", offset: -5 }} />
                        <YAxis 
                            yAxisId="left" 
                            domain={loadDomain}
                            label={{ value: "Volumen", angle: -90, position: "left", offset: 10, style: { textAnchor: "middle" } }} 
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            domain={strainDomain}
                            label={{ value: "Carga", angle: 90, position: "right", offset: 10, style: { textAnchor: "middle" } }} 
                        />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} align="left" />
                        <Bar yAxisId="left" dataKey="load" fill="#94a3b8" name="Volumen" />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="strain"
                            stroke="#4A67B3"
                            strokeWidth={3}
                            name="Carga"
                            dot={{ r: 6 }}
                            isAnimationActive={false}
                            connectNulls={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>
                );
            })()}

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

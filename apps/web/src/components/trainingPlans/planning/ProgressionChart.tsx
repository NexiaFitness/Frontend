/**
 * ProgressionChart.tsx — Gráfico de línea para progresión de Volume/Intensity
 *
 * Contexto:
 * - Adaptado de ProgressLineChart.tsx para trabajar con datos de Training Plan Analytics
 * - Muestra progresión de Volume e Intensity en diferentes períodos
 * - Usado en dashboards yearly/monthly/weekly
 *
 * Responsabilidades:
 * - Transformar datos según tipo (yearly/monthly/weekly)
 * - Renderizar LineChart con Volume (blue) e Intensity (amber)
 * - Mostrar tooltips y leyenda
 * - Eje Y fijo en 0-10
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type {
    MonthlyTrainingProgress,
    MonthlyWeekBreakdown,
    DailyProgressionPoint,
} from "@nexia/shared/types/trainingAnalytics";

export interface ProgressionChartProps {
    data: MonthlyTrainingProgress[] | MonthlyWeekBreakdown[] | DailyProgressionPoint[];
    type: "yearly" | "monthly" | "weekly";
    height?: number; // Default: 300
}

// Helpers para formatear labels
const getMonthName = (month: number): string => {
    const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ];
    return months[month - 1] || `M${month}`;
};

const getDayName = (day: number): string => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    return days[day - 1] || `D${day}`;
};

export const ProgressionChart: React.FC<ProgressionChartProps> = ({
    data,
    type,
    height = 300,
}) => {
    // Transformar datos según tipo
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        switch (type) {
            case "yearly": {
                const yearlyData = data as MonthlyTrainingProgress[];
                return yearlyData.map((item) => ({
                    label: getMonthName(item.month),
                    volume: item.volume_level,
                    intensity: item.intensity_level,
                }));
            }
            case "monthly": {
                const monthlyData = data as MonthlyWeekBreakdown[];
                return monthlyData.map((item) => ({
                    label: `Semana ${item.week}`,
                    volume: item.volume_level,
                    intensity: item.intensity_level,
                }));
            }
            case "weekly": {
                const weeklyData = data as DailyProgressionPoint[];
                return weeklyData.map((item) => ({
                    label: getDayName(item.day),
                    volume: item.volume_level,
                    intensity: item.intensity_level,
                }));
            }
            default:
                return [];
        }
    }, [data, type]);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
                No hay datos de progresión disponibles
            </div>
        );
    }

    // Verificar si todos los valores son 0
    const allValuesZero = chartData.every(
        (item) => (item.volume === 0 || item.volume === null || item.volume === undefined) &&
                  (item.intensity === 0 || item.intensity === null || item.intensity === undefined)
    );

    if (allValuesZero) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm font-medium mb-1">Datos de progresión no disponibles</p>
                <p className="text-xs text-slate-400 text-center max-w-md">
                    Los valores de volumen e intensidad están en 0 para todos los períodos.
                    Esto puede indicar que el plan de entrenamiento no tiene datos de carga configurados.
                </p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    stroke="#cbd5e1"
                />
                <YAxis
                    domain={[0, 10]}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    stroke="#cbd5e1"
                    label={{
                        value: "Nivel (1-10)",
                        angle: -90,
                        position: "left",
                        offset: 10,
                        fill: "#64748b",
                        style: { textAnchor: "middle" },
                    }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                    }}
                    formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}/10`,
                        name === "volume" ? "Volumen" : "Intensidad",
                    ]}
                />
                <Legend
                    formatter={(value: string) => (value === "volume" ? "Volumen" : "Intensidad")}
                />
                <Line
                    type="monotone"
                    dataKey="volume"
                    name="volume"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="intensity"
                    name="intensity"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};


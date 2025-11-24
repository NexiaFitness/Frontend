/**
 * ProgressLineChart.tsx — Line chart para progresión de tests
 * 
 * @author Frontend Team
 * @since v5.6.0
 * @updated v5.6.1 - Soporte para múltiples líneas (múltiples tests)
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
import type { CategoryTrendData } from "@nexia/shared/types/testing";

interface ProgressLineChartProps {
    trends: CategoryTrendData[]; // Array de trends para mostrar múltiples líneas
    _category: string; // No usado actualmente, pero puede ser útil para futuras mejoras
}

// Colores para diferentes líneas
const LINE_COLORS = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
];

export const ProgressLineChart: React.FC<ProgressLineChartProps> = ({
    trends,
    _category,
}) => {
    // Transformar datos para el gráfico (combinar todos los trends)
    const chartData = useMemo(() => {
        if (!trends || trends.length === 0) return [];

        // Obtener todas las fechas únicas de todos los trends (usar fecha ISO como key)
        const allDates = new Set<string>();
        const dateMap = new Map<string, Date>(); // Mapa de fecha ISO -> Date object
        
        trends.forEach((trend) => {
            trend.trend_points.forEach((point) => {
                const dateObj = new Date(point.test_date);
                const dateKey = point.test_date; // Usar fecha ISO como key
                allDates.add(dateKey);
                dateMap.set(dateKey, dateObj);
            });
        });

        // Crear estructura de datos combinada
        const combinedData: Record<string, { date: Date; values: Record<string, number> }> = {};
        allDates.forEach((dateKey) => {
            combinedData[dateKey] = {
                date: dateMap.get(dateKey)!,
                values: {},
            };
        });

        // Llenar datos de cada trend
        trends.forEach((trend) => {
            trend.trend_points.forEach((point) => {
                const dateKey = point.test_date;
                if (combinedData[dateKey]) {
                    combinedData[dateKey].values[trend.test_name] = point.value;
                }
            });
        });

        // Convertir a array y ordenar por fecha
        return Object.entries(combinedData)
            .map(([_dateKey, { date, values }]) => ({
                date: date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                }),
                dateSort: date.getTime(), // Para ordenamiento
                ...values,
            }))
            .sort((a, b) => a.dateSort - b.dateSort)
            .map(({ dateSort: _dateSort, ...rest }) => rest); // Eliminar dateSort del resultado final
    }, [trends]);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
                No hay datos de progresión disponibles
            </div>
        );
    }

    // Obtener unidad del primer trend (asumimos que todos usan la misma unidad)
    const unit = trends[0]?.trend_points[0]?.unit || "";

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    stroke="#cbd5e1"
                />
                <YAxis
                    label={{ value: unit, angle: -90, position: "insideLeft", fill: "#64748b" }}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    stroke="#cbd5e1"
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                    }}
                    formatter={(value: number, name: string) => [`${value} ${unit}`, name]}
                />
                <Legend />
                {trends.map((trend, index) => (
                    <Line
                        key={trend.test_id}
                        type="monotone"
                        dataKey={trend.test_name}
                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: LINE_COLORS[index % LINE_COLORS.length], r: 4 }}
                        activeDot={{ r: 6 }}
                        name={trend.test_name}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};


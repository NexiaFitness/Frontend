/**
 * PhysicalQualitiesPieChart.tsx — Pie Chart para distribución de cualidades físicas
 *
 * Contexto:
 * - Componente para visualizar distribución porcentual de cualidades físicas
 * - Usado en dashboards de planning analytics (yearly/monthly/weekly)
 * - Usa paleta de colores consistente con otros gráficos del proyecto
 * - Basado en diseño Figma con porcentajes DENTRO de las secciones del pie
 *
 * Responsabilidades:
 * - Renderizar Pie Chart con colores del proyecto
 * - Mostrar porcentajes DENTRO de cada sección (no en labels externos)
 * - Mostrar leyenda NO es necesaria (se muestra en PhysicalQualitiesList)
 *
 * Notas de mantenimiento:
 * - Usa SOLO colores de LINE_COLORS (mismos que ProgressLineChart)
 * - NO usar colores oscuros personalizados
 * - Los porcentajes se muestran en blanco con sombra para legibilidad
 * - Radio del pie chart: 120px (más grande que antes)
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v5.1.0 - Porcentajes dentro de secciones siguiendo Figma
 */

import React, { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import type { TrainingPlanDistributionItem } from "@nexia/shared/types/trainingAnalytics";

export interface PhysicalQualitiesPieChartProps {
    qualities: TrainingPlanDistributionItem[];
}

// PALETA DE COLORES DEL PROYECTO (misma que ProgressLineChart)
const LINE_COLORS = [
    "#3b82f6", // blue - Flexibility
    "#ef4444", // red - Hybrid
    "#10b981", // green - Aerobic
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
];

interface PieChartDataItem extends Record<string, unknown> {
    name: string;
    value: number;
    color: string;
}

export const PhysicalQualitiesPieChart: React.FC<PhysicalQualitiesPieChartProps> = ({
    qualities,
}) => {
    const chartData = useMemo<PieChartDataItem[]>(() => {
        return qualities.map((q, index) => ({
            name: q.name,
            value: q.percentage,
            color: LINE_COLORS[index % LINE_COLORS.length],
        }));
    }, [qualities]);

    // Renderizar porcentaje DENTRO de cada sección
    const renderCustomLabel = (entry: {
        cx?: string | number;
        cy?: string | number;
        midAngle?: number;
        innerRadius?: number;
        outerRadius?: number;
        percent?: number;
        index?: number;
    }) => {
        const cxNum = typeof entry.cx === "string" ? parseFloat(entry.cx) : (entry.cx ?? 0);
        const cyNum = typeof entry.cy === "string" ? parseFloat(entry.cy) : (entry.cy ?? 0);
        const midAngle = entry.midAngle ?? 0;
        const innerRadius = entry.innerRadius ?? 0;
        const outerRadius = entry.outerRadius ?? 100;
        const percent = entry.percent ?? 0;

        if (!cxNum || !cyNum || percent === 0) {
            return null;
        }

        // Ocultar porcentaje si el sector es muy pequeño (< 5%)
        const percentValue = percent * 100;
        if (percentValue < 5) {
            return null;
        }

        // Calcular tamaño de fuente según el porcentaje del sector
        let fontSize = 12; // Tamaño base más pequeño
        if (percentValue < 10) {
            fontSize = 10; // Muy pequeño para sectores pequeños
        } else if (percentValue < 20) {
            fontSize = 11; // Pequeño para sectores medianos
        }

        const RADIAN = Math.PI / 180;
        // Posicionar texto en el centro de cada sección
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cxNum + radius * Math.cos(-midAngle * RADIAN);
        const y = cyNum + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight="600"
                style={{
                    pointerEvents: "none",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)",
                }}
            >
                {`${percentValue.toFixed(0)}%`}
            </text>
        );
    };

    if (qualities.length === 0) {
        return (
            <div className="flex items-center justify-center h-[220px] text-slate-500">
                No hay datos de distribución
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};
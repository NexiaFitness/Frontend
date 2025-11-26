/**
 * PhysicalQualitiesRadarChart.tsx — Gráfico de radar para distribución de cualidades físicas
 *
 * Contexto:
 * - Adaptado de RadarChart.tsx para trabajar con TrainingPlanDistributionItem[]
 * - Usado en dashboards de planning analytics (yearly/monthly)
 * - Muestra distribución porcentual de cualidades físicas en el plan
 *
 * Responsabilidades:
 * - Transformar TrainingPlanDistributionItem[] a formato Recharts
 * - Renderizar gráfico de radar con colores del proyecto
 * - Mostrar total de porcentajes
 * - Opcional: botón para agregar cualidad
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useMemo } from "react";
import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import type { TrainingPlanDistributionItem } from "@nexia/shared/types/trainingAnalytics";
import { Button } from "@/components/ui/buttons";

export interface PhysicalQualitiesRadarChartProps {
    qualities: TrainingPlanDistributionItem[];
    showAddButton?: boolean;
    onAddQuality?: () => void;
}

export const PhysicalQualitiesRadarChart: React.FC<PhysicalQualitiesRadarChartProps> = ({
    qualities,
    showAddButton = false,
    onAddQuality,
}) => {
    // Transformar datos a formato Recharts
    const chartData = useMemo(() => {
        return qualities.map((q) => ({
            subject: q.name,
            value: q.percentage,
            fullMark: 100,
        }));
    }, [qualities]);

    // Calcular total de porcentajes
    const totalPercentage = useMemo(() => {
        return qualities.reduce((sum, q) => sum + q.percentage, 0);
    }, [qualities]);

    const renderAngleTick = (props: unknown) => {
        const tickProps = props as {
            payload?: { value: string };
            cx?: number | string;
            cy?: number | string;
            x?: number | string;
            y?: number | string;
            textAnchor?: "start" | "end" | "middle" | "inherit";
        };

        const { payload, cx = 0, cy = 0, x = 0, y = 0, textAnchor = "middle" } = tickProps;
        const cxNum = typeof cx === "string" ? parseFloat(cx) : (cx || 0);
        const cyNum = typeof cy === "string" ? parseFloat(cy) : (cy || 0);
        const xNum = typeof x === "string" ? parseFloat(x) : (x || 0);
        const yNum = typeof y === "string" ? parseFloat(y) : (y || 0);

        const OFFSET = 14;
        const angle = Math.atan2(yNum - cyNum, xNum - cxNum);
        const newX = xNum + Math.cos(angle) * OFFSET;
        const newY = yNum + Math.sin(angle) * OFFSET;

        return (
            <text
                x={newX}
                y={newY}
                fill="#64748b"
                fontSize={12}
                fontWeight={500}
                textAnchor={textAnchor}
            >
                {payload?.value}
            </text>
        );
    };

    if (qualities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <p className="mb-4">No hay cualidades físicas definidas</p>
                {showAddButton && onAddQuality && (
                    <Button variant="outline" size="sm" onClick={onAddQuality}>
                        + Agregar Cualidad
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
                <RechartsRadarChart data={chartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={renderAngleTick} />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#94a3b8", fontSize: 10, dx: 6 }}
                    />
                    <Radar
                        name="Distribución"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        strokeWidth={2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "8px 12px",
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Porcentaje"]}
                    />
                </RechartsRadarChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                    Total: <span className="font-semibold">{totalPercentage.toFixed(1)}%</span>
                </p>
                {showAddButton && onAddQuality && (
                    <Button variant="outline" size="sm" onClick={onAddQuality}>
                        + Agregar Cualidad
                    </Button>
                )}
            </div>
        </div>
    );
};


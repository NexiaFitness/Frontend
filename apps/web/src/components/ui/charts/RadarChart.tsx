/**
 * RadarChart.tsx — Gráfico de radar para Physical Qualities Profile
 * 
 * @author Frontend Team
 * @since v5.6.0
 */

import React from "react";
import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import type { PhysicalQualityProfile } from "@nexia/shared/types/testing";

interface RadarChartProps {
    data: PhysicalQualityProfile;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
    // Transformar data a formato de Recharts
    const chartData = [
        { quality: "Fuerza", value: data.strength, fullMark: 100 },
        { quality: "Potencia", value: data.power, fullMark: 100 },
        { quality: "Velocidad", value: data.speed, fullMark: 100 },
        { quality: "Aeróbico", value: data.aerobic, fullMark: 100 },
        { quality: "Anaeróbico", value: data.anaerobic, fullMark: 100 },
        { quality: "Movilidad", value: data.mobility, fullMark: 100 },
    ];

    const renderAngleTick = (props: unknown) => {
        // Type assertion para acceder a las propiedades de Recharts
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

    return (
        <ResponsiveContainer width="100%" height={400}>
            <RechartsRadarChart data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="quality" tick={renderAngleTick} />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10, dx: 6 }}
                />
                <Radar
                    name="Perfil"
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
                    formatter={(value: number) => [`${value.toFixed(1)}/100`, "Score"]}
                />
            </RechartsRadarChart>
        </ResponsiveContainer>
    );
};


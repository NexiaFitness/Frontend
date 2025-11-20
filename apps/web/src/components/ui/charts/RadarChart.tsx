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

    return (
        <ResponsiveContainer width="100%" height={400}>
            <RechartsRadarChart data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                    dataKey="quality"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
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


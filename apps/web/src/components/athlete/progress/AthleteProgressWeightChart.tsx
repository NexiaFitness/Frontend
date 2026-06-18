/**
 * AthleteProgressWeightChart.tsx — Evolución peso premium (area + line).
 */

import React, { useId, useMemo } from "react";
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    ATHLETE_CHART_AXIS,
    ATHLETE_CHART_GRID_STROKE,
    ATHLETE_PROGRESS_CHART_HEIGHT,
} from "./athleteProgressViewPresentation";
import { AthleteProgressChartPanel } from "./AthleteProgressChartPanel";
import { AthleteProgressChartTooltip } from "./AthleteProgressChartTooltip";

export interface AthleteProgressWeightChartProps {
    data: Array<{ date: string; weight: number | null }>;
}

export const AthleteProgressWeightChart: React.FC<AthleteProgressWeightChartProps> = ({
    data,
}) => {
    const areaGradientId = useId().replace(/:/g, "");
    const points = useMemo(
        () => data.filter((p) => p.weight != null),
        [data]
    );

    const yDomain = useMemo(() => {
        if (points.length === 0) return [0, 100];
        const weights = points.map((p) => p.weight as number);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const pad = Math.max(2, (max - min) * 0.15);
        return [Math.floor(min - pad), Math.ceil(max + pad)];
    }, [points]);

    return (
        <AthleteProgressChartPanel
            label="Composición"
            title="Evolución de peso"
            subtitle="Registros que introduce tu entrenador en revisiones"
            isEmpty={points.length < 2}
            emptyMessage="Aún no hay suficientes mediciones de peso. Tu entrenador las añadirá en las revisiones periódicas."
        >
            {points.length >= 2 && (
                <ResponsiveContainer width="100%" height={ATHLETE_PROGRESS_CHART_HEIGHT}>
                    <ComposedChart
                        data={points}
                        margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            stroke={ATHLETE_CHART_GRID_STROKE}
                            strokeDasharray="4 6"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={ATHLETE_CHART_AXIS.tick}
                            tickFormatter={(v) => String(v).slice(5)}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={ATHLETE_CHART_AXIS.tick}
                            width={40}
                            unit=" kg"
                            domain={yDomain}
                        />
                        <Tooltip
                            content={({ active, label, payload }) => (
                                <AthleteProgressChartTooltip
                                    active={active}
                                    label={formatAthleteDateLong(String(label ?? ""))}
                                    value={`${payload?.[0]?.value ?? "—"} kg`}
                                    valueLabel="Peso corporal"
                                />
                            )}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="none"
                            fill={`url(#${areaGradientId})`}
                        />
                        <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={{
                                r: 4,
                                fill: "hsl(var(--primary))",
                                stroke: "hsl(var(--background))",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "hsl(var(--primary))",
                                stroke: "hsl(var(--background))",
                                strokeWidth: 2,
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </AthleteProgressChartPanel>
    );
};

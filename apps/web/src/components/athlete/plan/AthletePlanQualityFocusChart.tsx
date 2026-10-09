/**
 * AthletePlanQualityFocusChart.tsx — Distribución mensual por cualidad (Recharts, estilo progreso).
 */

import React, { useId, useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { AthleteProgressChartPanel } from "@/components/athlete/progress/AthleteProgressChartPanel";
import { AthleteProgressChartTooltip } from "@/components/athlete/progress/AthleteProgressChartTooltip";
import {
    ATHLETE_CHART_AXIS,
    ATHLETE_CHART_GRID_STROKE,
    ATHLETE_CHART_MARGIN,
    ATHLETE_PROGRESS_CHART_HEIGHT,
    athleteChartBarGradientId,
} from "@/components/athlete/progress/athleteProgressViewPresentation";
import {
    ATHLETE_PLAN_QUALITY_LEGEND,
    ATHLETE_PLAN_QUALITY_LEGEND_DOT,
    ATHLETE_PLAN_QUALITY_LEGEND_ITEM,
    ATHLETE_PLAN_QUALITY_LEGEND_NAME,
    ATHLETE_PLAN_QUALITY_LEGEND_PCT,
} from "./athletePlanQualityPresentation";

export interface AthletePlanQualityChartItem {
    key: string;
    label: string;
    shortLabel: string;
    percentage: number;
    colorHex: string;
}

export interface AthletePlanQualityFocusChartProps {
    items: AthletePlanQualityChartItem[];
}

function shortAxisLabel(label: string, maxLen = 11): string {
    if (label.length <= maxLen) return label;
    return `${label.slice(0, maxLen - 1)}…`;
}

export const AthletePlanQualityFocusChart: React.FC<AthletePlanQualityFocusChartProps> = ({
    items,
}) => {
    const gradientBase = useId().replace(/:/g, "");

    const chartData = useMemo(
        () =>
            items.map((item) => ({
                ...item,
                shortLabel: item.shortLabel || shortAxisLabel(item.label),
            })),
        [items]
    );

    const maxPercentage = useMemo(
        () => Math.max(...chartData.map((d) => d.percentage), 1),
        [chartData]
    );

    if (chartData.length === 0) return null;

    return (
        <AthleteProgressChartPanel
            label="Enfoque del mes"
            title="Distribución por cualidad"
            subtitle="Porcentaje de días del mes con cada cualidad como foco principal."
        >
            <ResponsiveContainer width="100%" height={ATHLETE_PROGRESS_CHART_HEIGHT}>
                <BarChart data={chartData} margin={ATHLETE_CHART_MARGIN}>
                    <defs>
                        {chartData.map((entry, index) => (
                            <linearGradient
                                key={entry.key}
                                id={athleteChartBarGradientId(gradientBase, index)}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop offset="0%" stopColor={entry.colorHex} stopOpacity={0.95} />
                                <stop offset="100%" stopColor={entry.colorHex} stopOpacity={0.25} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke={ATHLETE_CHART_GRID_STROKE}
                        strokeDasharray="4 6"
                    />
                    <XAxis
                        dataKey="shortLabel"
                        axisLine={false}
                        tickLine={false}
                        tick={ATHLETE_CHART_AXIS.tick}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={ATHLETE_CHART_AXIS.tick}
                        width={40}
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        allowDecimals={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--foreground) / 0.04)" }}
                        content={({ active, payload }) => {
                            const row = payload?.[0]?.payload as AthletePlanQualityChartItem | undefined;
                            if (!row) return null;
                            return (
                                <AthleteProgressChartTooltip
                                    active={active}
                                    label={row.label}
                                    value={`${row.percentage}%`}
                                    valueLabel="Días del mes con este foco"
                                />
                            );
                        }}
                    />
                    <Bar
                        dataKey="percentage"
                        radius={[6, 6, 2, 2]}
                        maxBarSize={44}
                        minPointSize={4}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={entry.key}
                                fill={`url(#${athleteChartBarGradientId(gradientBase, index)})`}
                                fillOpacity={
                                    0.45 + (entry.percentage / maxPercentage) * 0.55
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <ul className={ATHLETE_PLAN_QUALITY_LEGEND}>
                {chartData.map((item) => (
                    <li key={item.key} className={ATHLETE_PLAN_QUALITY_LEGEND_ITEM}>
                        <span
                            className={ATHLETE_PLAN_QUALITY_LEGEND_DOT}
                            style={{ backgroundColor: item.colorHex }}
                        />
                        <span className={ATHLETE_PLAN_QUALITY_LEGEND_NAME}>{item.label}</span>
                        <span className={ATHLETE_PLAN_QUALITY_LEGEND_PCT}>{item.percentage}%</span>
                    </li>
                ))}
            </ul>
        </AthleteProgressChartPanel>
    );
};

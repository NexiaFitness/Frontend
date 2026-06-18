/**
 * AthleteProgressWeeklyChart.tsx — Actividad semanal premium (bar chart).
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
import type { WeeklyActivityBar } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import {
    ATHLETE_CHART_AXIS,
    ATHLETE_CHART_GRID_STROKE,
    ATHLETE_PROGRESS_CHART_HEIGHT,
} from "./athleteProgressViewPresentation";
import { AthleteProgressChartPanel } from "./AthleteProgressChartPanel";
import { AthleteProgressChartTooltip } from "./AthleteProgressChartTooltip";

export interface AthleteProgressWeeklyChartProps {
    data: WeeklyActivityBar[];
}

export const AthleteProgressWeeklyChart: React.FC<AthleteProgressWeeklyChartProps> = ({
    data,
}) => {
    const gradientId = useId().replace(/:/g, "");
    const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

    if (data.length === 0) return null;

    return (
        <AthleteProgressChartPanel
            label="Consistencia"
            title="Actividad semanal"
            subtitle="Sesiones completadas por semana"
        >
            <ResponsiveContainer width="100%" height={ATHLETE_PROGRESS_CHART_HEIGHT}>
                <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke={ATHLETE_CHART_GRID_STROKE}
                        strokeDasharray="4 6"
                    />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={ATHLETE_CHART_AXIS.tick} />
                    <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={ATHLETE_CHART_AXIS.tick}
                        width={28}
                        domain={[0, Math.max(maxCount + 1, 4)]}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
                        content={({ active, label, payload }) => (
                            <AthleteProgressChartTooltip
                                active={active}
                                label={String(label ?? "")}
                                value={`${payload?.[0]?.value ?? 0} sesiones`}
                                valueLabel="Completadas"
                            />
                        )}
                    />
                    <Bar dataKey="count" radius={[6, 6, 2, 2]} maxBarSize={36}>
                        {data.map((entry) => (
                            <Cell
                                key={entry.week}
                                fill={`url(#${gradientId})`}
                                fillOpacity={0.45 + (entry.count / maxCount) * 0.55}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </AthleteProgressChartPanel>
    );
};

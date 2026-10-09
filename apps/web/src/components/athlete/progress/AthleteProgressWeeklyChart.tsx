/**
 * AthleteProgressWeeklyChart.tsx — Actividad semanal premium (bar chart).
 * Contexto: semanas continuas del periodo; racha N ≥ 2 en el subtítulo.
 * @author Frontend Team
 * @since v6.1.0
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
    ATHLETE_CHART_MARGIN,
    ATHLETE_PROGRESS_CHART_HEIGHT,
} from "./athleteProgressViewPresentation";
import { AthleteProgressChartPanel } from "./AthleteProgressChartPanel";
import { AthleteProgressChartTooltip } from "./AthleteProgressChartTooltip";

export interface AthleteProgressWeeklyChartProps {
    data: WeeklyActivityBar[];
    consecutiveWeeks?: number;
}

export const AthleteProgressWeeklyChart: React.FC<AthleteProgressWeeklyChartProps> = ({
    data,
    consecutiveWeeks = 0,
}) => {
    const gradientId = useId().replace(/:/g, "");
    const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);
    const activeWeeks = data.filter((bar) => bar.count > 0).length;
    if (activeWeeks < 2) return null;

    const subtitle =
        consecutiveWeeks >= 2
            ? `${consecutiveWeeks} semanas seguidas · sesiones completadas por semana`
            : "Sesiones completadas por semana";

    return (
        <AthleteProgressChartPanel
            label="Consistencia"
            title="Actividad semanal"
            subtitle={subtitle}
        >
            <ResponsiveContainer width="100%" height={ATHLETE_PROGRESS_CHART_HEIGHT}>
                <BarChart data={data} margin={ATHLETE_CHART_MARGIN}>
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
                        width={36}
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
                                key={entry.weekKey}
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

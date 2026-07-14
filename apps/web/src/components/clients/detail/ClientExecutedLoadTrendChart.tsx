/**
 * ClientExecutedLoadTrendChart — Tonnage ejecutado por periodo (F5-FE-02).
 * DESIGN.md §5.17 — Recharts, tokens, empty/loading sin saturar.
 */

import React, { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import {
    useClientExecutedLoadTrend,
    type UseClientExecutedLoadTrendOptions,
} from "@nexia/shared/hooks/clients/useClientExecutedLoadTrend";
import { Alert } from "@/components/ui/feedback";

const CHART_GRID_STROKE = "hsl(var(--border) / 0.45)";
const CHART_AXIS_STROKE = "hsl(var(--border))";
const CHART_TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };
const CHART_MARGIN = { top: 8, right: 8, bottom: 8, left: 5 };
const CHART_HEIGHT = 250;

const CHART_TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
    boxShadow: "0 8px 30px hsl(0 0% 0% / 0.35)",
};

const PERIOD_TITLES = {
    weekly: "Tonnage semanal ejecutado",
    monthly: "Tonnage mensual ejecutado",
    annual: "Tonnage anual ejecutado",
} as const;

export type ClientExecutedLoadTrendChartProps = UseClientExecutedLoadTrendOptions;

export const ClientExecutedLoadTrendChart: React.FC<
    ClientExecutedLoadTrendChartProps
> = ({ clientId, startDate, endDate, period }) => {
    const { chartData, summary, isLoading, error, isEmpty } =
        useClientExecutedLoadTrend({ clientId, startDate, endDate, period });

    const yMax = useMemo(() => {
        if (!chartData.length) return 100;
        const peak = Math.max(...chartData.map((d) => d.tonnage_kg));
        return Math.ceil(peak * 1.15 / 50) * 50 || 100;
    }, [chartData]);

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border bg-card p-5">
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" aria-hidden />
                    <h3 className="text-sm font-semibold text-foreground">
                        {PERIOD_TITLES[period]}
                    </h3>
                </div>
                <div
                    className="flex min-h-[250px] items-center justify-center rounded-lg bg-surface-2 animate-pulse"
                    aria-busy="true"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                    {PERIOD_TITLES[period]}
                </h3>
                <Alert variant="error">
                    No se pudo cargar el tonnage ejecutado. Intenta de nuevo.
                </Alert>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-primary" aria-hidden />
                        <h3 className="text-sm font-semibold text-foreground">
                            {PERIOD_TITLES[period]}
                        </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Suma de peso × reps registradas por el atleta en sesión.
                    </p>
                </div>
                {summary && summary.sessionsCount > 0 && (
                    <div className="flex gap-4 text-right text-xs text-muted-foreground">
                        <div>
                            <p className="font-medium text-foreground">
                                {summary.tonnageTotalKg.toLocaleString("es-ES")} kg
                            </p>
                            <p>Total periodo</p>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                {summary.sessionsCount}
                            </p>
                            <p>Sesiones</p>
                        </div>
                    </div>
                )}
            </div>

            {isEmpty ? (
                <div className="flex min-h-[250px] w-full items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Sin tonnage ejecutado en este periodo. Aparecerá cuando el atleta
                        registre series con peso en sesión.
                    </p>
                </div>
            ) : (
                <div className="w-full min-w-0">
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <BarChart
                            data={chartData}
                            margin={CHART_MARGIN}
                            barCategoryGap="18%"
                        >
                            <CartesianGrid
                                stroke={CHART_GRID_STROKE}
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="label"
                                tick={CHART_TICK_STYLE}
                                axisLine={{ stroke: CHART_AXIS_STROKE }}
                                tickLine={{ stroke: CHART_AXIS_STROKE }}
                                interval={0}
                            />
                            <YAxis
                                width={44}
                                domain={[0, yMax]}
                                tick={CHART_TICK_STYLE}
                                axisLine={{ stroke: CHART_AXIS_STROKE }}
                                tickLine={{ stroke: CHART_AXIS_STROKE }}
                                tickFormatter={(v: number) =>
                                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                                }
                            />
                            <Tooltip
                                contentStyle={CHART_TOOLTIP_STYLE}
                                formatter={(value: number, _name, item) => {
                                    const sessions = item.payload?.sessions_count ?? 0;
                                    return [
                                        `${value.toLocaleString("es-ES")} kg · ${sessions} sesión${sessions === 1 ? "" : "es"}`,
                                        "Tonnage",
                                    ];
                                }}
                            />
                            <Bar
                                dataKey="tonnage_kg"
                                name="Tonnage"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={56}
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

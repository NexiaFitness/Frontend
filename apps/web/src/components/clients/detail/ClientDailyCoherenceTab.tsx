/**
 * ClientDailyCoherenceTab.tsx — Tab Daily Coherence del cliente
 *
 * Contexto:
 * - Muestra métricas de coherencia diaria (adherencia, sRPE, monotony, strain)
 * - Gráficos de evolución y análisis
 * - Consume datos reales del backend mediante RTK Query
 * - Basado en Figma Profile Page V2
 *
 * Responsabilidades:
 * - Visualizar adherence percentage
 * - Comparar prescribed vs perceived intensity
 * - Monitorear monotony y strain por semana
 * - Mostrar summary y recomendaciones
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.5.0 - Optimizado para rendimiento (componentes memoizados, configuraciones memoizadas)
 * @updated v5.6.0 - Bloque de entrenamiento: plan activo + bloque que contiene hoy → period_start/end
 */

import React, { useState, useMemo, useCallback } from "react";
import { useCoherence, useClientActiveBlock } from "@nexia/shared";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { PeriodBlockEmptyCallout } from "@/components/trainingPlans/periodization/PeriodBlockEmptyCallout";
import { PeriodBlockEmptyIconDecoration } from "@/components/trainingPlans/periodization/PeriodBlockEmptyIconDecoration";
import { periodBlockDashedShellClassName } from "@/components/trainingPlans/periodization/periodBlockEmptyCallout.styles";
import { cn } from "@/lib/utils";
import { coherenceDashboardTooltipStyle } from "@/lib/coherenceChartTheme";
import type {
    MetricCardProps,
    MetricCardColor,
    MonotonyWeekData,
    StrainWeekData,
} from "@nexia/shared/types/coherence";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    BarChart,
    Line,
    Bar,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import type { LegendProps } from "recharts";

// ========================================
// CONSTANTES (fuera del componente para evitar recreaciones)
// ========================================

const ADHERENCE_CHART_HEIGHT = 250;

/** Alineados con tokens Nexia (index.css) para coherencia con superficies y éxito. */
const ADHERENCE_COMPLETED_FILL = "hsl(var(--success))";
const ADHERENCE_LOST_FILL = "hsl(var(--border))";
const ADHERENCE_CENTER_SUBTITLE = "hsl(var(--muted-foreground))";

const ADHERENCE_SLICE_FILL: Record<string, string> = {
    Completadas: ADHERENCE_COMPLETED_FILL,
    Perdidas: ADHERENCE_LOST_FILL,
    Pendientes: ADHERENCE_LOST_FILL,
};

/** Tokens Recharts alineados con index.css (sin grises #ccc fijos). */
const CHART_GRID_STROKE = "hsl(var(--border) / 0.45)";
const CHART_AXIS_STROKE = "hsl(var(--border))";
const CHART_TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const CHART_TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
    boxShadow: "0 8px 30px hsl(0 0% 0% / 0.35)",
};

// ========================================
// COMPONENTES HELPER
// ========================================

const MetricCardComponent: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    color = "blue",
}) => {
    const colorClasses: Record<MetricCardColor, string> = {
        blue: "bg-primary/10 border-primary/30 text-primary",
        green: "bg-success/10 border-success/30 text-success",
        orange: "bg-warning/10 border-warning/30 text-warning",
        red: "bg-destructive/10 border-destructive/30 text-destructive",
    };

    const selectedColor: MetricCardColor = color || "blue";

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[selectedColor]}`}>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-xs opacity-75">{subtitle}</p>}
        </div>
    );
};

// Memoizar MetricCard para evitar re-renders innecesarios
const MetricCard = React.memo(MetricCardComponent);

// ========================================
// COMPONENTES DE GRÁFICOS MEMOIZADOS
// ========================================

interface AdherenceChartProps {
    data: Array<{ name: string; value: number }>;
    adherencePercentage: number;
    sessionsCompleted: number;
    sessionsTotal: number;
}

/** Proporciones alineadas con la referencia Recharts (outer 95 / inner 70 sobre maxRadius ≈ 125 en altura 250). */
const ADHERENCE_PIE_INNER_PCT = "56%";
const ADHERENCE_PIE_OUTER_PCT = "76%";
const ADHERENCE_PIE_CY = "47%";

const AdherenceChartComponent: React.FC<AdherenceChartProps> = ({
    data,
    adherencePercentage,
    sessionsCompleted,
    sessionsTotal,
}) => {
    const sumValues = data.reduce((acc, d) => acc + d.value, 0);
    /** Sin total de sesiones (p. ej. carga inicial): aro único, sin tooltip con cifras inventadas. */
    const noSessionWindow = sessionsTotal <= 0;
    let pieData: Array<{ name: string; value: number }>;
    if (noSessionWindow) {
        pieData = [{ name: "Perdidas", value: 1 }];
    } else if (sumValues <= 0) {
        pieData = [
            { name: "Completadas", value: 0 },
            { name: "Perdidas", value: Math.max(1, sessionsTotal) },
        ];
    } else {
        pieData = data;
    }

    const legendFormatter: LegendProps["formatter"] = (value) => (
        <span
            style={{
                color:
                    value === "Completadas"
                        ? ADHERENCE_COMPLETED_FILL
                        : "hsl(var(--muted-foreground))",
            }}
        >
            {value}
        </span>
    );

    const sessionsSubtitle =
        sessionsTotal > 0
            ? `${sessionsCompleted}/${sessionsTotal} sesiones`
            : "0/0 sesiones";

    return (
        <div className="w-full min-w-0">
            <div
                className="relative mx-auto w-full min-w-0"
                style={{ height: ADHERENCE_CHART_HEIGHT, maxWidth: "100%" }}
            >
                <ResponsiveContainer width="100%" height={ADHERENCE_CHART_HEIGHT}>
                    <PieChart margin={{ top: 8, right: 8, bottom: 28, left: 8 }}>
                        <Pie
                            data={
                                pieData as Array<{ name: string; value: number; [key: string]: string | number }>
                            }
                            cx="50%"
                            cy={ADHERENCE_PIE_CY}
                            innerRadius={ADHERENCE_PIE_INNER_PCT}
                            outerRadius={ADHERENCE_PIE_OUTER_PCT}
                            labelLine={false}
                            label={false}
                            stroke="none"
                            paddingAngle={0}
                            dataKey="value"
                            isAnimationActive={false}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {pieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${entry.name}-${index}`}
                                    fill={
                                        ADHERENCE_SLICE_FILL[entry.name] ?? ADHERENCE_LOST_FILL
                                    }
                                    stroke="none"
                                />
                            ))}
                        </Pie>
                        {!noSessionWindow ? (
                            <Tooltip contentStyle={coherenceDashboardTooltipStyle} />
                        ) : (
                            <Tooltip content={() => null} />
                        )}
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="square"
                            iconSize={14}
                            formatter={legendFormatter}
                            wrapperStyle={{
                                fontSize: "11px",
                                paddingTop: 4,
                                width: "100%",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7">
                    <div className="text-[28px] font-bold leading-none text-white">
                        {adherencePercentage.toFixed(0)}%
                    </div>
                    <div
                        className="mt-1 text-[11px] leading-tight"
                        style={{ color: ADHERENCE_CENTER_SUBTITLE }}
                    >
                        {sessionsSubtitle}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdherenceChart = React.memo(AdherenceChartComponent);

interface ScatterChartProps {
    scatterData: Array<{ x: number; y: number; session: string }>;
    idealLineData: Array<{ x: number; y: number; session: string }>;
}

/** orange = percibido > prescrito (sobresfuerzo); green = dentro o por debajo de lo pautado. */
const SCATTER_DOT_OVER = "hsl(var(--warning))";
const SCATTER_DOT_OK   = "hsl(var(--success))";

const ScatterChartComponent: React.FC<ScatterChartProps> = ({ scatterData, idealLineData }) => {
    return (
        <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={250}>
                <ComposedChart margin={{ top: 8, right: 8, bottom: 8, left: 5 }}>
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={true}
                        horizontal={true}
                    />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name="Prescrito"
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name="Percibido"
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                        width={32}
                    />
                    <Tooltip
                        contentStyle={coherenceDashboardTooltipStyle}
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value: number, name: string) => [value.toFixed(1), name]}
                    />
                    <Line
                        type="linear"
                        dataKey="y"
                        data={idealLineData}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                        legendType="none"
                        isAnimationActive={false}
                    />
                    <Scatter name="Sesiones" data={scatterData} isAnimationActive={false}>
                        {scatterData.map((entry, index) => (
                            <Cell
                                key={`cell-scatter-${index}`}
                                fill={entry.y > entry.x ? SCATTER_DOT_OVER : SCATTER_DOT_OK}
                            />
                        ))}
                    </Scatter>
                </ComposedChart>
            </ResponsiveContainer>
            {/* Leyenda HTML — consistente con el resto de gráficos */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <svg width="20" height="10" className="inline-block shrink-0" aria-hidden>
                        <line x1="0" y1="5" x2="20" y2="5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="5 3" />
                    </svg>
                    Ideal (prescrito = percibido)
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="10" height="10" className="inline-block shrink-0" aria-hidden>
                        <circle cx="5" cy="5" r="4" fill="hsl(var(--success))" />
                    </svg>
                    Dentro del plan
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="10" height="10" className="inline-block shrink-0" aria-hidden>
                        <circle cx="5" cy="5" r="4" fill="hsl(var(--warning))" />
                    </svg>
                    Sobresfuerzo (percibido &gt; prescrito)
                </span>
                <span className="text-muted-foreground/60">
                    X: Prescrito · Y: Percibido
                </span>
            </div>
        </div>
    );
};

const ScatterChart = React.memo(ScatterChartComponent);

interface MonotonyChartProps {
    data: Array<MonotonyWeekData & { periodLabel?: string }>;
    onTooltipLabel: (label: string | number, payload?: ReadonlyArray<Payload<number, string>>) => string;
}

/** Calcula dominio Y y ticks con paso 0.75; mínimo 0–3 (donde vive el umbral 2.0). */
const useMonotonyYScale = (data: Array<MonotonyWeekData>) => {
    return useMemo(() => {
        const peak = Math.max(0, ...data.map((d) => Number(d.monotony) || 0));
        const rawMax = Math.max(3, peak * 1.1);
        const step = 0.75;
        const yMax = Math.ceil(rawMax / step) * step;
        const count = Math.round(yMax / step) + 1;
        const yTicks = Array.from({ length: count }, (_, i) =>
            Number((i * step).toFixed(2))
        );
        return { yMax, yTicks };
    }, [data]);
};

const MonotonyChartComponent: React.FC<MonotonyChartProps> = ({ data, onTooltipLabel }) => {
    const { yMax, yTicks } = useMonotonyYScale(data);

    const chartData = useMemo(
        () => data.map((row) => ({ ...row, periodLabel: row.periodLabel ?? row.week ?? "" })),
        [data]
    );

    return (
        <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 8, left: 5 }}
                    barCategoryGap="14%"
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={true}
                        horizontal={true}
                    />
                    <XAxis
                        dataKey="periodLabel"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                        interval={0}
                    />
                    <YAxis
                        width={32}
                        domain={[0, yMax]}
                        ticks={yTicks}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                        contentStyle={coherenceDashboardTooltipStyle}
                        labelFormatter={onTooltipLabel}
                    />
                    <ReferenceLine
                        y={2}
                        stroke="hsl(var(--warning))"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                    />
                    <Bar
                        dataKey="monotony"
                        name="Monotonía"
                        radius={[4, 4, 0, 0] as [number, number, number, number]}
                        maxBarSize={64}
                        isAnimationActive={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-monotony-${index}`}
                                fill={
                                    Number(entry.monotony) > 2
                                        ? "hsl(var(--destructive))"
                                        : "hsl(var(--primary))"
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Leyenda HTML — consistente con el resto de gráficos */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                    Monotonía
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive" />
                    Excede umbral
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="20" height="10" className="inline-block shrink-0" aria-hidden>
                        <line x1="0" y1="5" x2="20" y2="5" stroke="hsl(var(--warning))" strokeWidth="1.5" strokeDasharray="5 3" />
                    </svg>
                    Umbral (2.0)
                </span>
            </div>
        </div>
    );
};

const MonotonyChart = React.memo(MonotonyChartComponent);

interface StrainChartProps {
    data: Array<StrainWeekData & { periodLabel?: string; periodLoad?: number; rawStrain?: number; rawLoad?: number; load?: number; strain?: number }>;
    onTooltipLabel: (label: string | number, payload?: ReadonlyArray<Payload<number, string>>) => string;
    onTooltipFormatter: (value: number, name: string, props?: Payload<number, string>) => [string, string];
}

const StrainChartComponent: React.FC<StrainChartProps> = ({
    data,
    onTooltipLabel,
    onTooltipFormatter,
}) => {
    return (
        <div className="w-full min-w-0">
            <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 5 }}>
                    <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="periodLabel"
                        tick={CHART_TICK_STYLE}
                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                        interval={0}
                    />
                    <YAxis
                        width={32}
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        tick={CHART_TICK_STYLE}
                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                    />
                    <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={onTooltipLabel}
                        formatter={onTooltipFormatter}
                    />
                    <Bar
                        dataKey="load"
                        fill="hsl(var(--primary) / 0.4)"
                        radius={[6, 6, 0, 0]}
                        name="Carga"
                    />
                    <Line
                        type="monotone"
                        dataKey="strain"
                        stroke="hsl(var(--warning))"
                        strokeWidth={2.5}
                        name="Strain"
                        dot={{
                            r: 4,
                            strokeWidth: 2,
                            stroke: "hsl(var(--warning))",
                            fill: "hsl(var(--card))",
                        }}
                        isAnimationActive={false}
                        connectNulls={true}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            {/* Leyenda HTML — consistente con el resto de gráficos */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--primary) / 0.4)" }} />
                    Carga
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="20" height="10" className="inline-block shrink-0" aria-hidden>
                        <line x1="0" y1="5" x2="20" y2="5" stroke="hsl(var(--warning))" strokeWidth="2.5" />
                    </svg>
                    Strain
                </span>
            </div>
        </div>
    );
};

const StrainChart = React.memo(StrainChartComponent);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

type PeriodType = "week" | "month" | "training_block" | "year";

type PeriodRange = {
    start?: string;
    end?: string;
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getRangeForPeriod = (periodType: PeriodType, offset: number = 0): PeriodRange => {
    const now = new Date();
    
    switch (periodType) {
        case "week": {
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday + (offset * 7));
            monday.setHours(0, 0, 0, 0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            return { start: formatDate(monday), end: formatDate(sunday) };
        }
        case "month": {
            const targetMonth = now.getMonth() + offset;
            const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
            const actualMonth = ((targetMonth % 12) + 12) % 12;
            const firstDay = new Date(targetYear, actualMonth, 1);
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(targetYear, actualMonth + 1, 0);
            lastDay.setHours(23, 59, 59, 999);
            return { start: formatDate(firstDay), end: formatDate(lastDay) };
        }
        case "year": {
            const targetYear = now.getFullYear() + offset;
            const firstDay = new Date(targetYear, 0, 1);
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(targetYear, 11, 31);
            lastDay.setHours(23, 59, 59, 999);
            return { start: formatDate(firstDay), end: formatDate(lastDay) };
        }
        default:
            return { start: undefined, end: undefined };
    }
};

/** Texto legible para el resumen (fallbacks y mensajes genéricos del API en inglés). */
function coherenceSummaryDisplay(summary: string): string {
    const t = summary.trim();
    if (!t) return "Sin información disponible para este periodo.";
    if (/no training sessions found/i.test(t)) {
        return "No hay sesiones de entrenamiento en este periodo.";
    }
    return summary;
}

const formatPeriodDisplay = (periodType: PeriodType, start: string, end: string): string => {
    try {
        const startDate = new Date(start);
        
        switch (periodType) {
            case "week": {
                const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                return `${startDate.getDate()} ${monthNames[startDate.getMonth()]} - ${new Date(end).getDate()} ${monthNames[new Date(end).getMonth()]}`;
            }
            case "month": {
                const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                return `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
            }
            case "year":
                return `${startDate.getFullYear()}`;
            default:
                return `${start} - ${end}`;
        }
    } catch {
        return `${start} - ${end}`;
    }
};

// Función de comparación personalizada para React.memo
const areCoherencePropsEqual = (
    prevProps: ClientDailyCoherenceTabProps,
    nextProps: ClientDailyCoherenceTabProps
): boolean => {
    return prevProps.clientId === nextProps.clientId;
};

interface ClientDailyCoherenceTabProps {
    clientId: number;
}

const ClientDailyCoherenceTabComponent: React.FC<ClientDailyCoherenceTabProps> = ({ clientId }) => {
    const [periodType, setPeriodType] = useState<PeriodType>("week");
    const [periodOffset, setPeriodOffset] = useState<number>(0);

    const activeBlockCtx = useClientActiveBlock(clientId, periodType === "training_block");
    const { hasNoActivePlan, hasNoSourcePlanForBlocks, periodBlockCount } = activeBlockCtx;

    const periodRange = useMemo(() => {
        if (periodType === "training_block") {
            const b = activeBlockCtx.activeBlock;
            if (b) {
                return {
                    start: b.start_date.slice(0, 10),
                    end: b.end_date.slice(0, 10),
                };
            }
            return { start: undefined, end: undefined };
        }
        return getRangeForPeriod(periodType, periodOffset);
    }, [periodType, periodOffset, activeBlockCtx.activeBlock]);

    const periodDisplay = useMemo(() => {
        if (periodType === "training_block") {
            const b = activeBlockCtx.activeBlock;
            if (!b || !periodRange.start || !periodRange.end) return "";
            const name = b.name?.trim() || "Bloque";
            const rangeLabel = formatPeriodDisplay(periodType, periodRange.start, periodRange.end);
            return `${name} · ${rangeLabel}`;
        }
        return periodRange.start && periodRange.end
            ? formatPeriodDisplay(periodType, periodRange.start, periodRange.end)
            : "";
    }, [periodType, periodRange.start, periodRange.end, activeBlockCtx.activeBlock]);

    const {
        data,
        adherenceData,
        scatterData,
        idealLineData,
        isLoading,
        isError,
        isQuerySkipped,
    } = useCoherence(clientId, undefined, periodRange.start, periodRange.end, periodType);

    const blockTabEmpty =
        periodType === "training_block" &&
        !activeBlockCtx.isLoading &&
        !activeBlockCtx.errorMessage &&
        (hasNoActivePlan || hasNoSourcePlanForBlocks || activeBlockCtx.hasNoActiveBlock);

    const blockEmptyCalloutCopy = useMemo(() => {
        if (hasNoActivePlan) {
            return {
                primaryText: "No hay plan de entrenamiento activo en la fecha de hoy.",
                secondaryText: "Asigna un plan en curso o revisa las fechas de la instancia del plan.",
            };
        }
        if (hasNoSourcePlanForBlocks) {
            return {
                primaryText: "No hay bloques de periodización configurados.",
                secondaryText:
                    "Selecciona un rango de fechas en el calendario para crear el primer bloque.",
            };
        }
        if (periodBlockCount === 0) {
            return {
                primaryText: "No hay bloques de periodización configurados.",
                secondaryText:
                    "Selecciona un rango de fechas en el calendario para crear el primer bloque.",
            };
        }
        return {
            primaryText: "Ningún bloque de periodización incluye la fecha de hoy.",
            secondaryText: "Ajusta las fechas de los bloques en la vista de planificación.",
        };
    }, [hasNoActivePlan, hasNoSourcePlanForBlocks, periodBlockCount]);

    const resolvingActiveBlock = periodType === "training_block" && activeBlockCtx.isLoading;
    const resolvingCoherence = !isQuerySkipped && isLoading;


    // Los datos ya vienen transformados del hook con etiquetas legibles en item.week
    const enhancedMonotonyData = useMemo(() => {
        if (!data.monotony_by_week || data.monotony_by_week.length === 0) {
            return [];
        }
        return data.monotony_by_week.map((item) => ({
            ...item,
            periodLabel: item.week, // Ya viene formateado del hook
        }));
    }, [data.monotony_by_week]);

    const enhancedStrainData = useMemo(() => {
        if (!data.strain_by_week || data.strain_by_week.length === 0) {
            return [];
        }
        return data.strain_by_week.map((item) => ({
            ...item,
            periodLabel: item.week, // Ya viene formateado del hook
            periodLoad: item.load,
            rawStrain: item.strain ?? 0,
        }));
    }, [data.strain_by_week]);

    // Normalizar datos de strain/load a escala 0-10 (memoizado para evitar recálculos innecesarios)
    const normalizedStrainData = useMemo(() => {
        if (!enhancedStrainData.length) return [];

        const maxValue = Math.max(
            ...enhancedStrainData.map((d) => Math.max(d.periodLoad ?? 0, d.rawStrain ?? 0))
        );

        if (maxValue === 0) return [];

        return enhancedStrainData.map((item) => {
            const normalizedLoad = maxValue > 0 ? ((item.periodLoad ?? 0) / maxValue) * 10 : 0;
            const normalizedStrain = maxValue > 0 ? ((item.rawStrain ?? 0) / maxValue) * 10 : 0;
            return {
                ...item,
                load: normalizedLoad,
                strain: normalizedStrain,
                rawLoad: item.periodLoad ?? 0,
            };
        });
    }, [enhancedStrainData]);

    const hasMonotonyData = enhancedMonotonyData.length > 0;
    const hasStrainData = normalizedStrainData.length > 0;

    const renderPeriodTooltipLabel = useCallback(
        (label: string | number, payload?: ReadonlyArray<Payload<number, string>>): string => {
            const fallbackLabel = typeof label === "number" ? label.toString() : label;
            if (!payload || payload.length === 0) {
                return fallbackLabel;
            }
            const entry = payload[0];
            // Type guard para verificar que payload tiene periodLabel
            const entryPayload = entry.payload as (MonotonyWeekData & { periodLabel?: string }) | undefined;
            if (!entryPayload) {
                return fallbackLabel;
            }
            // Mostrar la etiqueta formateada (ya viene del hook)
            return entryPayload.periodLabel ?? fallbackLabel;
        },
        []
    );

    const renderStrainTooltipFormatter = useCallback(
        (value: number, name: string, props?: Payload<number, string>): [string, string] => {
            if (!props?.payload) {
                return [value.toString(), name];
            }
            const payload = props.payload as StrainWeekData & {
                periodLabel?: string;
                periodLoad?: number;
                rawStrain?: number;
                rawLoad?: number;
            };
            if (name === "Carga") {
                return [`${payload.rawLoad ?? 0}`, "Carga"];
            }
            if (name === "Strain") {
                return [`${payload.rawStrain ?? 0}`, "Strain"];
            }
            return [value.toString(), name];
        },
        []
    );

    // Handler memoizado para cambio de período
    const handlePeriodChange = useCallback((period: PeriodType) => {
        setPeriodType(period);
        setPeriodOffset(0); // Reset offset al cambiar tipo
    }, []);

    // Handlers para navegación entre periodos
    const handlePreviousPeriod = useCallback(() => {
        setPeriodOffset((prev) => prev - 1);
    }, []);

    const handleNextPeriod = useCallback(() => {
        setPeriodOffset((prev) => prev + 1);
    }, []);

    const handleResetPeriod = useCallback(() => {
        setPeriodOffset(0);
    }, []);

    if (resolvingActiveBlock || resolvingCoherence) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (periodType === "training_block" && activeBlockCtx.errorMessage) {
        return (
            <div className="w-full">
                <Alert variant="error">{activeBlockCtx.errorMessage}</Alert>
            </div>
        );
    }

    if (!isQuerySkipped && isError) {
        return (
            <div className="w-full">
                <Alert variant="error">
                    Error al cargar los datos de coherencia. Por favor, intenta de nuevo.
                </Alert>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Coherencia Diaria</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Análisis de adherencia, percepción de esfuerzo y carga de entrenamiento
                </p>
            </div>

            <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Periodo">
                    {([
                        { id: "week" as PeriodType, label: "Semana" },
                        { id: "month" as PeriodType, label: "Mes" },
                        { id: "year" as PeriodType, label: "Año" },
                        { id: "training_block" as PeriodType, label: "Bloque" },
                    ] as const).map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handlePeriodChange(opt.id)}
                            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                periodType === opt.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                            }`}
                            aria-pressed={periodType === opt.id}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Selector de periodo con navegación */}
                {periodType === "training_block" && periodDisplay && !blockTabEmpty && (
                    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-foreground">{periodDisplay}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Métricas acotadas al bloque de periodización activo para la fecha de hoy
                        </p>
                    </div>
                )}

                {periodType !== "training_block" && periodDisplay && (
                    <div className="flex w-full min-w-0 items-center justify-between gap-2">
                        <button
                            onClick={handlePreviousPeriod}
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                            aria-label="Período anterior"
                        >
                            ← Anterior
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{periodDisplay}</span>
                            {periodOffset !== 0 && (
                                <button
                                    onClick={handleResetPeriod}
                                    className="px-2 py-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                    aria-label="Volver al período actual"
                                >
                                    Hoy
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleNextPeriod}
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                            aria-label="Período siguiente"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>

            {blockTabEmpty && (
                <PeriodBlockEmptyCallout
                    clientId={clientId}
                    primaryText={blockEmptyCalloutCopy.primaryText}
                    secondaryText={blockEmptyCalloutCopy.secondaryText}
                />
            )}

            {!blockTabEmpty && (
            <>
            {/* Cards de métricas principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Adherencia"
                    value={`${data.adherence_percentage}%`}
                    subtitle={`${data.sessions_completed}/${data.sessions_total} sesiones`}
                    color="blue"
                />
                <MetricCard
                    title="sRPE Promedio"
                    value={data.average_srpe.toFixed(1)}
                    subtitle="Escala 1-10"
                    color="green"
                />
                <MetricCard
                    title="Monotonía"
                    value={data.monotony.toFixed(1)}
                    subtitle={data.monotony > 2.0 ? "Alta — revisar planificación" : "Normal"}
                    color={data.monotony > 2.0 ? "orange" : "green"}
                />
                <MetricCard
                    title="Carga"
                    value={data.strain}
                    subtitle="Carga acumulada"
                    color="blue"
                />
            </div>

            {/* Estado vacío: mostrar antes de los gráficos si no hay datos */}
            {!hasMonotonyData && !hasStrainData && (
                <Alert variant="info">
                    Sin datos de monotonía disponibles. Los datos requieren que el cliente complete el feedback
                    post-entrenamiento con el esfuerzo percibido (RPE).
                </Alert>
            )}

            {/* Gráficos en 2 columnas: Adherence Overview y Scatter Plot */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Gráfico 1: Adherence — donut compacto (shell surface, sin CompactChartCard) */}
                <div className="rounded-lg bg-surface p-5">
                    <h3 className="mb-4 text-sm font-semibold">Adherencia</h3>
                    <AdherenceChart
                        data={adherenceData}
                        adherencePercentage={data.adherence_percentage}
                        sessionsCompleted={data.sessions_completed}
                        sessionsTotal={data.sessions_total}
                    />
                </div>

                {/* Gráfico 2: Prescribed vs Perceived Intensity (Scatter Plot) */}
                <div className="min-w-0 rounded-lg bg-surface p-5">
                    <h3 className="mb-4 text-sm font-semibold">Prescrita vs Percibida</h3>
                    {scatterData && scatterData.length > 0 ? (
                        <ScatterChart
                            scatterData={scatterData}
                            idealLineData={idealLineData}
                        />
                    ) : (
                        <div
                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                            style={{ minHeight: 250 }}
                        >
                            Sin datos de intensidad. El cliente debe completar el feedback RPE post-sesión.
                        </div>
                    )}
                </div>
            </div>

            {/* Gráficos en 2 columnas: Monotonía y Carga */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="min-w-0 rounded-lg bg-surface p-5">
                    <h3 className="mb-4 text-sm font-semibold">Monotonía</h3>
                    {hasMonotonyData ? (
                        <MonotonyChart
                            data={enhancedMonotonyData}
                            onTooltipLabel={renderPeriodTooltipLabel}
                        />
                    ) : (
                        <div
                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                            style={{ minHeight: 250 }}
                        >
                            No hay datos de monotonía disponibles
                        </div>
                    )}
                </div>

                <div className="min-w-0 rounded-lg bg-surface p-5">
                    <h3 className="mb-4 text-sm font-semibold">Carga y Volumen</h3>
                    {hasStrainData ? (
                        <StrainChart
                            data={normalizedStrainData}
                            onTooltipLabel={renderPeriodTooltipLabel}
                            onTooltipFormatter={renderStrainTooltipFormatter}
                        />
                    ) : (
                        <div
                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                            style={{ minHeight: 250 }}
                        >
                            No hay datos de carga y volumen disponibles
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen: mismo lenguaje visual que PeriodBlockEmptyCallout (marco discontinuo + icono documento) */}
            <section
                className="w-full border-t border-border/80 bg-background pt-8"
                aria-labelledby="coherence-summary-heading"
            >
                <div
                    className={cn(
                        periodBlockDashedShellClassName,
                        "flex flex-col gap-6 text-left"
                    )}
                >
                    <h3
                        id="coherence-summary-heading"
                        className="text-base font-semibold text-foreground"
                    >
                        Resumen interpretativo
                    </h3>

                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                        <PeriodBlockEmptyIconDecoration />
                        <p className="max-w-sm text-sm text-muted-foreground whitespace-pre-line sm:max-w-lg">
                            {coherenceSummaryDisplay(data.summary ?? "")}
                        </p>
                    </div>

                    <div className="w-full space-y-4 border-t border-border/60 pt-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Recomendaciones principales
                        </h4>
                        {data.recommendations.length === 0 ? (
                            <p className="text-xs text-muted-foreground/70 sm:text-sm">
                                No hay recomendaciones para este periodo.
                            </p>
                        ) : (
                            <ul className="space-y-3 border-l-2 border-primary/25 pl-4">
                                {data.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm">
                                        <span
                                            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
                                            aria-hidden
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="min-w-0 leading-relaxed text-foreground">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
            </>
            )}
        </div>
    );
};

// Exportar componente memoizado para evitar re-renders innecesarios
export const ClientDailyCoherenceTab = React.memo(ClientDailyCoherenceTabComponent, areCoherencePropsEqual);

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
import { Link } from "react-router-dom";
import { CalendarRange } from "lucide-react";
import { useCoherence, useClientActiveBlock } from "@nexia/shared";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { cn } from "@/lib/utils";
import type {
    MetricCardProps,
    MetricCardColor,
    MonotonyWeekData,
    StrainWeekData,
} from "@nexia/shared/types/coherence";
import { CompactChartCard } from "@/components/ui/cards";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    LineChart,
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

const CHART_HEIGHT = 400;
const MIN_CHART_HEIGHT = 360;

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
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
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
    colors: readonly string[];
    adherencePercentage: number;
    sessionsCompleted: number;
    sessionsTotal: number;
}

const AdherenceChartComponent: React.FC<AdherenceChartProps> = ({
    data,
    colors,
    adherencePercentage,
    sessionsCompleted,
    sessionsTotal,
}) => {
    return (
        <div className="w-full flex items-center justify-center" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
            <div className="relative w-full" style={{ height: `${CHART_HEIGHT}px`, minHeight: `${CHART_HEIGHT}px` }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <PieChart>
                        <Pie
                            data={data as Array<{ name: string; value: number; [key: string]: string | number }>}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            labelLine={false}
                            label={false}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-4xl font-bold text-foreground">
                        {adherencePercentage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {sessionsCompleted}/{sessionsTotal} sesiones
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
    colors: readonly string[];
    margin: { top: number; right: number; left: number; bottom: number };
    xAxisLabel: { value: string; position: string; offset: number };
    yAxisLabel: { value: string; angle: number; position: string; offset: number; style: { textAnchor: string } };
}

const ScatterChartComponent: React.FC<ScatterChartProps> = ({
    scatterData,
    idealLineData,
    colors,
    margin,
    xAxisLabel,
    yAxisLabel,
}) => {
    return (
        <div className="w-full flex items-center justify-center" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
            <div className="w-full" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <ComposedChart margin={margin}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Prescrita"
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={xAxisLabel}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Percibida"
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={yAxisLabel}
                        />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Legend wrapperStyle={{ paddingTop: "15px" }} align="left" />
                        <Line
                            type="linear"
                            dataKey="y"
                            data={idealLineData}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                            name="Ideal (y=x)"
                            isAnimationActive={false}
                        />
                        <Scatter name="Sesiones" data={scatterData} fill="hsl(var(--primary))" isAnimationActive={false}>
                            {scatterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[0]} />
                            ))}
                        </Scatter>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ScatterChart = React.memo(ScatterChartComponent);

interface MonotonyChartProps {
    data: Array<MonotonyWeekData & { periodLabel?: string }>;
    margin: { top: number; right: number; left: number; bottom: number };
    xAxisLabel: { value: string; position: string; offset: number };
    yAxisLabel: { value: string; angle: number; position: string; offset: number; style: { textAnchor: string } };
    onTooltipLabel: (label: string | number, payload?: ReadonlyArray<Payload<number, string>>) => string;
    legendConfig: LegendProps;
}

const MonotonyChartComponent: React.FC<MonotonyChartProps> = ({
    data,
    margin,
    xAxisLabel,
    yAxisLabel,
    onTooltipLabel,
    legendConfig,
}) => {
    return (
        <div className="w-full flex items-center justify-center" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
            <div className="w-full" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <LineChart data={data} margin={margin}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="periodLabel"
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={xAxisLabel}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={yAxisLabel}
                        />
                        <Tooltip labelFormatter={onTooltipLabel} />
                        <Legend {...legendConfig} />
                        <Line
                            type="monotone"
                            dataKey="monotony"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Monotonía"
                            dot={{ r: 4, fill: "hsl(var(--primary))" }}
                            isAnimationActive={false}
                            connectNulls={true}
                        />
                        <ReferenceLine
                            y={2.0}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: "Umbral (2.0)", position: "top" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const MonotonyChart = React.memo(MonotonyChartComponent);

interface StrainChartProps {
    data: Array<StrainWeekData & { periodLabel?: string; periodLoad?: number; rawStrain?: number; rawLoad?: number; load?: number; strain?: number }>;
    margin: { top: number; right: number; left: number; bottom: number };
    xAxisLabel: { value: string; position: string; offset: number };
    yAxisLabel: { value: string; angle: number; position: string; offset: number; style: { textAnchor: string } };
    onTooltipLabel: (label: string | number, payload?: ReadonlyArray<Payload<number, string>>) => string;
    onTooltipFormatter: (value: number, name: string, props?: Payload<number, string>) => [string, string];
    legendConfig: LegendProps;
}

const StrainChartComponent: React.FC<StrainChartProps> = ({
    data,
    margin,
    xAxisLabel,
    yAxisLabel,
    onTooltipLabel,
    onTooltipFormatter,
    legendConfig,
}) => {
    return (
        <div className="w-full flex items-center justify-center" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
            <div className="w-full" style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <ComposedChart data={data} margin={margin}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="periodLabel"
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={xAxisLabel}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                            label={yAxisLabel}
                        />
                        <Tooltip
                            labelFormatter={onTooltipLabel}
                            formatter={onTooltipFormatter}
                        />
                        <Legend {...legendConfig} />
                        <Bar dataKey="load" fill="hsl(var(--muted-foreground))" name="Carga" />
                        <Line
                            type="monotone"
                            dataKey="strain"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Strain"
                            dot={{ r: 4, fill: "hsl(var(--primary))" }}
                            isAnimationActive={false}
                            connectNulls={true}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
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
        colors,
        isLoading,
        isError,
        isQuerySkipped,
    } = useCoherence(clientId, undefined, periodRange.start, periodRange.end, periodType);

    const blockTabEmpty =
        periodType === "training_block" &&
        !activeBlockCtx.isLoading &&
        !activeBlockCtx.errorMessage &&
        (activeBlockCtx.hasNoActivePlan ||
            activeBlockCtx.hasNoSourcePlanForBlocks ||
            activeBlockCtx.hasNoActiveBlock);

    const resolvingActiveBlock = periodType === "training_block" && activeBlockCtx.isLoading;
    const resolvingCoherence = !isQuerySkipped && isLoading;

    const [summary, setSummary] = useState<string>(data.summary || "");

    // Actualizar summary cuando cambien los datos
    React.useEffect(() => {
        if (data.summary) {
            setSummary(data.summary);
        }
    }, [data.summary]);

    // Memoizar objetos de configuración para evitar recreaciones innecesarias
    const defaultChartMargin = useMemo(() => ({ top: 5, right: 10, left: 30, bottom: 60 }), []);
    const legendConfig: LegendProps = useMemo(() => ({
        align: "left" as const,
        wrapperStyle: { paddingTop: "15px" },
    }), []);

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

    // Memoizar configuraciones de labels para evitar recreaciones
    const xAxisPeriodLabel = useMemo(() => ({ value: "Período", position: "insideBottom" as const, offset: -5 }), []);
    const yAxisMonotonyLabel = useMemo(() => ({ 
        value: "Monotonía", 
        angle: -90, 
        position: "left" as const, 
        offset: -5, 
        style: { textAnchor: "middle" as const } 
    }), []);
    const yAxisStrainLabel = useMemo(() => ({ 
        value: "Índice de Carga (0-10)", 
        angle: -90, 
        position: "left" as const, 
        offset: -5, 
        style: { textAnchor: "middle" as const } 
    }), []);
    const scatterXAxisLabel = useMemo(() => ({ 
        value: "Intensidad Prescrita (RPE)", 
        position: "insideBottom" as const, 
        offset: -5 
    }), []);
    const scatterYAxisLabel = useMemo(() => ({ 
        value: "Intensidad Percibida (RPE)", 
        angle: -90, 
        position: "left" as const, 
        offset: -5, 
        style: { textAnchor: "middle" as const } 
    }), []);

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
            <div className="flex min-h-[400px] items-center justify-center p-6">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (periodType === "training_block" && activeBlockCtx.errorMessage) {
        return (
            <div className="p-6">
                <Alert variant="error">{activeBlockCtx.errorMessage}</Alert>
            </div>
        );
    }

    if (!isQuerySkipped && isError) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    Error al cargar los datos de coherencia. Por favor, intenta de nuevo.
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-foreground">Coherencia Diaria</h2>
                <p className="text-muted-foreground mt-2">
                    Análisis de adherencia, percepción de esfuerzo y carga de entrenamiento
                </p>
            </div>

            {/* Sub-tabs: Week, Month, Year, Training Block */}
            <div className="space-y-4">
                <nav aria-label="Period tabs" className="flex gap-1 border-b border-border">
                    {[
                        { id: "week" as PeriodType, label: "Semana" },
                        { id: "month" as PeriodType, label: "Mes" },
                        { id: "year" as PeriodType, label: "Año" },
                        { id: "training_block" as PeriodType, label: "Bloque de Entrenamiento" },
                    ].map((tab) => {
                        const isActive = periodType === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handlePeriodChange(tab.id)}
                                className={`
                                    relative py-2 pb-3 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap flex-none min-w-[120px] text-center
                                    ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                    }
                                    cursor-pointer
                                `}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

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
                    <div className="flex items-center justify-between px-2">
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
                <EmptyState
                    icon={<CalendarRange className="size-12" aria-hidden />}
                    title={
                        activeBlockCtx.hasNoActivePlan
                            ? "Sin plan de entrenamiento activo"
                            : activeBlockCtx.hasNoSourcePlanForBlocks
                              ? "No se puede cargar la periodización"
                              : "Sin bloque activo para hoy"
                    }
                    description={
                        activeBlockCtx.hasNoActivePlan
                            ? "Este cliente no tiene un plan de entrenamiento activo en la fecha actual, o el plan no está en curso."
                            : activeBlockCtx.hasNoSourcePlanForBlocks
                              ? "La instancia del plan no está vinculada a un plan fuente con bloques de periodización."
                              : "No hay un bloque de periodización que incluya la fecha de hoy en el plan activo. Revisa las fechas de los bloques en la planificación del plan."
                    }
                    action={
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Link
                                to={`/dashboard/clients/${clientId}?tab=planning`}
                                className={cn(
                                    "inline-flex h-9 items-center justify-center rounded-md border border-primary bg-transparent px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                )}
                            >
                                Ver planificación
                            </Link>
                            <Link
                                to="/dashboard/training-plans"
                                className={cn(
                                    "inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                )}
                            >
                                Planes de entrenamiento
                            </Link>
                        </div>
                    }
                    className="rounded-xl border border-dashed border-border bg-card/50 py-14"
                />
            )}

            {!blockTabEmpty && (
            <>
            {/* Cards de métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 1: Adherence Overview (Donut Chart con texto en el centro) */}
                <CompactChartCard title="Adherencia - Sesiones Completadas">
                    <AdherenceChart
                        data={adherenceData}
                        colors={colors}
                        adherencePercentage={data.adherence_percentage}
                        sessionsCompleted={data.sessions_completed}
                        sessionsTotal={data.sessions_total}
                    />
                </CompactChartCard>

                {/* Gráfico 2: Prescribed vs Perceived Intensity (Scatter Plot) */}
                {scatterData && scatterData.length > 0 && (
                    <CompactChartCard title="Intensidad Prescrita vs Percibida">
                        <ScatterChart
                            scatterData={scatterData}
                            idealLineData={idealLineData}
                            colors={colors}
                            margin={defaultChartMargin}
                            xAxisLabel={scatterXAxisLabel}
                            yAxisLabel={scatterYAxisLabel}
                        />
                    </CompactChartCard>
                )}
            </div>

            {/* Gráficos en 2 columnas: Monotony y Strain & Load */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 3: Monotony (Line Chart) */}
                <CompactChartCard title="Monotonía">
                    {hasMonotonyData ? (
                        <MonotonyChart
                            data={enhancedMonotonyData}
                            margin={defaultChartMargin}
                            xAxisLabel={xAxisPeriodLabel}
                            yAxisLabel={yAxisMonotonyLabel}
                            onTooltipLabel={renderPeriodTooltipLabel}
                            legendConfig={legendConfig}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center w-full min-w-0 text-muted-foreground"
                            style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}
                        >
                            No hay datos de monotonía disponibles
                        </div>
                    )}
                </CompactChartCard>

                {/* Gráfico 4: Strain & Load (Bar + Line Chart) */}
                <CompactChartCard title="Carga y Volumen">
                    {hasStrainData ? (
                        <StrainChart
                            data={normalizedStrainData}
                            margin={defaultChartMargin}
                            xAxisLabel={xAxisPeriodLabel}
                            yAxisLabel={yAxisStrainLabel}
                            onTooltipLabel={renderPeriodTooltipLabel}
                            onTooltipFormatter={renderStrainTooltipFormatter}
                            legendConfig={legendConfig}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center w-full min-w-0 text-muted-foreground"
                            style={{ minHeight: `${MIN_CHART_HEIGHT}px` }}
                        >
                            No hay datos de carga y volumen disponibles
                        </div>
                    )}
                </CompactChartCard>
            </div>

            {/* Summary interpretativo (editable) con botón Edit */}
            <div className="bg-card border border-border rounded-lg shadow px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground">Resumen Interpretativo</h3>
                    <button className="px-4 py-2 text-sm font-semibold text-primary border border-border rounded-lg hover:bg-muted transition-colors">
                        Editar
                    </button>
                </div>

                <div className="space-y-5">
                    <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {summary || "Sin información disponible."}
                    </p>

                    <div className="bg-muted/50 border border-border rounded-xl p-5 w-full">
                        <div className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">
                            RECOMENDACIONES PRINCIPALES
                        </div>
                        <ul className="space-y-3">
                            {data.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                        {index + 1}
                                    </span>
                                    <span className="text-foreground">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            </>
            )}
        </div>
    );
};

// Exportar componente memoizado para evitar re-renders innecesarios
export const ClientDailyCoherenceTab = React.memo(ClientDailyCoherenceTabComponent, areCoherencePropsEqual);

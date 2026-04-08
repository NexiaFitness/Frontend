/**
 * ClientProgressTab.tsx — Tab Progress del cliente
 *
 * Sub-tabs: Resumen · Carga · Historial
 * Rediseñado v7 — alineado con ClientDailyCoherenceTab (tokens, chart height 250,
 * tooltips temáticos, grids 2-col, legends HTML, bg-surface containers).
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v7.0.0 - Rediseño completo UI, mismo patrón que Daily Coherence
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSubTabNavigation } from "@/hooks/useSubTabNavigation";
import type { ClientProgress } from "@nexia/shared/types/progress";
import type { Client } from "@nexia/shared/types/client";
import { useClientProgress } from "@nexia/shared/hooks/clients/useClientProgress";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import { useWeeklyMetricsV2, useMetricsAlertsV2, useMonthlyMetricsV2 } from "@nexia/shared/hooks/metrics";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { ProgressForm } from "./ProgressForm";
import { EditProgressModal } from "../modals/EditProgressModal";
import { Pencil, Plus, ChevronDown, ChevronUp } from "lucide-react";
import {
    LineChart,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ========================================
// CHART TOKENS (alineados con ClientDailyCoherenceTab)
// ========================================

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

// ========================================
// TYPES
// ========================================

type ProgressSubTab = "overview" | "load" | "history";
type MetricsPeriod = "weekly" | "monthly" | "annual";
type MetricCardColor = "blue" | "green" | "orange" | "red";

interface NormalizedWorkloadDataPoint {
    date: string;
    workload_score: number | null;
    recovery_need_score: number | null;
    workload_score_original?: number | null;
    recovery_need_score_original?: number | null;
}

interface WorkloadTooltipPayloadItem {
    payload?: NormalizedWorkloadDataPoint;
    value?: number;
    name?: string;
}

// ========================================
// HELPER COMPONENTS
// ========================================

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    color?: MetricCardColor;
}

const COLOR_CLASSES: Record<MetricCardColor, string> = {
    blue: "bg-primary/10 border-primary/30 text-primary",
    green: "bg-success/10 border-success/30 text-success",
    orange: "bg-warning/10 border-warning/30 text-warning",
    red: "bg-destructive/10 border-destructive/30 text-destructive",
};

const MetricCardComponent: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    color = "blue",
}) => (
    <div className={`rounded-lg border p-4 ${COLOR_CLASSES[color]}`}>
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {subtitle && <p className="mt-1 text-xs opacity-75">{subtitle}</p>}
    </div>
);

const MetricCard = React.memo(MetricCardComponent);

// ========================================
// HELPERS
// ========================================

const SHORT_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const formatDateShort = (date: string | number): string => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
};

const riskColorMap: Record<string, MetricCardColor> = {
    low: "green",
    medium: "orange",
    high: "red",
};

// ========================================
// MAIN COMPONENT
// ========================================

interface ClientProgressTabProps {
    clientId: number;
    client?: Client | null;
}

const arePropsEqual = (
    prev: ClientProgressTabProps,
    next: ClientProgressTabProps,
): boolean =>
    prev.clientId === next.clientId &&
    prev.client?.id === next.client?.id &&
    prev.client?.updated_at === next.client?.updated_at;

const ClientProgressTabComponent: React.FC<ClientProgressTabProps> = ({
    clientId,
    client,
}) => {
    // ── State ──────────────────────────────────────────
    const [showProgressForm, setShowProgressForm] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ClientProgress | null>(null);
    const [metricsPeriod, setMetricsPeriod] = useState<MetricsPeriod>("weekly");
    const formRef = useRef<HTMLDivElement>(null);

    const { activeSubTab: activeTab, setActiveSubTab: setActiveTab } =
        useSubTabNavigation<ProgressSubTab>({
            validSubTabs: ["overview", "load", "history"] as const,
            defaultSubTab: "overview",
        });

    // ── Data hooks ─────────────────────────────────────
    const {
        progressHistory,
        weightChartData,
        bmiChartData,
        latestWeight,
        latestBmi,
        weightChange,
        bmiChange,
        trend,
        isLoading: isLoadingProgress,
        error: progressError,
        refetch: refetchProgress,
    } = useClientProgress(clientId, client);

    const {
        fatigueChartData,
        energyChartData,
        workloadChartData,
        currentRiskLevel,
        avgPreFatigue,
        avgPostFatigue,
        isLoading: isLoadingFatigue,
    } = useClientFatigue(clientId);

    const metricsDateRange = useMemo(() => {
        const end = new Date();
        const start = new Date();
        if (metricsPeriod === "weekly") start.setDate(start.getDate() - 8 * 7);
        else if (metricsPeriod === "monthly") start.setMonth(start.getMonth() - 12);
        else start.setFullYear(start.getFullYear() - 3);
        return {
            startDate: start.toISOString().split("T")[0],
            endDate: end.toISOString().split("T")[0],
        };
    }, [metricsPeriod]);

    const weeklyMetrics = useWeeklyMetricsV2({
        clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
    });

    const monthlyMetrics = useMonthlyMetricsV2({
        clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
        w_fase: 1.0,
    });

    const metricsAlerts = useMetricsAlertsV2({
        clientId,
        startDate: metricsDateRange.startDate,
        endDate: metricsDateRange.endDate,
        trainerId: client?.trainer_id,
        daily_threshold: 80.0,
        weekly_threshold: 450.0,
        consecutive_threshold: 70.0,
        consecutive_days: 3,
        create_alerts: false,
    });

    // ── Derived state ──────────────────────────────────
    const isLoading =
        isLoadingProgress ||
        isLoadingFatigue ||
        (metricsPeriod === "weekly" ? weeklyMetrics.isLoading : monthlyMetrics.isLoading);

    const isNotFoundError: boolean = Boolean(
        progressError &&
            typeof progressError === "object" &&
            "status" in progressError &&
            progressError.status === 404,
    );
    const hasRealError = Boolean(progressError && !isNotFoundError);

    // ── Chart domain memos ─────────────────────────────
    const weightDomain = useMemo(() => {
        if (!weightChartData.length) return [0, 150];
        const ws = weightChartData
            .map((d) => d.weight)
            .filter((w): w is number => w != null);
        if (!ws.length) return [0, 150];
        return [Math.floor(Math.min(...ws) - 10), Math.ceil(Math.max(...ws) + 10)];
    }, [weightChartData]);

    const bmiDomain = useMemo(() => {
        if (!bmiChartData.length) return [0, 40];
        const bs = bmiChartData
            .map((d) => d.bmi)
            .filter((b): b is number => b != null);
        if (!bs.length) return [0, 40];
        return [Math.floor(Math.min(...bs) - 2), Math.ceil(Math.max(...bs) + 2)];
    }, [bmiChartData]);

    const normalizedWorkloadData = useMemo(() => {
        if (!workloadChartData?.length) return [];
        const vals = workloadChartData
            .flatMap((d) => [d.workload_score, d.recovery_need_score])
            .filter((v): v is number => v != null);
        if (!vals.length) return [];
        const mx = Math.max(...vals);
        if (mx === 0) return workloadChartData;
        return workloadChartData.map((d) => ({
            date: d.date,
            workload_score: d.workload_score != null ? (d.workload_score / mx) * 10 : null,
            recovery_need_score:
                d.recovery_need_score != null ? (d.recovery_need_score / mx) * 10 : null,
            workload_score_original: d.workload_score,
            recovery_need_score_original: d.recovery_need_score,
        }));
    }, [workloadChartData]);

    // ── CID chart data (unified for weekly / monthly / annual) ─
    const cidChartConfig = useMemo(() => {
        if (metricsPeriod === "weekly") {
            if (!weeklyMetrics.chartData?.length) return null;
            return {
                title: "CID Semanal",
                data: weeklyMetrics.chartData.map((d) => {
                    const mon = new Date(d.weekStart);
                    const sun = new Date(mon);
                    sun.setDate(sun.getDate() + 6);
                    return {
                        label: `${mon.getDate()}–${sun.getDate()} ${SHORT_MONTHS[sun.getMonth()]}`,
                        cid: d.cid,
                        avg: d.avg,
                    };
                }),
            };
        }

        if (metricsPeriod === "monthly") {
            if (!monthlyMetrics.monthlyMetrics?.length) return null;
            return {
                title: "CID Mensual",
                data: monthlyMetrics.monthlyMetrics.map((b) => ({
                    label: SHORT_MONTHS[b.month - 1] || `M${b.month}`,
                    cid: b.cid_sum,
                    avg: b.cid_avg,
                })),
            };
        }

        // annual
        if (!monthlyMetrics.monthlyMetrics?.length) return null;
        const startY = new Date(metricsDateRange.startDate).getFullYear();
        const endY = new Date(metricsDateRange.endDate).getFullYear();
        const startMonth = new Date(metricsDateRange.startDate).getMonth() + 1;
        const endMonth = new Date(metricsDateRange.endDate).getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const map = new Map<number, { sum: number; avg: number; count: number }>();
        monthlyMetrics.monthlyMetrics.forEach((b) => {
            let year = currentYear;
            if (startY === endY) {
                year = startY;
            } else if (b.month >= startMonth && b.month <= 12) {
                year = startY;
            } else if (b.month >= 1 && b.month <= endMonth) {
                year = endY;
            } else {
                year = endY;
            }
            const prev = map.get(year) ?? { sum: 0, avg: 0, count: 0 };
            map.set(year, {
                sum: prev.sum + b.cid_sum,
                avg: prev.avg + b.cid_avg,
                count: prev.count + 1,
            });
        });

        const data = Array.from(map.entries())
            .map(([y, d]) => ({
                label: y.toString(),
                cid: d.sum,
                avg: d.count > 0 ? d.avg / d.count : 0,
            }))
            .sort((a, b) => parseInt(a.label) - parseInt(b.label));

        return data.length ? { title: "CID Anual", data } : null;
    }, [metricsPeriod, weeklyMetrics.chartData, monthlyMetrics.monthlyMetrics, metricsDateRange]);

    const cidSummary = useMemo(() => {
        if (metricsPeriod === "weekly" && weeklyMetrics.chartData?.length) {
            const last = weeklyMetrics.chartData[weeklyMetrics.chartData.length - 1];
            return { total: last.cid.toFixed(1), avg: last.avg.toFixed(1), sessions: weeklyMetrics.items.length };
        }
        if (metricsPeriod === "monthly" && monthlyMetrics.monthlyMetrics?.length) {
            const last = monthlyMetrics.monthlyMetrics[monthlyMetrics.monthlyMetrics.length - 1];
            return { total: last.cid_sum.toFixed(1), avg: last.cid_avg.toFixed(1), sessions: monthlyMetrics.items.length };
        }
        if (metricsPeriod === "annual" && monthlyMetrics.monthlyMetrics?.length) {
            const totalCid = monthlyMetrics.monthlyMetrics.reduce((s, b) => s + b.cid_sum, 0);
            const avgCid =
                monthlyMetrics.monthlyMetrics.reduce((s, b) => s + b.cid_avg, 0) /
                monthlyMetrics.monthlyMetrics.length;
            return { total: totalCid.toFixed(1), avg: avgCid.toFixed(1), sessions: monthlyMetrics.items.length };
        }
        return null;
    }, [metricsPeriod, weeklyMetrics, monthlyMetrics]);

    const hasNoLoadData = useMemo(() => {
        if (metricsPeriod === "weekly") return weeklyMetrics.items.length === 0;
        return monthlyMetrics.items.length === 0;
    }, [metricsPeriod, weeklyMetrics.items.length, monthlyMetrics.items.length]);

    const hasBodyCompCharts = weightChartData.length > 0 || bmiChartData.length > 0;
    const hasFatigueData = fatigueChartData.some((d) => d.pre_fatigue != null || d.post_fatigue != null);
    const hasEnergyData = energyChartData.some((d) => d.pre_energy != null || d.post_energy != null);
    const hasFatigueEnergyCharts = fatigueChartData.length > 0 || energyChartData.length > 0;
    const hasWorkloadChart = workloadChartData.length > 0;

    // ── Callbacks ──────────────────────────────────────
    const handleEditClick = useCallback((record: ClientProgress) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setEditModalOpen(false);
        setSelectedRecord(null);
    }, []);

    const handleEditSuccess = useCallback(() => {
        refetchProgress();
        setEditModalOpen(false);
        setSelectedRecord(null);
    }, [refetchProgress]);

    useEffect(() => {
        if (showProgressForm && formRef.current) {
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
    }, [showProgressForm]);

    // ── Early returns ──────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (hasRealError) {
        return <Alert variant="error">Error al cargar datos de progreso. Por favor, intenta de nuevo.</Alert>;
    }

    // ── Render ─────────────────────────────────────────
    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <PageTitle
                titleAs="h2"
                title="Progreso del Cliente"
                subtitle="Evolución de métricas corporales, fatiga, energía y carga de trabajo"
            />

            {/* Sub-tab chips */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tabs progreso">
                {([
                    { id: "overview" as ProgressSubTab, label: "Resumen" },
                    { id: "load" as ProgressSubTab, label: "Carga" },
                    { id: "history" as ProgressSubTab, label: "Historial" },
                ] as const).map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            activeTab === tab.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                        }`}
                        aria-pressed={activeTab === tab.id}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 404 empty state */}
            {isNotFoundError && (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 text-center text-sm text-muted-foreground">
                    Aún no hay datos de progreso para este cliente.
                </div>
            )}

            {/* ═══════════ OVERVIEW TAB ═══════════ */}
            {activeTab === "overview" && (
                <>
                    {/* Metric cards */}
                    {!isNotFoundError && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                title="Peso Actual"
                                value={latestWeight ? `${latestWeight} kg` : "N/A"}
                                subtitle={
                                    weightChange != null
                                        ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg${trend ? ` · ${trend}` : ""}`
                                        : undefined
                                }
                                color="blue"
                            />
                            <MetricCard
                                title="IMC Actual"
                                value={latestBmi ? latestBmi.toFixed(1) : "N/A"}
                                subtitle={bmiChange != null ? `${bmiChange >= 0 ? "+" : ""}${bmiChange.toFixed(1)}` : undefined}
                                color="green"
                            />
                            <MetricCard
                                title="Fatiga Promedio"
                                value={avgPreFatigue ? avgPreFatigue.toFixed(1) : "N/A"}
                                subtitle={`Pre: ${avgPreFatigue?.toFixed(1) ?? "—"} · Post: ${avgPostFatigue?.toFixed(1) ?? "—"}`}
                                color="orange"
                            />
                            <MetricCard
                                title="Nivel de Riesgo"
                                value={currentRiskLevel ?? "N/A"}
                                color={riskColorMap[currentRiskLevel ?? ""] ?? "blue"}
                            />
                        </div>
                    )}

                    {/* Body composition charts */}
                    {!isNotFoundError && hasBodyCompCharts && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {weightChartData.length > 0 && (
                                <div className="rounded-lg bg-surface p-5">
                                    <h3 className="mb-4 text-sm font-semibold">Evolución del Peso</h3>
                                    <div className="w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                            <LineChart data={weightChartData} margin={CHART_MARGIN}>
                                                <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={formatDateShort}
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                />
                                                <YAxis
                                                    domain={weightDomain}
                                                    width={40}
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                />
                                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelFormatter={formatDateShort} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="weight"
                                                    stroke="hsl(var(--primary))"
                                                    name="Peso (kg)"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--primary))", fill: "hsl(var(--card))" }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                                Peso (kg)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bmiChartData.length > 0 && (
                                <div className="min-w-0 rounded-lg bg-surface p-5">
                                    <h3 className="mb-4 text-sm font-semibold">Evolución del IMC</h3>
                                    <div className="w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                            <LineChart data={bmiChartData} margin={CHART_MARGIN}>
                                                <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={formatDateShort}
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                />
                                                <YAxis
                                                    domain={bmiDomain}
                                                    width={32}
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                />
                                                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelFormatter={formatDateShort} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="bmi"
                                                    stroke="hsl(var(--primary))"
                                                    name="IMC"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--primary))", fill: "hsl(var(--card))" }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                                IMC
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Fatigue & Energy charts */}
                    {!isNotFoundError && hasFatigueEnergyCharts && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {fatigueChartData.length > 0 && (
                                <div className="rounded-lg bg-surface p-5">
                                    <h3 className="mb-4 text-sm font-semibold">Análisis de Fatiga</h3>
                                    {hasFatigueData ? (
                                        <div className="w-full min-w-0">
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <ComposedChart data={fatigueChartData} margin={CHART_MARGIN}>
                                                    <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={formatDateShort}
                                                        tick={CHART_TICK_STYLE}
                                                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        width={32}
                                                        tick={CHART_TICK_STYLE}
                                                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    />
                                                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelFormatter={formatDateShort} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_fatigue"
                                                        stroke="hsl(var(--primary))"
                                                        fill="hsl(var(--primary))"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_fatigue"
                                                        stroke="hsl(var(--warning))"
                                                        fill="hsl(var(--warning))"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                                    Pre-Sesión
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--warning))" }} />
                                                    Post-Sesión
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                                            style={{ minHeight: CHART_HEIGHT }}
                                        >
                                            Sin datos de fatiga registrados.
                                        </div>
                                    )}
                                </div>
                            )}

                            {energyChartData.length > 0 && (
                                <div className="min-w-0 rounded-lg bg-surface p-5">
                                    <h3 className="mb-4 text-sm font-semibold">Niveles de Energía</h3>
                                    {hasEnergyData ? (
                                        <div className="w-full min-w-0">
                                            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                                <ComposedChart data={energyChartData} margin={CHART_MARGIN}>
                                                    <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        tickFormatter={formatDateShort}
                                                        tick={CHART_TICK_STYLE}
                                                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 10]}
                                                        ticks={[0, 2, 4, 6, 8, 10]}
                                                        width={32}
                                                        tick={CHART_TICK_STYLE}
                                                        axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                        tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    />
                                                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelFormatter={formatDateShort} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="pre_energy"
                                                        stroke="hsl(var(--primary))"
                                                        fill="hsl(var(--primary))"
                                                        fillOpacity={0.08}
                                                        strokeWidth={2}
                                                        name="Pre-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="post_energy"
                                                        stroke="hsl(var(--warning))"
                                                        fill="hsl(var(--warning))"
                                                        fillOpacity={0.06}
                                                        strokeWidth={2}
                                                        name="Post-Sesión"
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                                    Pre-Sesión
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--warning))" }} />
                                                    Post-Sesión
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                                            style={{ minHeight: CHART_HEIGHT }}
                                        >
                                            Sin datos de energía registrados.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Workload chart */}
                    {!isNotFoundError && hasWorkloadChart && (
                        <div className="rounded-lg bg-surface p-5">
                            <h3 className="mb-4 text-sm font-semibold">Carga de Trabajo y Recuperación</h3>
                            {normalizedWorkloadData.length > 0 ? (
                                <div className="w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                        <ComposedChart data={normalizedWorkloadData} margin={CHART_MARGIN}>
                                            <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={formatDateShort}
                                                tick={CHART_TICK_STYLE}
                                                axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                tickLine={{ stroke: CHART_AXIS_STROKE }}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                ticks={[0, 2, 4, 6, 8, 10]}
                                                width={32}
                                                tick={CHART_TICK_STYLE}
                                                axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                tickLine={{ stroke: CHART_AXIS_STROKE }}
                                            />
                                            <Tooltip
                                                contentStyle={CHART_TOOLTIP_STYLE}
                                                labelFormatter={formatDateShort}
                                                formatter={(value: number, name: string, props?: WorkloadTooltipPayloadItem) => {
                                                    const orig =
                                                        name === "Carga de Trabajo"
                                                            ? props?.payload?.workload_score_original
                                                            : props?.payload?.recovery_need_score_original;
                                                    return [`${value.toFixed(1)}/10 (${orig?.toFixed(1) ?? "N/A"})`, name];
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="workload_score"
                                                stroke="hsl(var(--primary))"
                                                fill="hsl(var(--primary))"
                                                fillOpacity={0.08}
                                                strokeWidth={2}
                                                name="Carga de Trabajo"
                                                isAnimationActive={false}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="recovery_need_score"
                                                stroke="hsl(var(--warning))"
                                                fill="hsl(var(--warning))"
                                                fillOpacity={0.06}
                                                strokeWidth={2}
                                                name="Necesidad de Recuperación"
                                                isAnimationActive={false}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                            Carga de Trabajo
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--warning))" }} />
                                            Necesidad de Recuperación
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                                    style={{ minHeight: CHART_HEIGHT }}
                                >
                                    Sin datos de carga de trabajo. El cliente debe completar el feedback RPE post-sesión.
                                </div>
                            )}
                        </div>
                    )}

                    {/* No chart data */}
                    {!isNotFoundError && !hasBodyCompCharts && !hasFatigueEnergyCharts && !hasWorkloadChart && (
                        <div
                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 text-center text-sm text-muted-foreground"
                            style={{ minHeight: 200 }}
                        >
                            No hay datos de progreso disponibles para este cliente.
                        </div>
                    )}
                </>
            )}

            {/* ═══════════ LOAD TAB ═══════════ */}
            {activeTab === "load" && (
                <div className="space-y-6">
                    {/* Period chips */}
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Periodo métricas">
                        {([
                            { id: "weekly" as MetricsPeriod, label: "Semanal" },
                            { id: "monthly" as MetricsPeriod, label: "Mensual" },
                            { id: "annual" as MetricsPeriod, label: "Anual" },
                        ] as const).map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setMetricsPeriod(p.id)}
                                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                    metricsPeriod === p.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                                }`}
                                aria-pressed={metricsPeriod === p.id}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* No data */}
                    {!isLoading && hasNoLoadData && (
                        <div
                            className="flex w-full min-w-0 items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground"
                            style={{ minHeight: 200 }}
                        >
                            <div>
                                <p>No hay sesiones de entrenamiento con datos de volumen/intensidad en el rango seleccionado.</p>
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    Las sesiones necesitan tener valores de volumen e intensidad para calcular métricas.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CID chart */}
                    {cidChartConfig && (
                        <div className="rounded-lg bg-surface p-5">
                            <h3 className="mb-4 text-sm font-semibold">{cidChartConfig.title}</h3>
                            <div className="w-full min-w-0">
                                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                                    <LineChart data={cidChartConfig.data} margin={CHART_MARGIN}>
                                        <CartesianGrid stroke={CHART_GRID_STROKE} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="label"
                                            tick={CHART_TICK_STYLE}
                                            axisLine={{ stroke: CHART_AXIS_STROKE }}
                                            tickLine={{ stroke: CHART_AXIS_STROKE }}
                                            interval={0}
                                        />
                                        <YAxis
                                            width={40}
                                            tick={CHART_TICK_STYLE}
                                            axisLine={{ stroke: CHART_AXIS_STROKE }}
                                            tickLine={{ stroke: CHART_AXIS_STROKE }}
                                        />
                                        <Tooltip
                                            contentStyle={CHART_TOOLTIP_STYLE}
                                            formatter={(value: number) => [value.toFixed(1), "CID"]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="cid"
                                            stroke="hsl(var(--primary))"
                                            name="CID Total"
                                            strokeWidth={2}
                                            dot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--primary))", fill: "hsl(var(--card))" }}
                                            isAnimationActive={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="avg"
                                            stroke="hsl(var(--success))"
                                            name="CID Promedio"
                                            strokeWidth={2}
                                            dot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--success))", fill: "hsl(var(--card))" }}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                                        CID Total
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" />
                                        CID Promedio
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alerts */}
                    {!isLoading && metricsAlerts.hasAlerts && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Alertas de Carga</h3>
                            {metricsAlerts.activeAlerts.map((alert, i) => {
                                const sev =
                                    alert.severity === "critical"
                                        ? { bg: "bg-destructive/10", border: "border-destructive/30", badge: "bg-destructive/10 text-destructive", label: "Crítica" }
                                        : alert.severity === "high"
                                          ? { bg: "bg-warning/10", border: "border-warning/30", badge: "bg-warning/10 text-warning", label: "Alta" }
                                          : { bg: "bg-warning/5", border: "border-warning/20", badge: "bg-warning/10 text-warning", label: "Media" };
                                return (
                                    <div key={i} className={`rounded-lg border p-4 ${sev.bg} ${sev.border}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {alert.type === "daily_high"
                                                        ? "CID Diario Alto"
                                                        : alert.type === "weekly_high"
                                                          ? "CID Semanal Alto"
                                                          : alert.type === "consecutive_high"
                                                            ? "Días Consecutivos Altos"
                                                            : alert.type}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>
                                                        Valor: <strong>{alert.value.toFixed(1)}</strong>
                                                    </span>
                                                    <span>
                                                        Umbral: <strong>{alert.threshold.toFixed(1)}</strong>
                                                    </span>
                                                    {alert.date && (
                                                        <span>{new Date(alert.date).toLocaleDateString("es-ES")}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${sev.badge}`}>
                                                {sev.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Summary metrics */}
                    {cidSummary && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <MetricCard title="CID Total" value={cidSummary.total} color="blue" />
                            <MetricCard title="CID Promedio" value={cidSummary.avg} color="green" />
                            <MetricCard
                                title="Sesiones Procesadas"
                                value={cidSummary.sessions.toString()}
                                color="blue"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ HISTORY TAB ═══════════ */}
            {activeTab === "history" && (
                <>
                    {!isNotFoundError && progressHistory && progressHistory.length > 0 ? (
                        <div className="space-y-2">
                            {progressHistory.map((record: ClientProgress) => (
                                <div
                                    key={record.id}
                                    className="flex items-center gap-4 rounded-lg bg-surface p-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(record.fecha_registro).toLocaleDateString("es-ES", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                            <span>
                                                Peso:{" "}
                                                <strong className="text-foreground">
                                                    {record.peso ? `${record.peso} kg` : "—"}
                                                </strong>
                                            </span>
                                            <span>
                                                IMC:{" "}
                                                <strong className="text-foreground">
                                                    {record.imc ? record.imc.toFixed(1) : "—"}
                                                </strong>
                                            </span>
                                        </div>
                                        {record.notas && (
                                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">
                                                {record.notas}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(record)}
                                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                        title="Editar registro"
                                        aria-label="Editar registro"
                                    >
                                        <Pencil className="h-4 w-4" aria-hidden />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isNotFoundError && (
                            <div
                                className="flex w-full items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 text-center text-sm text-muted-foreground"
                                style={{ minHeight: 200 }}
                            >
                                No hay registros de progreso aún.
                            </div>
                        )
                    )}
                </>
            )}

            {/* ═══════════ ADD PROGRESS FORM ═══════════ */}
            <div ref={formRef}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProgressForm((v) => !v)}
                    className="w-full justify-between"
                >
                    <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" aria-hidden />
                        Añadir nuevo registro de progreso
                    </span>
                    {showProgressForm ? (
                        <ChevronUp className="h-4 w-4" aria-hidden />
                    ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden />
                    )}
                </Button>
                {showProgressForm && (
                    <div className="mt-4">
                        <ProgressForm clientId={clientId} />
                    </div>
                )}
            </div>

            {/* Edit modal */}
            {selectedRecord && (
                <EditProgressModal
                    isOpen={editModalOpen}
                    onClose={handleCloseModal}
                    progressRecord={selectedRecord}
                    clientId={clientId}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export const ClientProgressTab = React.memo(ClientProgressTabComponent, arePropsEqual);

/**
 * ChartsTab.tsx — Tab «Analítica»: KPIs D1–D2–D6, gráficos D3/D7, lista D4 (modo bloques).
 *
 * Coherencia/alignment mensual (legacy) solo en sección colapsada si hay datos (L3).
 *
 * @see docs/specs/SPEC_TAB_GRAFICOS_PLAN_ENTRENAMIENTO.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
} from "recharts";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import {
    useGetTrainingPlanQuery,
    useGetTrainingPlanCoherenceQuery,
    useGetTrainingPlanAlignmentQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { computeD6AdherencePct, PLAN_ANALYTICS_SESSION_FETCH_MAX } from "@nexia/shared";
import { usePlanBlockAnalytics } from "@nexia/shared/hooks/training/usePlanBlockAnalytics";
import { MetricCard, EmptyStateCard } from "@/components/ui/cards";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";

// Shared chart styles per DESIGN.md §5.17
const CHART_TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    boxShadow: "0 8px 30px hsl(0 0% 0% / 0.35)",
};

const CHART_LEGEND_STYLE: React.CSSProperties = {
    color: "hsl(var(--muted-foreground))",
    fontSize: 12,
};

const CHART_TICK = {
    fill: "hsl(var(--muted-foreground))",
    fontSize: 12,
};

interface ChartsTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
    onGoToPlanningTab?: () => void;
}

function formatPct1(v: number | null | undefined): string {
    if (v == null || Number.isNaN(v)) return "—";
    return `${v.toFixed(1)}%`;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
    planId,
    onGoToPlanningTab,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [legacyOpen, setLegacyOpen] = useState(false);

    const handleGoToPlanningTab = useCallback(() => {
        if (onGoToPlanningTab) {
            onGoToPlanningTab();
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set("tab", "planning");
        setSearchParams(next, { replace: true });
    }, [onGoToPlanningTab, searchParams, setSearchParams]);

    const {
        data: plan,
        isLoading: planLoading,
        isError: planError,
        error: planErr,
    } = useGetTrainingPlanQuery(planId, { skip: !planId });

    const {
        analytics,
        isLoading: blockAnalyticsLoading,
        isError: blockAnalyticsError,
        error: blockAnalyticsErr,
        sessionsTruncated,
        sessionsLoaded,
        blocks,
        sessions,
    } = usePlanBlockAnalytics(planId);

    const {
        data: coherenceData,
        isLoading: coherenceLoading,
        isError: coherenceError,
        error: coherenceErr,
    } = useGetTrainingPlanCoherenceQuery(
        { planId, deviationThreshold: 20 },
        { skip: !planId }
    );

    const {
        data: alignmentData,
        isLoading: alignmentLoading,
        isError: alignmentError,
        error: alignmentErr,
    } = useGetTrainingPlanAlignmentQuery(
        { planId },
        { skip: !planId || !legacyOpen }
    );

    const hasLegacyLists =
        coherenceData != null &&
        (coherenceData.month_coherence.length > 0 ||
            coherenceData.week_coherence.length > 0 ||
            coherenceData.day_coherence.length > 0);

    const lineData = useMemo(() => {
        if (!analytics) return [];
        return analytics.d7VolumeIntensitySeries.map((row) => ({
            name: row.date,
            planVol: row.planVolume,
            planInt: row.planIntensity,
            realVol: row.realVolume,
            realInt: row.realIntensity,
        }));
    }, [analytics]);

    const barData = useMemo(() => {
        if (!analytics) return [];
        return analytics.d3WeeklyAlignment.map((w) => ({
            name: w.weekLabel,
            pct: w.pct ?? 0,
        }));
    }, [analytics]);

    const adherencePct = plan
        ? computeD6AdherencePct(plan.sessions_completed, plan.sessions_total)
        : null;

    const showBlockMode =
        blocks.length > 0 || sessions.some((s) => s.period_block_id != null);

    const noSessionsInPlan =
        plan != null &&
        plan.sessions_total === 0 &&
        sessionsLoaded === 0 &&
        sessions.length === 0;

    const isLoading =
        planLoading || blockAnalyticsLoading || (!legacyOpen && coherenceLoading);

    const blockErrorMessage =
        (blockAnalyticsErr as { data?: { detail?: string } })?.data?.detail ??
        (blockAnalyticsErr as Error)?.message;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (planError || !plan) {
        const msg =
            (planErr as { data?: { detail?: string } })?.data?.detail ??
            (planErr as Error)?.message ??
            "No se pudo cargar el plan.";
        return <Alert variant="error">{String(msg)}</Alert>;
    }

    if (blockAnalyticsError) {
        return (
            <Alert variant="error">
                {String(blockErrorMessage || "Error al cargar analítica")}
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            {!showBlockMode ? (
                <EmptyStateCard
                    icon={<BarChart3 />}
                    title={
                        noSessionsInPlan
                            ? "Sin sesiones en el plan"
                            : "Sin bloques de periodización"
                    }
                    description={
                        noSessionsInPlan
                            ? "Aún no hay sesiones en este plan."
                            : "Añade un bloque de periodización en Planificación o vincula sesiones a un bloque para ver coherencia por bloques, desviación de carga y gráficos."
                    }
                    action={
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleGoToPlanningTab}
                        >
                            Ir a Planificación
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* KPI grid — responsive 1→2→4 cols */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            title="Coherencia de bloques"
                            value={formatPct1(analytics?.d1CoherenceGlobalPct)}
                            subtitle="Sesiones que ejecutaron el volumen e intensidad planificados dentro del margen del 20%."
                            color={
                                analytics?.d1CoherenceGlobalPct == null
                                    ? "blue"
                                    : analytics.d1CoherenceGlobalPct >= 80
                                      ? "green"
                                      : analytics.d1CoherenceGlobalPct >= 60
                                        ? "orange"
                                        : "blue"
                            }
                        />
                        <MetricCard
                            title="Desviación de carga"
                            value={formatPct1(analytics?.d2LoadDeviationPct)}
                            subtitle="Diferencia media entre la carga ejecutada y la planificada por bloque. Objetivo: menos del 20%."
                            color="blue"
                        />
                        <MetricCard
                            title="Sesiones"
                            value={`${plan.sessions_completed} / ${plan.sessions_total}`}
                            subtitle="Sesiones realizadas del total planificado en el plan."
                            color="green"
                        />
                        <MetricCard
                            title="Adherencia"
                            value={formatPct1(adherencePct)}
                            subtitle="Porcentaje de sesiones completadas respecto al total del plan."
                            color={
                                adherencePct == null
                                    ? "blue"
                                    : adherencePct >= 80
                                      ? "green"
                                      : adherencePct >= 60
                                        ? "orange"
                                        : "red"
                            }
                        />
                    </div>

                    {sessionsTruncated ? (
                        <p className="text-xs text-muted-foreground">
                            Mostrando analítica con hasta {PLAN_ANALYTICS_SESSION_FETCH_MAX} sesiones
                            cargadas. Si el plan supera ese límite, los KPI pueden estar incompletos.
                        </p>
                    ) : null}

                    {analytics != null && analytics.genericWithoutDateCount > 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {analytics.genericWithoutDateCount} sesión
                            {analytics.genericWithoutDateCount === 1 ? "" : "es"} genérica
                            sin fecha no entra en gráficos temporales ni en semanas ISO.
                        </p>
                    ) : null}

                    {/* Chart: Volumen e intensidad — Surface Card */}
                    <section aria-labelledby="heading-vi-chart">
                        <div className="bg-surface rounded-lg p-5">
                            <h3
                                id="heading-vi-chart"
                                className="text-sm font-semibold text-foreground mb-4"
                            >
                                Volumen e intensidad — Plan vs real (0–10)
                            </h3>
                            {lineData.length === 0 ? (
                                <div className="border border-dashed border-border/50 bg-muted/10 rounded-lg flex items-center justify-center min-h-[250px]">
                                    <p className="text-sm text-muted-foreground">
                                        Sin puntos con fecha y bloque para este gráfico.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart
                                        data={lineData}
                                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border) / 0.45)"
                                        />
                                        <XAxis dataKey="name" tick={CHART_TICK} />
                                        <YAxis domain={[0, 10]} tick={CHART_TICK} />
                                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                        <Legend wrapperStyle={CHART_LEGEND_STYLE} />
                                        <Line
                                            type="monotone"
                                            dataKey="planVol"
                                            name="Plan volumen"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeDasharray="4 4"
                                            dot={false}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="planInt"
                                            name="Plan intensidad"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeDasharray="2 2"
                                            dot={false}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="realVol"
                                            name="Real volumen"
                                            stroke="hsl(var(--primary))"
                                            dot={{ r: 3 }}
                                            connectNulls={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="realInt"
                                            name="Real intensidad"
                                            stroke="hsl(var(--success))"
                                            dot={{ r: 3 }}
                                            connectNulls={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    {/* Chart: Alineación semanal — Surface Card */}
                    <section aria-labelledby="heading-weekly-align">
                        <div className="bg-surface rounded-lg p-5">
                            <h3
                                id="heading-weekly-align"
                                className="text-sm font-semibold text-foreground mb-4"
                            >
                                Alineación semanal (%)
                            </h3>
                            {barData.length === 0 ? (
                                <div className="border border-dashed border-border/50 bg-muted/10 rounded-lg flex items-center justify-center min-h-[250px]">
                                    <p className="text-sm text-muted-foreground">
                                        Sin semanas en el rango del plan.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={barData}
                                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border) / 0.45)"
                                        />
                                        <XAxis dataKey="name" tick={CHART_TICK} />
                                        <YAxis domain={[0, 100]} tick={CHART_TICK} />
                                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                                        <Bar dataKey="pct" name="Alineación %" fill="hsl(var(--primary))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    {/* Section: Desviaciones */}
                    <section aria-labelledby="heading-deviations">
                        <h3
                            id="heading-deviations"
                            className="text-sm font-semibold text-foreground mb-3"
                        >
                            Desviaciones (planificado vs bloque, umbral 20 %)
                        </h3>
                        {analytics == null || analytics.d4Deviations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Ninguna sesión supera el 20 % en volumen o intensidad respecto al bloque.
                            </p>
                        ) : (
                            <div className="rounded-lg border border-border bg-card overflow-hidden">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-2.5 bg-surface/50 border-b border-border">
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Sesión
                                    </span>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Fecha
                                    </span>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Desviación
                                    </span>
                                </div>
                                <ul className="divide-y divide-border">
                                    {analytics.d4Deviations.map((row) => (
                                        <li
                                            key={row.sessionId}
                                            className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-3 text-sm hover:bg-surface/50 transition-colors"
                                        >
                                            <span className="font-medium text-foreground truncate">
                                                {row.sessionName}
                                            </span>
                                            <span className="text-muted-foreground whitespace-nowrap">
                                                {row.sessionDate ?? "Sin fecha"}
                                            </span>
                                            <span className="text-warning whitespace-nowrap">
                                                {row.deviationKind === "volume"
                                                    ? `Vol +${row.volumeDeviationPct.toFixed(1)}%`
                                                    : row.deviationKind === "intensity"
                                                      ? `Int +${row.intensityDeviationPct.toFixed(1)}%`
                                                      : `Vol +${row.volumeDeviationPct.toFixed(1)}% · Int +${row.intensityDeviationPct.toFixed(1)}%`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Legacy section — colapsable per DESIGN.md §6.5 */}
            {hasLegacyLists ? (
                <section className="rounded-lg border border-border">
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 group px-4 py-3"
                        onClick={() => setLegacyOpen((o) => !o)}
                        aria-expanded={legacyOpen}
                    >
                        {legacyOpen ? (
                            <ChevronUp className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                        ) : (
                            <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                            Planificación clásica (mensual)
                        </span>
                        <div className="flex-1 border-t border-border ml-2" />
                    </button>

                    {legacyOpen ? (
                        <div className="border-t border-border p-4 space-y-6">
                            {coherenceError ? (
                                <Alert variant="error">
                                    {(coherenceErr as Error)?.message ?? "Error al cargar coherencia legacy"}
                                </Alert>
                            ) : coherenceData ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">
                                        Coherencia del plan
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <MetricCard
                                            title="Coherencia global"
                                            value={`${coherenceData.overall_coherence.toFixed(1)}%`}
                                            subtitle={`Umbral desviación: ${coherenceData.deviation_threshold}%`}
                                            color={
                                                coherenceData.overall_coherence >= 80
                                                    ? "green"
                                                    : coherenceData.overall_coherence >= 60
                                                      ? "orange"
                                                      : "red"
                                            }
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {alignmentLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <LoadingSpinner size="md" />
                                </div>
                            ) : alignmentError ? (
                                <Alert variant="error">
                                    {(alignmentErr as Error)?.message ?? "Error al cargar alignment"}
                                </Alert>
                            ) : alignmentData?.alignment_graph?.length ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Alignment</h4>
                                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-border text-sm">
                                                <thead>
                                                    <tr className="bg-surface/50">
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Nivel
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Nombre
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Fecha
                                                        </th>
                                                        <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Calidad
                                                        </th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Volumen
                                                        </th>
                                                        <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Intensidad
                                                        </th>
                                                        <th className="px-4 py-2.5 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                                            Estado
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border bg-card">
                                                    {alignmentData.alignment_graph.map((point) => {
                                                        const isOverride =
                                                            point.cycle_type === "week" ||
                                                            point.cycle_type === "day";
                                                        const typeLabel =
                                                            point.cycle_type === "month"
                                                                ? "Mes"
                                                                : point.cycle_type === "week"
                                                                  ? "Semana"
                                                                  : point.cycle_type === "day"
                                                                    ? "Día"
                                                                    : point.cycle_type;

                                                        return (
                                                            <tr
                                                                key={`${point.cycle_type}-${point.cycle_id}`}
                                                                className={`hover:bg-surface/50 transition-colors${isOverride ? " bg-primary/5" : ""}`}
                                                            >
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {typeLabel}
                                                                </td>
                                                                <td className="px-4 py-3 text-foreground">
                                                                    {point.cycle_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {point.date}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {point.physical_quality ?? "—"}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-foreground tabular-nums">
                                                                    {point.volume != null
                                                                        ? point.volume.toFixed(1)
                                                                        : "—"}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-foreground tabular-nums">
                                                                    {point.intensity != null
                                                                        ? point.intensity.toFixed(1)
                                                                        : "—"}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Badge
                                                                        variant={isOverride ? "subtle" : "outline"}
                                                                    >
                                                                        {isOverride ? "Override" : "Heredado"}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin datos de alignment.</p>
                            )}
                        </div>
                    ) : null}
                </section>
            ) : null}
        </div>
    );
};

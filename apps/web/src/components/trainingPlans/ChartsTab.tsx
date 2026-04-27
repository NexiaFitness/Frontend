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
import {
    useGetTrainingPlanQuery,
    useGetTrainingPlanCoherenceQuery,
    useGetTrainingPlanAlignmentQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { computeD6AdherencePct, PLAN_ANALYTICS_SESSION_FETCH_MAX } from "@nexia/shared";
import { usePlanBlockAnalytics } from "@nexia/shared/hooks/training/usePlanBlockAnalytics";
import { MetricCard } from "@/components/ui/cards";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";

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
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (planError || !plan) {
        const msg =
            (planErr as { data?: { detail?: string } })?.data?.detail ??
            (planErr as Error)?.message ??
            "No se pudo cargar el plan.";
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
                <p className="font-medium">Error</p>
                <p>{String(msg)}</p>
            </div>
        );
    }

    if (blockAnalyticsError) {
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
                <p className="font-medium">Error al cargar analítica</p>
                <p>{String(blockErrorMessage || "Error desconocido")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-lg font-semibold text-foreground">Analítica</h2>

            {!showBlockMode ? (
                <div
                    className="rounded-lg border border-border bg-muted/40 p-6 space-y-4"
                    role="status"
                    aria-live="polite"
                >
                    {noSessionsInPlan ? (
                        <p className="text-sm text-foreground leading-relaxed">
                            Aún no hay sesiones en este plan.
                        </p>
                    ) : (
                        <p className="text-sm text-foreground leading-relaxed">
                            Añade un bloque de periodización en Planificación o vincula sesiones a un
                            bloque para ver coherencia por bloques, desviación de carga y gráficos.
                        </p>
                    )}
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleGoToPlanningTab}
                    >
                        Ir a Planificación
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-4">
                        <MetricCard
                            title="Coherencia global (bloques)"
                            value={formatPct1(analytics?.d1CoherenceGlobalPct)}
                            subtitle="Sesiones completadas con V e I planificados dentro del 20 % respecto al bloque (U1)."
                            color={
                                (analytics?.d1CoherenceGlobalPct ?? 0) >= 80
                                    ? "green"
                                    : (analytics?.d1CoherenceGlobalPct ?? 0) >= 60
                                      ? "orange"
                                      : "blue"
                            }
                        />
                        <MetricCard
                            title="Desviación de carga (volumen)"
                            value={formatPct1(analytics?.d2LoadDeviationPct)}
                            subtitle="Media de |planificado − bloque| / bloque (volumen), todas las sesiones con bloque. Umbral referencia 20 %."
                            color="blue"
                        />
                        <MetricCard
                            title="Sesiones"
                            value={`${plan.sessions_completed} / ${plan.sessions_total}`}
                            subtitle="Completadas / planificadas (activas)."
                            color="green"
                        />
                        <MetricCard
                            title="Adherencia"
                            value={formatPct1(adherencePct)}
                            subtitle="Completadas / planificadas según el plan (D6)."
                            color={
                                (adherencePct ?? 0) >= 80
                                    ? "green"
                                    : (adherencePct ?? 0) >= 60
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
                            sin fecha no entran en gráficos temporales ni en semanas ISO.
                        </p>
                    ) : null}

                    <section aria-labelledby="heading-vi-chart">
                        <h3
                            id="heading-vi-chart"
                            className="text-md font-medium text-foreground mb-3"
                        >
                            Volumen e intensidad — Plan vs real (0–10)
                        </h3>
                        <div className="h-72 w-full rounded-lg border border-border bg-card p-2">
                            {lineData.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-4">
                                    Sin puntos con fecha y bloque para este gráfico.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                            }}
                                        />
                                        <Legend />
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

                    <section aria-labelledby="heading-weekly-align">
                        <h3
                            id="heading-weekly-align"
                            className="text-md font-medium text-foreground mb-3"
                        >
                            Alineación semanal (%)
                        </h3>
                        <div className="h-72 w-full rounded-lg border border-border bg-card p-2">
                            {barData.length === 0 ? (
                                <p className="text-sm text-muted-foreground p-4">
                                    Sin semanas en el rango del plan.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                            }}
                                        />
                                        <Bar dataKey="pct" name="Alineación %" fill="hsl(var(--primary))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section aria-labelledby="heading-deviations">
                        <h3
                            id="heading-deviations"
                            className="text-md font-medium text-foreground mb-3"
                        >
                            Desviaciones (planificado vs bloque, umbral 20 %)
                        </h3>
                        {analytics == null || analytics.d4Deviations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Ninguna sesión supera el 20 % en volumen o intensidad respecto al bloque.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
                                {analytics.d4Deviations.map((row) => (
                                    <li key={row.sessionId} className="flex flex-wrap gap-2 px-3 py-2">
                                        <span className="font-medium text-foreground">
                                            {row.sessionName}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {row.sessionDate ?? "Sin fecha"}
                                        </span>
                                        <span className="text-warning">
                                            {row.deviationKind === "volume"
                                                ? `Volumen +${row.volumeDeviationPct.toFixed(1)}%`
                                                : row.deviationKind === "intensity"
                                                  ? `Intensidad +${row.intensityDeviationPct.toFixed(1)}%`
                                                  : `Volumen +${row.volumeDeviationPct.toFixed(1)}% · Intensidad +${row.intensityDeviationPct.toFixed(1)}%`}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}

            {hasLegacyLists ? (
                <section className="rounded-lg border border-border">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
                        onClick={() => setLegacyOpen((o) => !o)}
                        aria-expanded={legacyOpen}
                    >
                        <span>Planificación clásica (mensual)</span>
                        <span className="text-muted-foreground">{legacyOpen ? "Ocultar" : "Mostrar"}</span>
                    </button>
                    {legacyOpen ? (
                        <div className="border-t border-border p-4 space-y-6">
                            {coherenceError ? (
                                <p className="text-sm text-destructive">
                                    {(coherenceErr as Error)?.message ?? "Error coherencia legacy"}
                                </p>
                            ) : coherenceData ? (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground">Coherencia del plan</h4>
                                    <div className="flex flex-wrap gap-4">
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
                                <div className="flex justify-center py-6">
                                    <LoadingSpinner size="md" />
                                </div>
                            ) : alignmentError ? (
                                <p className="text-sm text-destructive">
                                    {(alignmentErr as Error)?.message ?? "Error alignment"}
                                </p>
                            ) : alignmentData?.alignment_graph?.length ? (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">Alignment</h4>
                                    <div className="overflow-x-auto rounded-lg border border-border">
                                        <table className="min-w-full divide-y divide-border text-sm">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-foreground">
                                                        Nivel
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-foreground">
                                                        Nombre
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-foreground">
                                                        Fecha
                                                    </th>
                                                    <th className="px-3 py-2 text-left font-medium text-foreground">
                                                        Calidad
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-foreground">
                                                        Volumen
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-foreground">
                                                        Intensidad
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-medium text-foreground">
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
                                                            className={isOverride ? "bg-primary/5" : ""}
                                                        >
                                                            <td className="px-3 py-2 text-muted-foreground">
                                                                {typeLabel}
                                                            </td>
                                                            <td className="px-3 py-2 text-foreground">
                                                                {point.cycle_name}
                                                            </td>
                                                            <td className="px-3 py-2 text-muted-foreground">
                                                                {point.date}
                                                            </td>
                                                            <td className="px-3 py-2 text-muted-foreground">
                                                                {point.physical_quality ?? "—"}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-foreground">
                                                                {point.volume != null
                                                                    ? point.volume.toFixed(1)
                                                                    : "—"}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-foreground">
                                                                {point.intensity != null
                                                                    ? point.intensity.toFixed(1)
                                                                    : "—"}
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <span
                                                                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        isOverride
                                                                            ? "bg-primary/10 text-primary"
                                                                            : "bg-muted text-muted-foreground"
                                                                    }`}
                                                                >
                                                                    {isOverride ? "Override" : "Heredado"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
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

/**
 * ChartsTab.tsx — Tab de coherencia y alignment en TrainingPlanDetail (Fase 5)
 *
 * Contexto:
 * - Consume getTrainingPlanCoherence y getTrainingPlanAlignment (period-based).
 * - Muestra overall_coherence y alignment_graph; reutiliza MetricCard y layout existente.
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated Plan de cargas Fase 5 — Coherencia y alignment
 * @updated P-02 — Empty state cuando no hay baselines (mes/semana/día en 0) para no mostrar
 *   métricas en cero sin contexto; CTA a Planificación (URL o callback según contenedor).
 */

import React, { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTrainingPlanCoherence, useTrainingPlanAlignment } from "@nexia/shared/hooks/training";
import { MetricCard } from "@/components/ui/cards";
import { LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";

interface ChartsTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
    /**
     * P.ej. `TrainingPlanDetailPanel`: tabs en estado local; al pulsar Planificación debe
     * cambiar el tab del padre. Si no se pasa, se usa `?tab=planning` (página de detalle con URL).
     */
    onGoToPlanningTab?: () => void;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
    planId,
    onGoToPlanningTab,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

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
        data: coherenceData,
        isLoading: coherenceLoading,
        isError: coherenceError,
        error: coherenceErr,
    } = useTrainingPlanCoherence({ planId });

    const {
        data: alignmentData,
        isLoading: alignmentLoading,
        isError: alignmentError,
        error: alignmentErr,
    } = useTrainingPlanAlignment({ planId });

    const isLoading = coherenceLoading || alignmentLoading;
    const hasError = coherenceError || alignmentError;
    const errorMessage =
        (coherenceErr as { data?: { detail?: string } })?.data?.detail ||
        (alignmentErr as { data?: { detail?: string } })?.data?.detail ||
        (coherenceErr as Error)?.message ||
        (alignmentErr as Error)?.message;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
                <p className="font-medium">Error al cargar datos</p>
                <p>{String(errorMessage || "Error desconocido")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
                Coherencia y alignment
            </h2>

            {/* Coherencia */}
            <section>
                <h3 className="text-md font-medium text-foreground mb-3">
                    Coherencia del plan
                </h3>
                {coherenceData ? (
                    <>
                        {coherenceData.month_coherence.length === 0 &&
                        coherenceData.week_coherence.length === 0 &&
                        coherenceData.day_coherence.length === 0 ? (
                            <div
                                className="rounded-lg border border-border bg-muted/40 p-6 space-y-4"
                                role="status"
                                aria-live="polite"
                            >
                                <p className="text-sm text-foreground leading-relaxed">
                                    Este plan no tiene baselines de planificación todavía. Ve a la
                                    pestaña Planificación para crear el baseline mensual.
                                </p>
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
                        <div className="flex flex-wrap gap-4 mb-4">
                            <MetricCard
                                title="Coherencia global"
                                value={`${coherenceData.overall_coherence.toFixed(1)}%`}
                                subtitle={`Umbral desviación: ${coherenceData.deviation_threshold}%`}
                                color={coherenceData.overall_coherence >= 80 ? "green" : coherenceData.overall_coherence >= 60 ? "orange" : "red"}
                            />
                            <MetricCard
                                title="Meses"
                                value={coherenceData.month_coherence.length}
                                subtitle={`${coherenceData.month_coherence.filter((m) => m.deviation_warning).length} con desviación`}
                                color={coherenceData.month_coherence.some((m) => m.deviation_warning) ? "red" : "blue"}
                            />
                            <MetricCard
                                title="Semanas"
                                value={coherenceData.week_coherence.length}
                                subtitle={`${coherenceData.week_coherence.filter((w) => w.deviation_warning).length} con desviación`}
                                color={coherenceData.week_coherence.some((w) => w.deviation_warning) ? "red" : "blue"}
                            />
                            <MetricCard
                                title="Días"
                                value={coherenceData.day_coherence.length}
                                subtitle={`${coherenceData.day_coherence.filter((d) => d.deviation_warning).length} con desviación`}
                                color={coherenceData.day_coherence.some((d) => d.deviation_warning) ? "red" : "blue"}
                            />
                        </div>

                        {/* Detalle de desviaciones — meses */}
                        {coherenceData.month_coherence.some((m) => m.deviation_warning) && (
                            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
                                <p className="text-sm font-medium text-warning mb-2">
                                    Desviaciones mensuales (umbral {coherenceData.deviation_threshold}%)
                                </p>
                                <ul className="text-sm text-warning space-y-1">
                                    {coherenceData.month_coherence
                                        .filter((m) => m.deviation_warning)
                                        .map((m) => (
                                            <li key={m.month_plan_id} className="flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-warning" />
                                                <span className="font-medium">{m.month}</span>
                                                {m.physical_quality && <span className="text-warning/90">({m.physical_quality})</span>}
                                                <span>— coherencia {m.coherence_percentage.toFixed(1)}%</span>
                                                <span className="text-warning/90">
                                                    (vol: {m.planned_volume.toFixed(1)}, int: {m.planned_intensity.toFixed(1)})
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Detalle de desviaciones — semanas */}
                        {coherenceData.week_coherence.some((w) => w.deviation_warning) && (
                            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
                                <p className="text-sm font-medium text-warning mb-2">
                                    Desviaciones semanales
                                </p>
                                <ul className="text-sm text-warning space-y-1">
                                    {coherenceData.week_coherence
                                        .filter((w) => w.deviation_warning)
                                        .map((w) => (
                                            <li key={w.weekly_override_id} className="flex flex-wrap items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-warning" />
                                                <span className="font-medium">{w.week_id}</span>
                                                {w.physical_quality && <span className="text-warning/90">({w.physical_quality})</span>}
                                                <span>— coherencia {w.coherence_percentage.toFixed(1)}%</span>
                                                {w.inherited && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        Heredado
                                                    </span>
                                                )}
                                                <span className="text-warning/90 text-xs">
                                                    plan: V{w.planned_volume.toFixed(1)}/I{w.planned_intensity.toFixed(1)} · mes: V{w.month_volume.toFixed(1)}/I{w.month_intensity.toFixed(1)}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Detalle de desviaciones — días */}
                        {coherenceData.day_coherence.some((d) => d.deviation_warning) && (
                            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                                <p className="text-sm font-medium text-destructive mb-2">
                                    Desviaciones diarias
                                </p>
                                <ul className="text-sm text-destructive space-y-1">
                                    {coherenceData.day_coherence
                                        .filter((d) => d.deviation_warning)
                                        .map((d) => (
                                            <li key={d.daily_override_id} className="flex flex-wrap items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
                                                <span className="font-medium">{d.date ?? `Día #${d.daily_override_id}`}</span>
                                                {d.physical_quality && <span className="text-destructive/90">({d.physical_quality})</span>}
                                                <span>— coherencia {d.coherence_percentage.toFixed(1)}%</span>
                                                {d.inherited && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                        Heredado
                                                    </span>
                                                )}
                                                <span className="text-destructive/90 text-xs">
                                                    plan: V{d.planned_volume.toFixed(1)}/I{d.planned_intensity.toFixed(1)} · sem: V{d.week_volume.toFixed(1)}/I{d.week_intensity.toFixed(1)}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Sin desviaciones → mensaje positivo */}
                        {!coherenceData.month_coherence.some((m) => m.deviation_warning) &&
                         !coherenceData.week_coherence.some((w) => w.deviation_warning) &&
                         !coherenceData.day_coherence.some((d) => d.deviation_warning) &&
                         coherenceData.month_coherence.length > 0 && (
                            <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
                                Sin desviaciones. Todas las escalas de volumen e intensidad están dentro del umbral del {coherenceData.deviation_threshold}%.
                            </div>
                        )}
                            </>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Sin datos de coherencia. Añade baseline mensual y overrides en el tab Planificación.
                    </p>
                )}
            </section>

            {/* Alignment */}
            <section>
                <h3 className="text-md font-medium text-foreground mb-3">
                    Alignment
                    {alignmentData?.plan_name ? (
                        <span className="font-normal text-muted-foreground ml-2">
                            — {alignmentData.plan_name}
                        </span>
                    ) : null}
                </h3>
                {alignmentData?.alignment_graph?.length ? (
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
                                    const isOverride = point.cycle_type === "week" || point.cycle_type === "day";
                                    const typeLabel = point.cycle_type === "month"
                                        ? "Mes" : point.cycle_type === "week"
                                        ? "Semana" : point.cycle_type === "day"
                                        ? "Día" : point.cycle_type;

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
                                                {point.volume != null ? point.volume.toFixed(1) : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-right text-foreground">
                                                {point.intensity != null ? point.intensity.toFixed(1) : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isOverride
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {isOverride ? "Override" : "Heredado"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Sin datos de alignment. Añade baseline mensual en el tab Planificación.
                    </p>
                )}
            </section>
        </div>
    );
};

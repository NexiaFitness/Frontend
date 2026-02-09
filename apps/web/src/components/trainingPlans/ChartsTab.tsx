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
 */

import React from "react";
import { useTrainingPlanCoherence, useTrainingPlanAlignment } from "@nexia/shared/hooks/training";
import { MetricCard } from "@/components/ui/cards";
import { LoadingSpinner } from "@/components/ui/feedback";

interface ChartsTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
    planId,
}) => {
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
                <p className="font-medium">Error al cargar datos</p>
                <p>{String(errorMessage || "Error desconocido")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
                Coherencia y alignment
            </h2>

            {/* Coherencia */}
            <section>
                <h3 className="text-md font-medium text-gray-700 mb-3">
                    Coherencia del plan
                </h3>
                {coherenceData ? (
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
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-medium text-amber-800 mb-2">
                                    Desviaciones mensuales (umbral {coherenceData.deviation_threshold}%)
                                </p>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    {coherenceData.month_coherence
                                        .filter((m) => m.deviation_warning)
                                        .map((m) => (
                                            <li key={m.macrocycle_id} className="flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                                <span className="font-medium">{m.macrocycle_name}</span>
                                                {m.physical_quality && <span className="text-amber-600">({m.physical_quality})</span>}
                                                <span>— coherencia {m.coherence_percentage.toFixed(1)}%</span>
                                                <span className="text-amber-600">
                                                    (vol: {m.planned_volume.toFixed(1)}, int: {m.planned_intensity.toFixed(1)})
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Detalle de desviaciones — semanas */}
                        {coherenceData.week_coherence.some((w) => w.deviation_warning) && (
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-medium text-amber-800 mb-2">
                                    Desviaciones semanales
                                </p>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    {coherenceData.week_coherence
                                        .filter((w) => w.deviation_warning)
                                        .map((w) => (
                                            <li key={w.mesocycle_id} className="flex flex-wrap items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                                <span className="font-medium">{w.mesocycle_name}</span>
                                                {w.physical_quality && <span className="text-amber-600">({w.physical_quality})</span>}
                                                <span>— coherencia {w.coherence_percentage.toFixed(1)}%</span>
                                                {w.inherited && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                                        Heredado
                                                    </span>
                                                )}
                                                <span className="text-amber-600 text-xs">
                                                    plan: V{w.planned_volume.toFixed(1)}/I{w.planned_intensity.toFixed(1)} · mes: V{w.month_volume.toFixed(1)}/I{w.month_intensity.toFixed(1)}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Detalle de desviaciones — días */}
                        {coherenceData.day_coherence.some((d) => d.deviation_warning) && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm font-medium text-red-800 mb-2">
                                    Desviaciones diarias
                                </p>
                                <ul className="text-sm text-red-700 space-y-1">
                                    {coherenceData.day_coherence
                                        .filter((d) => d.deviation_warning)
                                        .map((d) => (
                                            <li key={d.microcycle_id} className="flex flex-wrap items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                                                <span className="font-medium">{d.microcycle_name ?? `Día #${d.microcycle_id}`}</span>
                                                {d.physical_quality && <span className="text-red-600">({d.physical_quality})</span>}
                                                <span>— coherencia {d.coherence_percentage.toFixed(1)}%</span>
                                                {d.inherited && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                                        Heredado
                                                    </span>
                                                )}
                                                <span className="text-red-600 text-xs">
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
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                Sin desviaciones. Todas las escalas de volumen e intensidad están dentro del umbral del {coherenceData.deviation_threshold}%.
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500">
                        Sin datos de coherencia. Añade baseline mensual y overrides en el tab Planificación.
                    </p>
                )}
            </section>

            {/* Alignment */}
            <section>
                <h3 className="text-md font-medium text-gray-700 mb-3">
                    Alignment
                    {alignmentData?.plan_name ? (
                        <span className="font-normal text-gray-600 ml-2">
                            — {alignmentData.plan_name}
                        </span>
                    ) : null}
                </h3>
                {alignmentData?.alignment_graph?.length ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                                        Nivel
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                                        Nombre
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                                        Fecha
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">
                                        Calidad
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">
                                        Volumen
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-700">
                                        Intensidad
                                    </th>
                                    <th className="px-3 py-2 text-center font-medium text-gray-700">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {alignmentData.alignment_graph.map((point) => {
                                    // Determinar si es override (mesocycle/microcycle) o heredado (macrocycle)
                                    const isOverride = point.cycle_type === "mesocycle" || point.cycle_type === "microcycle";
                                    const typeLabel = point.cycle_type === "macrocycle"
                                        ? "Mes" : point.cycle_type === "mesocycle"
                                        ? "Semana" : point.cycle_type === "microcycle"
                                        ? "Día" : point.cycle_type;

                                    return (
                                        <tr
                                            key={`${point.cycle_type}-${point.cycle_id}`}
                                            className={isOverride ? "bg-violet-50/50" : ""}
                                        >
                                            <td className="px-3 py-2 text-gray-600">
                                                {typeLabel}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                                {point.cycle_name}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {point.date}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {point.physical_quality ?? "—"}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-900">
                                                {point.volume != null ? point.volume.toFixed(1) : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-900">
                                                {point.intensity != null ? point.intensity.toFixed(1) : "—"}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isOverride
                                                        ? "bg-violet-100 text-violet-700"
                                                        : "bg-slate-100 text-slate-600"
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
                    <p className="text-sm text-gray-500">
                        Sin datos de alignment. Añade baseline mensual en el tab Planificación.
                    </p>
                )}
            </section>
        </div>
    );
};

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
                    <div className="flex flex-wrap gap-4">
                        <MetricCard
                            title="Coherencia global"
                            value={`${coherenceData.overall_coherence.toFixed(1)}%`}
                            subtitle={`Umbral desviación: ${coherenceData.deviation_threshold}%`}
                            color="green"
                        />
                        <MetricCard
                            title="Meses"
                            value={coherenceData.month_coherence.length}
                            color="blue"
                        />
                        <MetricCard
                            title="Semanas"
                            value={coherenceData.week_coherence.length}
                            color="blue"
                        />
                        <MetricCard
                            title="Días"
                            value={coherenceData.day_coherence.length}
                            color="blue"
                        />
                    </div>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {alignmentData.alignment_graph.map((point) => (
                                    <tr key={`${point.cycle_type}-${point.cycle_id}`}>
                                        <td className="px-3 py-2 text-gray-600">
                                            {point.cycle_type}
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
                                    </tr>
                                ))}
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

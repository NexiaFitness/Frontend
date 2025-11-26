/**
 * YearlyPlanningDashboard.tsx — Dashboard de planning anual
 *
 * Contexto:
 * - Dashboard completo para visualizar planning anual del cliente
 * - Muestra distribución de cualidades físicas, carga de entrenamiento, progresión mensual
 * - Basado en diseño Figma "Yearly Planning"
 * - Las 3 secciones superiores (Distribution, Physical Qualities, Training Load) están agrupadas
 *   en un único contenedor con subtítulo interno pequeño
 *
 * Responsabilidades:
 * - Cargar datos anuales con useGetClientTrainingPlanSummaryQuery
 * - Renderizar PhysicalQualitiesPieChart y PhysicalQualitiesList
 * - Renderizar TrainingLoadSliders con valores numéricos
 * - Renderizar ProgressionChart (yearly)
 * - Renderizar TrainingPlanSummaryCard
 * - Manejar estados: loading, error, empty
 *
 * Notas de mantenimiento:
 * - El subtítulo "Yearly Planning" y la fecha están DENTRO del contenedor principal (pequeños)
 * - Las 3 secciones superiores comparten un mismo fondo blanco (card única)
 * - Mantener estructura de 3 columnas: 3/10 + 3/10 + 4/10
 * - TrainingLoadSliders ya incluye su propia card interna (quitar título duplicado)
 * - Fecha formateada como "January 2025" (mes completo + año)
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v5.1.0 - Subtítulo pequeño + fecha separada para coincidir con Figma
 */

import React from "react";
import { useGetClientTrainingPlanSummaryQuery } from "@nexia/shared/api/clientsApi";
import type { ClientTrainingPlanSummary } from "@nexia/shared/types/trainingAnalytics";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { ChartCard } from "@/components/ui/cards";
import { TYPOGRAPHY } from "@/utils/typography";
import { PhysicalQualitiesPieChart } from "./PhysicalQualitiesPieChart";
import { PhysicalQualitiesList } from "./PhysicalQualitiesList";
import { TrainingLoadSliders } from "./TrainingLoadSliders";
import { ProgressionChart } from "./ProgressionChart";
import { TrainingPlanSummaryCard } from "./TrainingPlanSummaryCard";

export interface YearlyPlanningDashboardProps {
    clientId: number;
    year?: number; // Default: current year
}

const generateSummaryDescription = (data?: ClientTrainingPlanSummary): string => {
    if (!data) return "";

    const adherence = data.summary.adherence_rate;
    const plan = data.plan_name || "plan de entrenamiento";

    if (adherence >= 80) {
        return `El cliente está progresando a través del ${plan} con excelente consistencia (${adherence.toFixed(0)}%). ¡Sigue así!`;
    } else if (adherence >= 60) {
        return `El cliente muestra buena adherencia (${adherence.toFixed(0)}%) al ${plan}. Considera estrategias para mejorar la consistencia.`;
    } else {
        return `La adherencia del cliente está por debajo del objetivo (${adherence.toFixed(0)}%). Programa una reunión para discutir barreras y ajustes.`;
    }
};

export const YearlyPlanningDashboard: React.FC<YearlyPlanningDashboardProps> = ({
    clientId,
    year,
}) => {
    const currentYear = year || new Date().getFullYear();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetClientTrainingPlanSummaryQuery({
        clientId,
        year: currentYear,
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (isError) {
        const errorMessage =
            error && typeof error === "object" && "data" in error
                ? String((error as { data: unknown }).data)
                : "Error al cargar los datos del planning anual";

        return (
            <div className="p-6">
                <Alert variant="error">{errorMessage}</Alert>
            </div>
        );
    }

    // Empty state (no plan activo)
    if (!data || !data.has_active_plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    No hay Plan de Entrenamiento Activo
                </h3>
                <p className="text-slate-500 max-w-md">
                    Este cliente no tiene un plan de entrenamiento activo para {currentYear}. Crea un plan
                    para ver los análisis de planning anual.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* CONTENEDOR ÚNICO - Agrupa subtítulo + 3 secciones superiores */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Subtítulo grande y en negrita + Fecha (DENTRO del contenedor) */}
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Planning Anual
                    </h2>
                    <span className="text-sm text-slate-500">
                        {currentYear}
                    </span>
                </div>

                {/* 3 secciones: Distribution + Physical Qualities + Training Load */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 p-6">
                    {/* Distribution Pie Chart (3/10) */}
                    <div className="lg:col-span-3 space-y-3 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                            Distribución
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-[300px]">
                                <PhysicalQualitiesPieChart qualities={data.physical_qualities || []} />
                            </div>
                        </div>
                    </div>

                    {/* Physical Qualities List (3/10) */}
                    <div className="lg:col-span-3 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                            Cualidades Físicas
                        </h3>
                        <PhysicalQualitiesList
                            qualities={data.physical_qualities || []}
                            editable={false}
                        />
                    </div>

                    {/* Training Load Sliders (4/10) */}
                    <div className="lg:col-span-4 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                            Carga de Entrenamiento
                        </h3>
                        <TrainingLoadSliders
                            volumeLevel={data.training_load?.volume_level || 0}
                            intensityLevel={data.training_load?.intensity_level || 0}
                            readOnly={true}
                            showTitle={false}
                        />
                    </div>
                </div>
            </div>

            {/* Progression Chart */}
            <ChartCard title="Progresión Anual">
                {data.yearly_progression && data.yearly_progression.length > 0 ? (
                    <ProgressionChart
                        data={data.yearly_progression}
                        type="yearly"
                        height={300}
                    />
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-500">
                        No hay datos de progresión anual disponibles
                    </div>
                )}
            </ChartCard>

            {/* Summary Card */}
            <TrainingPlanSummaryCard
                stats={
                    data.summary || {
                        total_sessions_planned: 0,
                        sessions_completed: 0,
                        adherence_rate: 0,
                    }
                }
                description={generateSummaryDescription(data)}
            />
        </div>
    );
};
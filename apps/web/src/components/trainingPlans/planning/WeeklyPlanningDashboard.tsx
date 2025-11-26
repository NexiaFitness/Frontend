/**
 * WeeklyPlanningDashboard.tsx — Dashboard de planning semanal
 *
 * Contexto:
 * - Dashboard completo para visualizar planning semanal del cliente
 * - Muestra distribución de cualidades físicas, carga de entrenamiento, progresión diaria
 * - Basado en diseño Figma "Weekly Planning"
 *
 * Responsabilidades:
 * - Cargar datos semanales con useGetClientTrainingPlanWeeklySummaryQuery
 * - Renderizar PhysicalQualitiesPieChart
 * - Renderizar PhysicalQualitiesList
 * - Renderizar TrainingLoadSliders
 * - Renderizar ProgressionChart (weekly - días)
 * - Renderizar TrainingPlanSummaryCard
 * - Manejar estados: loading, error, empty
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";
import { useGetClientTrainingPlanWeeklySummaryQuery } from "@nexia/shared/api/clientsApi";
import type { TrainingPlanWeeklySummary } from "@nexia/shared/types/trainingAnalytics";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { ChartCard } from "@/components/ui/cards";
import { TYPOGRAPHY } from "@/utils/typography";
import { PhysicalQualitiesPieChart } from "./PhysicalQualitiesPieChart";
import { PhysicalQualitiesList } from "./PhysicalQualitiesList";
import { TrainingLoadSliders } from "./TrainingLoadSliders";
import { ProgressionChart } from "./ProgressionChart";
import { TrainingPlanSummaryCard } from "./TrainingPlanSummaryCard";

export interface WeeklyPlanningDashboardProps {
    clientId: number;
    weekStart?: string; // YYYY-MM-DD, default: current week (Monday)
    trainerId?: number; // Optional trainer ID
}

/**
 * Get Monday of current week in YYYY-MM-DD format
 */
const getCurrentWeekStart = (): string => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Format week range as "Semana del 20 - 26 de enero, 2025"
 */
const formatWeekRange = (start?: string, end?: string): string => {
    if (!start || !end) return "Semana Actual";

    try {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const monthNames = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre",
        ];

        const startMonth = monthNames[startDate.getMonth()];
        const startDay = startDate.getDate();
        const endMonth = monthNames[endDate.getMonth()];
        const endDay = endDate.getDate();
        const year = endDate.getFullYear();

        // If same month: "Semana del 20 - 26 de enero, 2025"
        if (startDate.getMonth() === endDate.getMonth()) {
            return `Semana del ${startDay} - ${endDay} de ${startMonth}, ${year}`;
        }

        // Different months: "Semana del 30 de enero - 5 de febrero, 2025"
        return `Semana del ${startDay} de ${startMonth} - ${endDay} de ${endMonth}, ${year}`;
    } catch {
        return "Semana Actual";
    }
};

const generateSummaryDescription = (data?: TrainingPlanWeeklySummary): string => {
    if (!data) return "";

    const adherence = data.summary.adherence_rate;
    const plan = data.plan_name || "plan de entrenamiento";
    const weekRange = formatWeekRange(data.week_start, data.week_end);

    if (adherence >= 80) {
        return `El cliente está progresando a través de ${weekRange} con excelente consistencia (${adherence.toFixed(0)}%) en el ${plan}. ¡Sigue así!`;
    } else if (adherence >= 60) {
        return `El cliente muestra buena adherencia (${adherence.toFixed(0)}%) al ${plan} para ${weekRange}. Considera estrategias para mejorar la consistencia.`;
    } else {
        return `La adherencia del cliente está por debajo del objetivo (${adherence.toFixed(0)}%) para ${weekRange}. Programa una reunión para discutir barreras y ajustes.`;
    }
};

export const WeeklyPlanningDashboard: React.FC<WeeklyPlanningDashboardProps> = ({
    clientId,
    weekStart,
    trainerId,
}) => {
    const currentWeekStart = weekStart || getCurrentWeekStart();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetClientTrainingPlanWeeklySummaryQuery({
        clientId,
        weekStart: currentWeekStart,
        trainerId,
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
                : "Error al cargar los datos del planning semanal";

        return (
            <div className="p-6">
                <Alert variant="error">{errorMessage}</Alert>
            </div>
        );
    }

    // Empty state (no plan activo)
    if (!data || !data.has_active_plan) {
        const weekRange = formatWeekRange(data?.week_start, data?.week_end);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    No hay Plan de Entrenamiento Activo
                </h3>
                <p className="text-slate-500 max-w-md">
                    Este cliente no tiene un plan de entrenamiento activo para {weekRange}. Crea un
                    plan para ver los análisis de planning semanal.
                </p>
            </div>
        );
    }

    const weekRange = formatWeekRange(data.week_start, data.week_end);

    return (
        <div className="space-y-8">
            {/* CONTENEDOR ÚNICO - Agrupa subtítulo + 3 secciones superiores */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Subtítulo grande y en negrita + Fecha (DENTRO del contenedor) */}
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Planning Semanal
                    </h2>
                    <span className="text-sm text-slate-500">
                        {weekRange}
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
            <ChartCard title="Progresión Semanal">
                {data.daily_progression && data.daily_progression.length > 0 ? (
                    <ProgressionChart
                        data={data.daily_progression}
                        type="weekly"
                        height={300}
                    />
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-500">
                        No hay datos de progresión semanal disponibles
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


/**
 * useCoherence.ts — Hook para datos de Daily Coherence
 *
 * Contexto:
 * - Encapsula lógica de transformación de datos de coherence
 * - Usa RTK Query para consumir endpoint real del backend
 * - Transforma datos del backend (snake_case) a formato frontend (camelCase)
 * - Prepara datos para gráficos y visualizaciones
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.4.0 - Reemplazado mock por RTK Query
 */

import { useMemo } from "react";
import { useGetClientCoherenceQuery } from "../../api/clientsApi";
import type {
    CoherenceData,
    PrescribedPerceivedData,
    MonotonyWeekData,
    StrainWeekData,
    DailyCoherenceAnalyticsOut,
} from "../../types/coherence";
import type {
    AdherenceChartData,
    IntensityScatterData,
} from "../../types/charts";

export interface UseCoherenceReturn {
    data: CoherenceData;
    adherenceData: AdherenceChartData[];
    scatterData: IntensityScatterData[];
    idealLineData: IntensityScatterData[];
    monotonyThresholdData: MonotonyWeekData[];
    colors: readonly string[];
    isLoading: boolean;
    isError: boolean;
}

/**
 * Transforma datos del backend al formato esperado por el componente
 */
const transformBackendData = (
    backendData: DailyCoherenceAnalyticsOut
): CoherenceData => {
    // Calcular sessions_completed y sessions_total desde adherence_data
    // El backend no proporciona estos valores directamente, los estimamos desde adherence_percentage
    const adherencePercentage = backendData.kpis.adherence_percentage;
    // Estimación: asumimos que si adherence es 80%, significa 4 de 5 sesiones
    // Esto es una aproximación, el backend debería proporcionar estos valores
    const estimatedTotal = 5; // Valor por defecto
    const estimatedCompleted = Math.round((adherencePercentage / 100) * estimatedTotal);

    // Transformar srpe_scatter_data a prescribed_vs_perceived
    const prescribedVsPerceived: PrescribedPerceivedData[] =
        backendData.srpe_scatter_data.map((point) => ({
            prescribed: point.prescribed_srpe,
            perceived: point.perceived_srpe,
        }));

    // Transformar monotony_strain_data a monotony_by_week
    const monotonyByWeek: MonotonyWeekData[] = backendData.monotony_strain_data.map(
        (item, index) => ({
            week: `W${index + 1}`, // Formato simplificado
            monotony: item.monotony,
        })
    );

    // Transformar monotony_strain_data a strain_by_week
    const strainByWeek: StrainWeekData[] = backendData.monotony_strain_data.map(
        (item, index) => ({
            week: `W${index + 1}`, // Formato simplificado
            load: item.weekly_load,
            strain: item.strain,
        })
    );

    return {
        adherence_percentage: backendData.kpis.adherence_percentage,
        sessions_completed: estimatedCompleted,
        sessions_total: estimatedTotal,
        average_srpe: backendData.kpis.average_srpe,
        monotony: backendData.kpis.monotony,
        strain: backendData.kpis.strain,
        prescribed_vs_perceived: prescribedVsPerceived,
        monotony_by_week: monotonyByWeek,
        strain_by_week: strainByWeek,
        summary: backendData.interpretive_summary,
        recommendations: backendData.key_recommendations,
    };
};

/**
 * Calcula el rango de fechas de la semana actual (lunes a domingo)
 * Retorna { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
const getCurrentWeekRange = (): { start: string; end: string } => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // Calcular lunes de la semana actual
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retroceder 6 días
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Calcular domingo de la semana actual
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Formatear como YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(monday),
        end: formatDate(sunday),
    };
};

/**
 * Hook para obtener y transformar datos de coherence
 * @param clientId - ID del cliente
 * @param week - Semana en formato ISO (opcional, ej: "2025-W03"). Si no se proporciona, usa la semana actual
 * @param periodStart - Fecha inicio en formato YYYY-MM-DD (opcional)
 * @param periodEnd - Fecha fin en formato YYYY-MM-DD (opcional)
 * @param periodType - Tipo de período: "week", "month" o "training_block" (default: "week")
 * @returns Datos transformados listos para usar en gráficos
 */
export const useCoherence = (
    clientId: number,
    week?: string,
    periodStart?: string,
    periodEnd?: string,
    periodType: "week" | "month" | "training_block" = "week"
): UseCoherenceReturn => {
    // Si no se proporciona week ni periodStart/periodEnd, usar semana actual
    const weekRange = !week && !periodStart && !periodEnd ? getCurrentWeekRange() : null;
    const effectivePeriodStart = periodStart || weekRange?.start;
    const effectivePeriodEnd = periodEnd || weekRange?.end;

    const { data: backendData, isLoading, isError } = useGetClientCoherenceQuery(
        {
            clientId,
            week,
            periodStart: effectivePeriodStart,
            periodEnd: effectivePeriodEnd,
            periodType,
        },
        {
            refetchOnMountOrArgChange: true,
            refetchOnFocus: false,
            refetchOnReconnect: true,
        }
    );

    // Transformar datos del backend al formato esperado
    const data: CoherenceData = useMemo(() => {
        if (!backendData) {
            // Valores por defecto mientras carga
            return {
                adherence_percentage: 0,
                sessions_completed: 0,
                sessions_total: 0,
                average_srpe: 0,
                monotony: 0,
                strain: 0,
                prescribed_vs_perceived: [],
                monotony_by_week: [],
                strain_by_week: [],
                summary: "",
                recommendations: [],
            };
        }
        return transformBackendData(backendData);
    }, [backendData]);

    // Datos para donut chart de adherence
    const adherenceData: AdherenceChartData[] = useMemo(
        () => [
            { name: "Completadas", value: data.sessions_completed },
            { name: "Pendientes", value: data.sessions_total - data.sessions_completed },
        ],
        [data.sessions_completed, data.sessions_total]
    );

    // Datos para scatter plot (prescribed vs perceived)
    const scatterData: IntensityScatterData[] = useMemo(
        () =>
            data.prescribed_vs_perceived.map((item: PrescribedPerceivedData, index: number) => ({
                x: item.prescribed,
                y: item.perceived,
                session: `Sesión ${index + 1}`,
            })),
        [data.prescribed_vs_perceived]
    );

    // Datos para línea de referencia ideal (y=x) en scatter plot
    const idealLineData: IntensityScatterData[] = useMemo(
        () => [
            { x: 0, y: 0, session: "Inicio" },
            { x: 10, y: 10, session: "Fin" },
        ],
        []
    );

    // Datos para línea de umbral de monotonía (2.0)
    const monotonyThresholdData: MonotonyWeekData[] = useMemo(
        () =>
            data.monotony_by_week.map((week: MonotonyWeekData) => ({
                week: week.week,
                monotony: 2.0,
            })),
        [data.monotony_by_week]
    );

    // Colores para gráficos
    const colors: readonly string[] = ["#4A67B3", "#94a3b8", "#ef4444", "#f59e0b"] as const;

    return {
        data,
        adherenceData,
        scatterData,
        idealLineData,
        monotonyThresholdData,
        colors,
        isLoading,
        isError,
    };
};


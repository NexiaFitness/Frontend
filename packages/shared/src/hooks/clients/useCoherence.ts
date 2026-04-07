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
 * @updated v5.6.0 - Skip si training_block sin ventana (period_start+period_end o week); evita 400
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
    /** True cuando la query RTK va en skip (p. ej. training_block sin fechas válidas o clientId inválido). */
    isQuerySkipped: boolean;
}

/**
 * Formatea period_start en etiqueta legible según period_type
 * Frontend controla la presentación (no confía en period_label del backend)
 */
const formatPeriodLabel = (
    periodStart: string,
    periodType: "week" | "month" | "training_block" | "year",
    index: number
): string => {
    try {
        const date = new Date(periodStart);
        
        switch (periodType) {
            case "week":
                // Vista semanal: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
                const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                return dayNames[date.getDay()];
            
            case "month":
                // Vista mensual: S1, S2, S3, S4, S5 (semanas del mes)
                // Calcular semana del mes basado en el día
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const dayOfMonth = date.getDate();
                const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
                return `S${weekOfMonth}`;
            
            case "year":
                // Vista anual: Ene, Feb, Mar, Abr, etc.
                const monthNames = [
                    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
                ];
                return monthNames[date.getMonth()];
            
            case "training_block":
                // Para training_block, usar S1, S2, etc. (similar a month)
                return `S${index + 1}`;
            
            default:
                return periodStart;
        }
    } catch {
        // Fallback si hay error parseando la fecha
        return periodStart;
    }
};

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

    // Helper: Completar datos faltantes para mostrar todos los períodos en el eje X
    const completePeriodData = <T extends { week: string }>(
        data: T[],
        periodType: "week" | "month" | "training_block" | "year",
        periodStart: string,
        periodEnd: string,
        getDefaultValue: (label: string, index: number) => T
    ): T[] => {
        if (periodType === "week") {
            // Generar todos los días de la semana (Lun-Dom) basado en period_start
            const startDate = new Date(periodStart);
            const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
            const completeData: T[] = [];
            
            // Crear un mapa de datos existentes por label del día
            const dataMap = new Map<string, T>();
            data.forEach((item) => {
                dataMap.set(item.week, item);
            });
            
            // Generar los 7 días de la semana
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const dayIndex = currentDate.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
                const dayLabel = dayNames[dayIndex];
                
                const existingData = dataMap.get(dayLabel);
                if (existingData) {
                    completeData.push(existingData);
                } else {
                    completeData.push(getDefaultValue(dayLabel, i));
                }
            }
            return completeData;
        } else if (periodType === "year") {
            // Generar todos los meses del año (Ene-Dic)
            const monthNames = [
                "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
            ];
            const completeData: T[] = [];
            
            // Crear un mapa de datos existentes por mes
            const dataMap = new Map<string, T>();
            data.forEach((item) => {
                const monthIndex = monthNames.indexOf(item.week);
                if (monthIndex !== -1) {
                    dataMap.set(item.week, item);
                }
            });
            
            // Generar los 12 meses
            for (let month = 0; month < 12; month++) {
                const monthLabel = monthNames[month];
                const existingData = dataMap.get(monthLabel);
                
                if (existingData) {
                    completeData.push(existingData);
                } else {
                    completeData.push(getDefaultValue(monthLabel, month));
                }
            }
            return completeData;
        }
        
        // Para month y training_block, devolver datos tal cual
        return data;
    };

    // Transformar monotony_strain_data a monotony_by_week
    // Frontend controla las etiquetas según period_type
    const monotonyByWeekRaw: MonotonyWeekData[] = backendData.monotony_strain_data
        .filter((item) => item.monotony !== null && item.monotony !== undefined && !isNaN(item.monotony))
        .map((item, index) => {
            const readableLabel = formatPeriodLabel(
                item.period_start,
                backendData.period_type,
                index
            );
            const monotonyValue =
                typeof item.monotony === "number" && item.monotony > 10 ? 10 : item.monotony;
            return {
                week: readableLabel,
                monotony: monotonyValue,
            };
        });

    // Completar datos faltantes para semana y año
    // Usar 0 para períodos sin datos: línea continua (mejor UX) y todos los períodos visibles en eje X
    const monotonyByWeek = completePeriodData(
        monotonyByWeekRaw,
        backendData.period_type,
        backendData.period_start,
        backendData.period_end,
        (label) => ({ week: label, monotony: 0 })
    );

    // Transformar monotony_strain_data a strain_by_week
    // Frontend controla las etiquetas según period_type
    const strainByWeekRaw: StrainWeekData[] = backendData.monotony_strain_data
        .filter(
            (item) =>
                item.period_load !== null &&
                item.period_load !== undefined &&
                !isNaN(item.period_load) &&
                item.strain !== null &&
                item.strain !== undefined &&
                !isNaN(item.strain) &&
                item.cumulative_strain !== null &&
                item.cumulative_strain !== undefined &&
                !isNaN(item.cumulative_strain)
        )
        .map((item, index) => {
            const readableLabel = formatPeriodLabel(
                item.period_start,
                backendData.period_type,
                index
            );
            return {
                week: readableLabel,
                load: item.period_load,
                strain: item.strain,
                cumulative_strain: item.cumulative_strain,
            };
        });

    // Completar datos faltantes para semana y año
    // Usar 0 para períodos sin datos: línea continua (mejor UX) y todos los períodos visibles en eje X
    const strainByWeek = completePeriodData(
        strainByWeekRaw,
        backendData.period_type,
        backendData.period_start,
        backendData.period_end,
        (label) => ({ week: label, load: 0, strain: 0, cumulative_strain: 0 })
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
 * Calcula el rango de fechas del mes actual (primer día a último día)
 * Retorna { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
const getCurrentMonthRange = (): { start: string; end: string } => {
    const now = new Date();
    
    // Primer día del mes
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    
    // Último día del mes
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    // Formatear como YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
    };
};

/**
 * Calcula el rango de fechas del año actual (1 enero a 31 diciembre)
 * Retorna { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 */
const getCurrentYearRange = (): { start: string; end: string } => {
    const now = new Date();
    
    // Primer día del año
    const firstDay = new Date(now.getFullYear(), 0, 1);
    firstDay.setHours(0, 0, 0, 0);
    
    // Último día del año
    const lastDay = new Date(now.getFullYear(), 11, 31);
    lastDay.setHours(23, 59, 59, 999);
    
    // Formatear como YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
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
    periodType: "week" | "month" | "training_block" | "year" = "week"
): UseCoherenceReturn => {
    // Memoizar cálculos de fechas para evitar recálculos innecesarios
    // Solo se recalcula cuando cambia periodType
    const dateRanges = useMemo(() => {
        if (periodType === "month") {
            return getCurrentMonthRange();
        } else if (periodType === "week") {
            return getCurrentWeekRange();
        } else if (periodType === "year") {
            return getCurrentYearRange();
        }
        return { start: "", end: "" };
    }, [periodType]);

    // Si no se proporciona week ni periodStart/periodEnd, usar rangos memoizados
    const effectivePeriodStart = periodStart || (dateRanges.start || undefined);
    const effectivePeriodEnd = periodEnd || (dateRanges.end || undefined);

    const hasWeek = Boolean(week?.trim());
    const hasDateRange =
        Boolean(effectivePeriodStart?.trim()) && Boolean(effectivePeriodEnd?.trim());
    const hasValidBackendWindow = hasWeek || hasDateRange;
    const skipForTrainingBlock = periodType === "training_block" && !hasValidBackendWindow;
    const skipQuery = clientId <= 0 || skipForTrainingBlock;

    const { data: backendData, isLoading, isError } = useGetClientCoherenceQuery(
        {
            clientId,
            week,
            periodStart: effectivePeriodStart,
            periodEnd: effectivePeriodEnd,
            periodType,
        },
        {
            skip: skipQuery,
            refetchOnMountOrArgChange: 30, // Refetch solo si los datos tienen más de 30 segundos
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
        isLoading: skipQuery ? false : isLoading,
        isError: skipQuery ? false : isError,
        isQuerySkipped: skipQuery,
    };
};


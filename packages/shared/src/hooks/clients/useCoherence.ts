/**
 * useCoherence.ts — Hook para datos de Daily Coherence
 *
 * Contexto:
 * - Encapsula lógica de transformación de datos de coherence
 * - Usa mock data temporalmente hasta que backend implemente endpoint
 * - Prepara datos para gráficos y visualizaciones
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import { useMemo } from "react";
import { MOCK_COHERENCE_DATA } from "../../mocks/coherenceMockData";
import type {
    CoherenceData,
    PrescribedPerceivedData,
    MonotonyWeekData,
    StrainWeekData,
} from "../../types/coherence";
import type {
    AdherenceChartData,
    IntensityScatterData,
} from "../../types/charts";

interface UseCoherenceReturn {
    data: CoherenceData;
    adherenceData: AdherenceChartData[];
    scatterData: IntensityScatterData[];
    idealLineData: IntensityScatterData[];
    monotonyThresholdData: MonotonyWeekData[];
    colors: readonly string[];
}

/**
 * Hook para obtener y transformar datos de coherence
 * @param clientId - ID del cliente
 * @returns Datos transformados listos para usar en gráficos
 */
export const useCoherence = (clientId: number): UseCoherenceReturn => {
    const data = MOCK_COHERENCE_DATA;

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
    };
};


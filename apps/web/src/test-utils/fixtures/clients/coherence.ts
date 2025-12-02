/**
 * Coherence Fixtures - Factory para generar datos de coherencia
 *
 * Alineado 100% con DailyCoherenceAnalyticsOut de packages/shared/src/types/coherence.ts
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { DailyCoherenceAnalyticsOut } from "@nexia/shared/types/coherence";

export const createMockCoherenceData = (overrides: Partial<DailyCoherenceAnalyticsOut> = {}): DailyCoherenceAnalyticsOut => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes de esta semana
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo

    return {
        client_id: 1,
        period_start: weekStart.toISOString().split('T')[0],
        period_end: weekEnd.toISOString().split('T')[0],
        period_type: "week",
        kpis: {
            adherence_percentage: 85,
            average_srpe: 7.5,
            monotony: 1.8,
            strain: 12.5,
        },
        adherence_data: [
            { period: "Lun", adherence: 100 },
            { period: "Mar", adherence: 80 },
            { period: "Mié", adherence: 90 },
            { period: "Jue", adherence: 85 },
            { period: "Vie", adherence: 75 },
            { period: "Sáb", adherence: 0 },
            { period: "Dom", adherence: 0 },
        ],
        srpe_scatter_data: [
            { prescribed_srpe: 7, perceived_srpe: 7.5, session_date: weekStart.toISOString().split('T')[0], session_id: 1 },
            { prescribed_srpe: 8, perceived_srpe: 8.2, session_date: new Date(weekStart.getTime() + 86400000).toISOString().split('T')[0], session_id: 2 },
        ],
        monotony_strain_data: [
            {
                period_start: weekStart.toISOString().split('T')[0],
                period_label: "Lun",
                monotony: 1.5,
                strain: 10.5,
                period_load: 7.0,
                cumulative_strain: 10.5,
            },
            {
                period_start: new Date(weekStart.getTime() + 86400000).toISOString().split('T')[0],
                period_label: "Mar",
                monotony: 1.8,
                strain: 12.6,
                period_load: 7.0,
                cumulative_strain: 23.1,
            },
        ],
        interpretive_summary: "Adherencia buena con monotonía controlada.",
        key_recommendations: [
            "Mantener variabilidad en la carga",
            "Monitorear recuperación",
        ],
        ...overrides,
    };
};


/**
 * Fatigue Fixtures - Factory para generar datos de fatiga
 *
 * Alineado 100% con FatigueAnalysis de packages/shared/src/types/training.ts
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { FatigueAnalysis } from "@nexia/shared/types/training";

export const createMockFatigueAnalysis = (overrides: Partial<FatigueAnalysis> = {}): FatigueAnalysis => ({
    id: 1,
    client_id: 1,
    session_id: 1,
    session_type: "training",
    analysis_date: new Date().toISOString().split('T')[0],
    pre_fatigue_level: 3,
    pre_energy_level: 7,
    pre_motivation_level: 8,
    pre_sleep_quality: 7,
    pre_stress_level: 4,
    pre_muscle_soreness: "Baja",
    post_fatigue_level: 6,
    post_energy_level: 5,
    post_motivation_level: 9,
    post_muscle_soreness: "Media",
    fatigue_delta: 3,
    energy_delta: -2,
    workload_score: 7.5,
    recovery_need_score: 6.0,
    risk_level: "low",
    recommendations: "Recuperación adecuada",
    next_session_adjustment: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    ...overrides,
});


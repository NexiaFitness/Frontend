/**
 * Progress Fixtures - Factory para generar datos de progreso
 *
 * Alineado 100% con ClientProgress y ProgressAnalytics de packages/shared/src/types/progress.ts
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { ClientProgress, ProgressAnalytics } from "@nexia/shared/types/progress";

export const createMockProgress = (overrides: Partial<ClientProgress> = {}): ClientProgress => ({
    id: 1,
    client_id: 1,
    fecha_registro: new Date().toISOString().split('T')[0],
    peso: 80,
    altura: 180,
    unidad: "metric",
    imc: 24.7,
    notas: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    ...overrides,
});

export const createMockProgressAnalytics = (overrides: Partial<ProgressAnalytics> = {}): ProgressAnalytics => ({
    client_id: 1,
    total_records: 5,
    first_record_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    latest_record_date: new Date().toISOString().split('T')[0],
    weight_change_kg: 2.5,
    bmi_change: 0.8,
    progress_trend: "gaining_weight",
    progress_records: [
        {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 77.5,
            height: 180,
            bmi: 23.9,
            notes: null,
        },
        {
            date: new Date().toISOString().split('T')[0],
            weight: 80,
            height: 180,
            bmi: 24.7,
            notes: null,
        },
    ],
    ...overrides,
});


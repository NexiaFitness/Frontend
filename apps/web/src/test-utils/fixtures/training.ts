/**
 * Training Fixtures - Mocks para tests de planes de entrenamiento.
 *
 * Tipos alineados con @nexia/shared/types/training.
 * Usado por ClientPlanningTab, ClientOverviewTab y tests de planning.
 *
 * @author Frontend Team
 * @since Fase 7
 */

import type { TrainingPlan } from "@nexia/shared/types/training";

const now = new Date().toISOString();

export function createMockTrainingPlan(
    overrides: Partial<TrainingPlan> = {}
): TrainingPlan {
    return {
        id: 1,
        trainer_id: 1,
        client_id: 1,
        name: "Plan Test",
        description: "Descripcion de plan de prueba",
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        goal: "Strength",
        status: "active",
        is_active: true,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

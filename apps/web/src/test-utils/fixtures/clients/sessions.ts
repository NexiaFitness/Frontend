/**
 * Sessions Fixtures - Factory para generar datos de sesiones de entrenamiento
 *
 * Alineado 100% con TrainingSession de packages/shared/src/types/training.ts
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { TrainingSession } from "@nexia/shared/types/training";

export const createMockTrainingSession = (overrides: Partial<TrainingSession> = {}): TrainingSession => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return {
        id: 1,
        microcycle_id: null,
        client_id: 1,
        trainer_id: 1,
        session_date: tomorrow.toISOString().split('T')[0], // Próxima sesión
        session_name: "Entrenamiento de Fuerza",
        session_type: "strength",
        training_day_number: null,
        is_generic_session: false,
        planned_duration: 60,
        actual_duration: null,
        planned_intensity: 7,
        planned_volume: 8,
        actual_intensity: null,
        actual_volume: null,
        status: "scheduled",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        ...overrides,
    };
};


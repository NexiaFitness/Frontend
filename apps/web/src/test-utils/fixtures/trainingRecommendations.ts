/**
 * Fixtures GET /training-plans/recommendations/{client_id}
 * Alineados con TrainingPlanRecommendationsResponse (BE crud recommendations).
 */

import type {
    TrainingPlanRecommendationsComplete,
    TrainingPlanRecommendationsIncomplete,
} from "@nexia/shared/types/trainingRecommendations";

export function createMockTrainingPlanRecommendationsIncomplete(
    overrides: Partial<TrainingPlanRecommendationsIncomplete> = {},
): TrainingPlanRecommendationsIncomplete {
    return {
        client_id: 1,
        status: "incomplete",
        message: "Ficha incompleta",
        missing_fields: ["experiencia"],
        recommendations: null,
        based_on: {
            experience: null,
            training_frequency: null,
            session_duration: null,
            objective: null,
        },
        ...overrides,
    };
}

export function createMockTrainingPlanRecommendationsComplete(
    overrides: Partial<TrainingPlanRecommendationsComplete> = {},
): TrainingPlanRecommendationsComplete {
    return {
        client_id: 1,
        status: "complete",
        recommendations: {
            volume: {
                level: "moderate",
                level_es: "Moderado",
                range: "12-16 sets / músculo / semana",
                min_sets: 12,
                max_sets: 16,
                explanation: "Volumen acorde al objetivo de fuerza.",
            },
            intensity: {
                level: "moderate",
                level_es: "Moderada",
                rpe_range: "7-8",
                percent_1rm_range: "70-80%",
                rir_range: "2-3",
                explanation: "Intensidad acorde al objetivo de fuerza.",
            },
            exercise_selection: {
                categories: ["Multiarticulares", "Accesorios"],
                categories_raw: ["multi_joint", "accessory"],
                total_exercises_per_session: 8,
                explanation: "Tipos de ejercicio recomendados para sesiones de 60 min.",
            },
        },
        based_on: {
            experience: "intermediate",
            training_frequency: 3,
            session_duration: "medium_1h_to_1h30",
            objective: "strength",
        },
        scenario: {
            key: "intermediate_3x_strength",
            input_classification: {},
        },
        ...overrides,
    };
}

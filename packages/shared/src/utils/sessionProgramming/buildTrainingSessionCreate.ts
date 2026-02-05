/**
 * buildTrainingSessionCreate.ts — Helper para construir TrainingSessionCreate desde datos del formulario
 *
 * Contexto:
 * - Transforma datos del formulario (strings) a TrainingSessionCreate (tipos correctos)
 * - Maneja conversiones de tipos y valores opcionales
 * - Sin dependencias de UI, reutilizable
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import type {
    TrainingSessionCreate,
    CreateSessionFormData,
} from "../../types/sessionProgramming";

export interface BuildTrainingSessionCreateParams {
    formData: CreateSessionFormData;
    clientId: number;
    trainerId: number;
}

/**
 * buildTrainingSessionCreate — Construye TrainingSessionCreate desde datos del formulario
 *
 * @param params - Parámetros con datos del formulario y IDs requeridos
 * @returns TrainingSessionCreate listo para enviar al backend
 */
/** Fase 6: builds payload with training_plan_id only (no microcycle_id). */
export const buildTrainingSessionCreate = ({
    formData,
    clientId,
    trainerId,
}: BuildTrainingSessionCreateParams): TrainingSessionCreate => {
    const trainingPlanId = Number(formData.trainingPlanId);
    if (isNaN(trainingPlanId) || trainingPlanId <= 0) {
        throw new Error("El plan de entrenamiento seleccionado no es válido");
    }

    const sessionData: TrainingSessionCreate = {
        training_plan_id: trainingPlanId,
        client_id: clientId,
        trainer_id: trainerId,
        session_date: formData.sessionDate,
        session_name: formData.sessionName,
        session_type: formData.sessionType,
        status: "planned",
    };

    // Agregar campos opcionales solo si tienen valor
    if (formData.plannedDuration && formData.plannedDuration.trim() !== "") {
        const duration = Number(formData.plannedDuration);
        if (!isNaN(duration) && duration > 0) {
            sessionData.planned_duration = duration;
        }
    }

    if (formData.plannedIntensity && formData.plannedIntensity.trim() !== "") {
        const intensity = Number(formData.plannedIntensity);
        if (!isNaN(intensity) && intensity > 0) {
            sessionData.planned_intensity = intensity;
        }
    }

    if (formData.plannedVolume && formData.plannedVolume.trim() !== "") {
        const volume = Number(formData.plannedVolume);
        if (!isNaN(volume) && volume > 0) {
            sessionData.planned_volume = volume;
        }
    }

    if (formData.notes && formData.notes.trim() !== "") {
        sessionData.notes = formData.notes.trim();
    }

    return sessionData;
};






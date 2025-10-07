/**
 * clientValidation.ts — Validaciones específicas para Client Onboarding y gestión de clientes
 *
 * Contexto:
 * - Alineado con backend FastAPI (restricciones: edad 13–100, peso 20–300, altura 1.0–2.5).
 * - Usado por el hook useClientOnboarding y cualquier formulario de cliente.
 * - Compatible con Web y React Native (sin dependencias DOM).
 *
 * Reglas principales:
 * - PersonalInfo: nombre, apellidos, email obligatorios.
 * - PhysicalMetrics: peso y altura requeridos, IMC mostrado pero calculado en backend.
 * - TrainingGoals: objetivo requerido.
 * - Experience: nivel de experiencia requerido.
 * - HealthInfo: opcional (lesiones, observaciones).
 *
 * @author Frontend Team
 * @since v2.2.0
 */

import type { ClientFormData, ClientFormErrors } from "@shared/types/client";

export interface ValidationStepResult {
    isValid: boolean;
    stepErrors: ClientFormErrors;
}

/**
 * validateClientForm — Valida datos de cliente completos o por paso
 * @param data - Datos del formulario de cliente
 * @param step - Paso actual del wizard (opcional)
 */
export const validateClientForm = (
    data: ClientFormData,
    step?: number
): ValidationStepResult => {
    const errors: ClientFormErrors = {};

    /**
     * Validaciones comunes (aplican siempre, aunque step sea undefined → validación completa)
     */
    if (!data.nombre?.trim()) errors.nombre = "El nombre es obligatorio";
    if (!data.apellidos?.trim()) errors.apellidos = "Los apellidos son obligatorios";

    if (!data.email?.trim()) {
        errors.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Introduce un correo válido";
    }

    if (data.edad !== undefined) {
        if (data.edad < 13 || data.edad > 100) {
            errors.edad = "La edad debe estar entre 13 y 100 años";
        }
    }

    if (data.peso !== undefined) {
        if (data.peso < 20 || data.peso > 300) {
            errors.peso = "El peso debe estar entre 20 y 300 kg";
        }
    }

    if (data.altura !== undefined) {
        if (data.altura < 1.0 || data.altura > 2.5) {
            errors.altura = "La altura debe estar entre 1.0 y 2.5 metros";
        }
    }

    /**
     * Validaciones específicas por paso del wizard
     */
    if (step !== undefined) {
        switch (step) {
            case 0: // PersonalInfo
                if (!data.nombre?.trim()) errors.nombre = "El nombre es obligatorio";
                if (!data.apellidos?.trim()) errors.apellidos = "Los apellidos son obligatorios";
                if (!data.email?.trim()) errors.email = "El correo es obligatorio";
                break;

            case 1: // PhysicalMetrics
                if (!data.peso) errors.peso = "El peso es obligatorio";
                if (!data.altura) errors.altura = "La altura es obligatoria";
                break;

            case 2: // TrainingGoals
                if (!data.objetivo) errors.objetivo = "Selecciona un objetivo de entrenamiento";
                break;

            case 3: // Experience
                if (!data.nivel_experiencia) {
                    errors.nivel_experiencia = "Selecciona el nivel de experiencia";
                }
                break;

            case 4: // HealthInfo
                // No obligatorios, solo validaciones básicas si hay datos
                if (data.lesiones_relevantes && data.lesiones_relevantes.length > 500) {
                    errors.lesiones_relevantes = "El campo de lesiones no puede superar 500 caracteres";
                }
                if (data.observaciones && data.observaciones.length > 1000) {
                    errors.observaciones = "El campo de observaciones no puede superar 1000 caracteres";
                }
                break;

            // case 5: Review → no requiere validación adicional
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        stepErrors: errors,
    };
};

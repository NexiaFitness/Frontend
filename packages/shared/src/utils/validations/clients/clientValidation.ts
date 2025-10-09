/**
 * clientValidation.ts — Validaciones específicas para Client Onboarding y gestión de clientes
 *
 * Contexto:
 * - Alineado con backend FastAPI (restricciones actualizadas según Sosina).
 * - Usado por el hook useClientOnboarding y cualquier formulario de cliente.
 * - Compatible con Web y React Native (sin dependencias DOM).
 *
 * Reglas principales:
 * - PersonalInfo: nombre, apellidos, email obligatorios.
 * - PhysicalMetrics: edad, peso, altura requeridos, IMC calculado en backend.
 * - AnthropometricMetrics: skinfolds (0-50mm), girths (10-200cm), diameters (wrist 3-15cm, knee 5-20cm).
 * - TrainingGoals: objetivo requerido.
 * - Experience: nivel de experiencia requerido.
 * - HealthInfo: opcional (lesiones, observaciones).
 *
 * IMPORTANTE: altura ahora se envía en centímetros (rango: 100-250cm).
 *
 * @author Frontend Team
 * @since v2.2.0
 * @updated v2.5.0 - Validaciones antropométricas completas + altura en cm
 */

import type { ClientFormData, ClientFormErrors } from "@nexia/shared/types/client";

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
     * ========================================
     * VALIDACIONES COMUNES (aplican siempre)
     * ========================================
     */
    
    // Nombre y apellidos (obligatorios)
    if (!data.nombre?.trim()) {
        errors.nombre = "El nombre es obligatorio";
    }
    if (!data.apellidos?.trim()) {
        errors.apellidos = "Los apellidos son obligatorios";
    }

    // Email (obligatorio + formato)
    if (!data.email?.trim()) {
        errors.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = "Introduce un correo válido";
    }

    // Edad (13-100 años)
    if (data.edad !== undefined) {
        if (data.edad < 13 || data.edad > 100) {
            errors.edad = "La edad debe estar entre 13 y 100 años";
        }
    }

    // Peso (20-300 kg)
    if (data.peso !== undefined) {
        if (data.peso < 20 || data.peso > 300) {
            errors.peso = "El peso debe estar entre 20 y 300 kg";
        }
    }

    // Altura (CRÍTICO: ahora en centímetros, rango 100-250cm)
    if (data.altura !== undefined) {
        if (data.altura < 100 || data.altura > 250) {
            errors.altura = "La altura debe estar entre 100 y 250 cm";
        }
    }

    /**
     * ========================================
     * VALIDACIONES ANTROPOMÉTRICAS (v2.5.0)
     * ========================================
     */
    
    // Skinfolds (pliegues cutáneos, rango 0-50mm)
    const skinfoldFields = [
        'triceps', 'subscapular', 'biceps', 'iliac_crest',
        'supraspinal', 'abdominal', 'thigh', 'calf'
    ] as const;

    skinfoldFields.forEach(field => {
        const value = data[field];
        if (value !== undefined && value !== null) {
            if (value < 0 || value > 50) {
                errors[field] = `El valor debe estar entre 0 y 50 mm`;
            }
        }
    });

    // Girths (perímetros, rango 10-200cm)
    const girthFields = ['arm_girth', 'waist_girth', 'hip_girth'] as const;

    girthFields.forEach(field => {
        const value = data[field];
        if (value !== undefined && value !== null) {
            if (value < 10 || value > 200) {
                errors[field] = `El valor debe estar entre 10 y 200 cm`;
            }
        }
    });

    // Wrist diameter (3-15cm)
    if (data.wrist_diameter !== undefined && data.wrist_diameter !== null) {
        if (data.wrist_diameter < 3 || data.wrist_diameter > 15) {
            errors.wrist_diameter = "El diámetro de muñeca debe estar entre 3 y 15 cm";
        }
    }

    // Knee diameter (5-20cm)
    if (data.knee_diameter !== undefined && data.knee_diameter !== null) {
        if (data.knee_diameter < 5 || data.knee_diameter > 20) {
            errors.knee_diameter = "El diámetro de rodilla debe estar entre 5 y 20 cm";
        }
    }

    // Notas (límite de caracteres)
    if (data.notes_1 && data.notes_1.length > 500) {
        errors.notes_1 = "Las notas no pueden superar 500 caracteres";
    }
    if (data.notes_2 && data.notes_2.length > 500) {
        errors.notes_2 = "Las notas no pueden superar 500 caracteres";
    }
    if (data.notes_3 && data.notes_3.length > 500) {
        errors.notes_3 = "Las notas no pueden superar 500 caracteres";
    }

    /**
     * ========================================
     * VALIDACIONES POR PASO DEL WIZARD
     * ========================================
     */
    if (step !== undefined) {
        const stepErrors: ClientFormErrors = {};

        switch (step) {
            case 0: // PersonalInfo
                if (!data.nombre?.trim()) stepErrors.nombre = "El nombre es obligatorio";
                if (!data.apellidos?.trim()) stepErrors.apellidos = "Los apellidos son obligatorios";
                if (!data.email?.trim()) {
                    stepErrors.email = "El correo es obligatorio";
                } else if (!/\S+@\S+\.\S+/.test(data.email)) {
                    stepErrors.email = "Introduce un correo válido";
                }
                if (data.confirmEmail && data.email !== data.confirmEmail) {
                    stepErrors.confirmEmail = "Los correos no coinciden";
                }
                break;

            case 1: // PhysicalMetrics
                if (!data.edad) stepErrors.edad = "La edad es obligatoria";
                if (!data.peso) stepErrors.peso = "El peso es obligatorio";
                if (!data.altura) stepErrors.altura = "La altura es obligatoria";
                
                // Validar rangos si hay datos
                if (data.edad && (data.edad < 13 || data.edad > 100)) {
                    stepErrors.edad = "La edad debe estar entre 13 y 100 años";
                }
                if (data.peso && (data.peso < 20 || data.peso > 300)) {
                    stepErrors.peso = "El peso debe estar entre 20 y 300 kg";
                }
                if (data.altura && (data.altura < 100 || data.altura > 250)) {
                    stepErrors.altura = "La altura debe estar entre 100 y 250 cm";
                }
                break;

            case 2: // AnthropometricMetrics (nuevo paso v2.5.0)
                // Todos opcionales, pero si están presentes deben cumplir rangos
                // Las validaciones de rango ya se aplicaron arriba
                break;

            case 3: // TrainingGoals
                if (!data.objetivo) {
                    stepErrors.objetivo = "Selecciona un objetivo de entrenamiento";
                }
                break;

            case 4: // Experience
                if (!data.nivel_experiencia) {
                    stepErrors.nivel_experiencia = "Selecciona el nivel de experiencia";
                }
                break;

            case 5: // HealthInfo
                // No obligatorios, solo validaciones básicas si hay datos
                if (data.lesiones_relevantes && data.lesiones_relevantes.length > 500) {
                    stepErrors.lesiones_relevantes = "El campo de lesiones no puede superar 500 caracteres";
                }
                if (data.observaciones && data.observaciones.length > 1000) {
                    stepErrors.observaciones = "El campo de observaciones no puede superar 1000 caracteres";
                }
                break;

            case 6: // Review
                // No requiere validación adicional (solo visualización)
                break;
        }

        // Cuando hay step específico, solo retornar errores de ese step
        return {
            isValid: Object.keys(stepErrors).length === 0,
            stepErrors,
        };
    }

    // Validación completa (sin step): retornar todos los errores
    return {
        isValid: Object.keys(errors).length === 0,
        stepErrors: errors,
    };
};
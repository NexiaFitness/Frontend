/**
 * clientValidation.ts — Validaciones específicas para Client Onboarding y gestión de clientes
 *
 * Contexto:
 * - Alineado con backend FastAPI (restricciones actualizadas según Sosina).
 * - Usado por el hook useClientOnboarding y cualquier formulario de cliente.
 * - Compatible con Web y React Native (sin dependencias DOM).
 *
 * Reglas principales:
 * - PersonalInfo: nombre, apellidos, mail obligatorios.
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

    // Mail (obligatorio + formato)
    if (!data.mail?.trim()) {
        errors.mail = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(data.mail)) {
        errors.mail = "Introduce un correo válido";
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

    // Birthdate (opcional, validar formato ISO date si existe)
    if (data.birthdate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.birthdate)) {
            errors.birthdate = "Formato de fecha inválido (debe ser YYYY-MM-DD)";
        } else {
            const birthDate = new Date(data.birthdate);
            const today = new Date();
            if (birthDate > today) {
                errors.birthdate = "La fecha de nacimiento no puede ser futura";
            }
            // Validar que no sea más de 150 años atrás (límite razonable)
            const maxAge = new Date();
            maxAge.setFullYear(maxAge.getFullYear() - 150);
            if (birthDate < maxAge) {
                errors.birthdate = "La fecha de nacimiento no es válida";
            }
        }
    }

    // id_passport: sin validación específica (string libre, opcional)
    // No se valida, solo se acepta el valor tal cual

    /**
     * ========================================
     * VALIDACIONES ANTROPOMÉTRICAS (v2.5.0)
     * ========================================
     */
    
    // Skinfolds (pliegues cutáneos, rango 0-50mm)
    const skinfoldFields = [
        'skinfold_triceps', 'skinfold_subscapular', 'skinfold_biceps', 'skinfold_iliac_crest',
        'skinfold_supraspinal', 'skinfold_abdominal', 'skinfold_thigh', 'skinfold_calf'
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
    const girthFields = ['girth_relaxed_arm', 'girth_waist_minimum', 'girth_hips_maximum'] as const;

    girthFields.forEach(field => {
        const value = data[field];
        if (value !== undefined && value !== null) {
            if (value < 10 || value > 200) {
                errors[field] = `El valor debe estar entre 10 y 200 cm`;
            }
        }
    });

    // Wrist diameter (3-15cm)
    if (data.diameter_bi_styloid_wrist !== undefined && data.diameter_bi_styloid_wrist !== null) {
        if (data.diameter_bi_styloid_wrist < 3 || data.diameter_bi_styloid_wrist > 15) {
            errors.diameter_bi_styloid_wrist = "El diámetro de muñeca debe estar entre 3 y 15 cm";
        }
    }

    // Knee diameter (5-20cm)
    if (data.diameter_femur_bicondylar !== undefined && data.diameter_femur_bicondylar !== null) {
        if (data.diameter_femur_bicondylar < 5 || data.diameter_femur_bicondylar > 20) {
            errors.diameter_femur_bicondylar = "El diámetro de rodilla debe estar entre 5 y 20 cm";
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
                if (!data.mail?.trim()) {
                    stepErrors.mail = "El correo es obligatorio";
                } else if (!/\S+@\S+\.\S+/.test(data.mail)) {
                    stepErrors.mail = "Introduce un correo válido";
                }
                if (data.confirmEmail && data.mail !== data.confirmEmail) {
                    stepErrors.confirmEmail = "Los correos no coinciden";
                }
                // Validar birthdate si existe
                if (data.birthdate) {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(data.birthdate)) {
                        stepErrors.birthdate = "Formato de fecha inválido";
                    } else {
                        const birthDate = new Date(data.birthdate);
                        const today = new Date();
                        if (birthDate > today) {
                            stepErrors.birthdate = "La fecha de nacimiento no puede ser futura";
                        }
                    }
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
                if (!data.objetivo_entrenamiento) {
                    stepErrors.objetivo_entrenamiento = "Selecciona un objetivo de entrenamiento";
                }
                // Validar fecha_definicion_objetivo si existe
                if (data.fecha_definicion_objetivo) {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(data.fecha_definicion_objetivo)) {
                        stepErrors.fecha_definicion_objetivo = "Formato de fecha inválido";
                    } else {
                        const fechaObj = new Date(data.fecha_definicion_objetivo);
                        const today = new Date();
                        today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
                        if (fechaObj > today) {
                            stepErrors.fecha_definicion_objetivo = "La fecha no puede ser futura";
                        }
                    }
                }
                // Validar descripcion_objetivos (max 1000 caracteres)
                if (data.descripcion_objetivos && data.descripcion_objetivos.length > 1000) {
                    stepErrors.descripcion_objetivos = "La descripción no puede superar 1000 caracteres";
                }
                break;

            case 4: // Experience
                if (!data.experiencia) {
                    stepErrors.experiencia = "Selecciona el nivel de experiencia";
                }
                // Validar session_duration contra valores permitidos
                if (data.session_duration) {
                    const validDurations = ['short_lt_1h', 'medium_1h_to_1h30', 'long_gt_1h30'];
                    if (!validDurations.includes(data.session_duration)) {
                        stepErrors.session_duration = "Selecciona una duración válida";
                    }
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
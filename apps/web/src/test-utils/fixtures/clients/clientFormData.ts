/**
 * ClientFormData Fixtures - Factory para generar datos de formulario de cliente
 *
 * Alineado 100% con ClientFormData de packages/shared/src/types/client.ts
 * Usado para tests de onboarding y edición de clientes.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { ClientFormData } from "@nexia/shared/types/client";
import { GENDER_ENUM } from "@nexia/shared/types/client";

/**
 * Crea datos iniciales vacíos para el formulario
 */
export const createEmptyFormData = (): ClientFormData => ({
    nombre: "",
    apellidos: "",
    mail: "",
    confirmEmail: "",
});

/**
 * Crea datos de formulario válidos mínimos (solo campos obligatorios)
 */
export const createMinimalValidFormData = (overrides: Partial<ClientFormData> = {}): ClientFormData => ({
    nombre: "Juan",
    apellidos: "Pérez",
    mail: "juan@test.com",
    confirmEmail: "juan@test.com",
    ...overrides,
});

/**
 * Crea datos de formulario completos válidos (todos los steps)
 */
export const createCompleteValidFormData = (overrides: Partial<ClientFormData> = {}): ClientFormData => ({
    // Step 0: PersonalInfo
    nombre: "Juan",
    apellidos: "Pérez",
    mail: "juan@test.com",
    confirmEmail: "juan@test.com",
    telefono: "+34612345678",
    sexo: GENDER_ENUM.MASCULINO,
    id_passport: "12345678X",
    birthdate: "1990-01-15",
    
    // Step 1: PhysicalMetrics
    edad: 30,
    peso: 80,
    altura: 180,
    
    // Step 2: AnthropometricMetrics (opcional, pero incluimos algunos)
    skinfold_triceps: 10,
    skinfold_subscapular: 12,
    girth_waist_minimum: 85,
    girth_hips_maximum: 95,
    
    // Step 3: TrainingGoals
    objetivo_entrenamiento: "hypertrophy",
    fecha_definicion_objetivo: "2025-01-01",
    descripcion_objetivos: "Ganar 5kg de masa muscular",
    
    // Step 4: Experience
    experiencia: "Media",
    frecuencia_semanal: "Alta",
    session_duration: "medium_1h_to_1h30",
    
    // Step 5: HealthInfo
    lesiones_relevantes: "Ninguna",
    observaciones: "Cliente motivado",
    
    ...overrides,
});

/**
 * Crea datos de formulario con email inválido
 */
export const createInvalidEmailFormData = (): ClientFormData => ({
    nombre: "Juan",
    apellidos: "Pérez",
    mail: "invalid-email",
    confirmEmail: "invalid-email",
});

/**
 * Crea datos de formulario con emails que no coinciden
 */
export const createMismatchedEmailFormData = (): ClientFormData => ({
    nombre: "Juan",
    apellidos: "Pérez",
    mail: "juan@test.com",
    confirmEmail: "different@test.com",
});


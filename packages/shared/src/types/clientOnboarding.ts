/**
 * clientOnboarding.ts — Tipos TypeScript para wizard de alta de clientes
 *
 * Contexto:
 * - Define props de los componentes <Step /> del flujo de Onboarding.
 * - Extiende los tipos base de cliente (ClientFormData, ClientFormErrors).
 * - Alineado con useClientOnboarding hook (formData, updateField).
 *
 * Arquitectura:
 * - BaseStepProps → Props comunes para la mayoría de steps.
 * - Cada Step tiene su propia interfaz para facilitar extensiones futuras.
 * - ReviewStepProps no necesita errors ni updateField (solo visualiza).
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Renombrado data→formData, onChange→updateField (alineación con hook)
 * @updated v2.5.0 - Agregado AnthropometricMetricsStepProps (Step 2)
 */

import type { ClientFormData, ClientFormErrors } from "./client";

/**
 * Props base para steps de formulario.
 * Incluyen:
 * - formData → estado actual del formulario (ClientFormData).
 * - errors → errores de validación asociados.
 * - updateField → actualizador de campo específico.
 */
export interface BaseStepProps {
    formData: ClientFormData;
    errors: ClientFormErrors;
    updateField: <K extends keyof ClientFormData>(
        field: K,
        value: ClientFormData[K]
    ) => void;
}

/**
 * Step 0: Información personal
 */
export interface PersonalInfoStepProps extends BaseStepProps {}

/**
 * Step 1: Métricas físicas básicas (edad, peso, altura, BMI)
 */
export interface PhysicalMetricsStepProps extends BaseStepProps {}

/**
 * Step 2: Métricas antropométricas avanzadas (skinfolds, girths, diameters, notes)
 * @since v2.5.0
 */
export interface AnthropometricMetricsStepProps extends BaseStepProps {}

/**
 * Step 3: Objetivos de entrenamiento
 */
export interface TrainingGoalsStepProps extends BaseStepProps {}

/**
 * Step 4: Nivel de experiencia y frecuencia
 */
export interface ExperienceStepProps extends BaseStepProps {}

/**
 * Step 5: Información de salud (lesiones, observaciones)
 */
export interface HealthInfoStepProps extends BaseStepProps {}

/**
 * Step 6: Revisión antes de enviar
 * - Solo necesita mostrar la data (readonly).
 */
export interface ReviewStepProps {
    formData: ClientFormData;
}
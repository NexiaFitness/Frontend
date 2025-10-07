/**
 * useClientOnboarding.ts — Hook para manejar el flujo multi-step del Client Onboarding.
 *
 * Contexto:
 * - Gestiona datos de formulario, validaciones y navegación por pasos.
 * - Compatible Web + React Native (sin dependencias DOM).
 * - Conecta con RTK Query (clientsApi) para crear clientes reales en backend.
 *
 * Exposición:
 * - Estado: formData, errors, currentStep, totalSteps, isLoading, serverError
 * - Acciones: updateField, nextStep, prevStep, goToStep, validateStep, submitForm, resetForm
 *
 * @author Frontend Team
 * @since v2.2.0
 */

import { useState, useCallback } from "react";
import { useCreateClientMutation } from "@shared/api/clientsApi";
import type { ClientFormData, ClientFormErrors } from "@shared/types/client";
import { validateClientForm } from "@shared/utils/validations";

// Número fijo de pasos (extended: PersonalInfo, PhysicalMetrics, TrainingGoals, Experience, HealthInfo, Review)
const TOTAL_STEPS = 6;

export function useClientOnboarding(initialData: ClientFormData) {
    // Estado local
    const [formData, setFormData] = useState<ClientFormData>(initialData);
    const [errors, setErrors] = useState<ClientFormErrors>({});
    const [currentStep, setCurrentStep] = useState<number>(0);

    // RTK Query mutation
    const [createClient, { isLoading, error: serverError }] = useCreateClientMutation();

    /**
     * updateField — Actualiza un campo del formulario
     * Limpia el error asociado si existía
     */
    const updateField = useCallback(
        <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            setErrors(prev => ({ ...prev, [field]: undefined }));
        },
        []
    );

    /**
     * validateStep — Valida solo el paso actual
     * Usa reglas en shared/utils/validation.ts
     */
    const validateStep = useCallback((): boolean => {
        const { isValid, stepErrors } = validateClientForm(formData, currentStep);
        setErrors(prev => ({ ...prev, ...stepErrors }));
        return isValid;
    }, [formData, currentStep]);

    /**
     * Navegación de pasos
     */
    const nextStep = useCallback(() => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
        }
    }, [validateStep]);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, []);

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < TOTAL_STEPS) {
            setCurrentStep(step);
        }
    }, []);

    /**
     * submitForm — Valida todo el formulario y crea cliente en backend
     */
    const submitForm = useCallback(async () => {
        const { isValid, stepErrors } = validateClientForm(formData);
        if (!isValid) {
            setErrors(stepErrors);
            return { success: false, errors: stepErrors };
        }

        try {
            await createClient(formData).unwrap();
            return { success: true };
        } catch (err) {
            return { success: false, serverError: err };
        }
    }, [formData, createClient]);

    /**
     * resetForm — Limpia datos y errores, vuelve al step inicial
     */
    const resetForm = useCallback(() => {
        setFormData(initialData);
        setErrors({});
        setCurrentStep(0);
    }, [initialData]);

    return {
        // Estado
        formData,
        errors,
        currentStep,
        totalSteps: TOTAL_STEPS,
        isLoading,
        serverError,

        // Acciones
        updateField,
        validateStep,
        nextStep,
        prevStep,
        goToStep,
        submitForm,
        resetForm,
    };
}

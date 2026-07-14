/**
 * useClientForm.ts — Hook unificado para formularios de cliente (crear/editar)
 *
 * Contexto:
 * - Unifica lógica de useClientOnboarding (crear) y useUpdateClient (editar)
 * - Gestiona datos de formulario, validaciones y envío
 * - Compatible Web + React Native (sin dependencias DOM)
 * - Conecta con RTK Query (clientsApi) para crear/actualizar clientes
 *
 * Exposición:
 * - Estado: formData, errors, isSubmitting
 * - Acciones: updateField, handleSubmit
 *
 * @author Frontend Team
 * @since v4.6.0
 */

import { useState, useCallback } from "react";
import { useCreateClientMutation, useUpdateClientMutation } from "../../api/clientsApi";
import type { ClientFormData, ClientFormErrors } from "../../types/client";
import { validateClientForm } from "../../utils/validations";

export interface UseClientFormOptions {
    mode: "create" | "edit";
    clientId?: number;
    initialData: ClientFormData;
}

export interface UseClientFormResult {
    formData: ClientFormData;
    errors: ClientFormErrors;
    updateField: <K extends keyof ClientFormData>(
        field: K,
        value: ClientFormData[K]
    ) => void;
    /** Valida el formulario sin enviar. Devuelve isValid y actualiza errors si hay fallos. */
    validate: () => { isValid: boolean };
    handleSubmit: () => Promise<{ success: boolean; clientId?: number; error?: unknown }>;
    isSubmitting: boolean;
}

function mergeClientFormValidation(
    formData: ClientFormData,
    mode: "create" | "edit",
): { isValid: boolean; stepErrors: ClientFormErrors } {
    const base = validateClientForm(formData);
    if (mode !== "create") {
        return base;
    }
    const experienceStep = validateClientForm(formData, 4);
    const stepErrors = { ...base.stepErrors, ...experienceStep.stepErrors };
    return {
        isValid: base.isValid && experienceStep.isValid,
        stepErrors,
    };
}

/**
 * Hook unificado para formularios de cliente
 *
 * @param options - Configuración del formulario (mode, clientId, initialData)
 * @returns Estado y acciones del formulario
 */
export function useClientForm(options: UseClientFormOptions): UseClientFormResult {
    const { mode, clientId, initialData } = options;

    const [formData, setFormData] = useState<ClientFormData>(initialData);
    const [errors, setErrors] = useState<ClientFormErrors>({});

    const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
    const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

    const isSubmitting = isCreating || isUpdating;

    const updateField = useCallback(
        <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        []
    );

    const validate = useCallback(() => {
        const result = mergeClientFormValidation(formData, mode);
        setErrors(result.stepErrors);
        return { isValid: result.isValid };
    }, [formData, mode]);

    const handleSubmit = useCallback(async () => {
        const { isValid, stepErrors } = mergeClientFormValidation(formData, mode);
        if (!isValid) {
            setErrors(stepErrors);
            return { success: false, error: stepErrors };
        }

        try {
            const { frecuencia_semanal: _freq, exact_training_frequency: _exact, ...rest } =
                formData;
            const payload = {
                ...rest,
                objective: formData.objetivo_entrenamiento ?? null,
            };

            if (mode === "create") {
                const client = await createClient(payload).unwrap();
                setFormData((prev) => ({
                    ...prev,
                    ...client,
                    confirmEmail: prev.confirmEmail,
                }));
                return { success: true, clientId: client.id };
            }

            if (!clientId) {
                return { success: false, error: "clientId es requerido para editar" };
            }

            const { confirmEmail, ...updateData } = payload;
            const updatedClient = await updateClient({ id: clientId, data: updateData }).unwrap();
            setFormData((prev) => ({
                ...prev,
                ...updatedClient,
                confirmEmail: prev.confirmEmail,
            }));
            return { success: true };
        } catch (err) {
            console.error(
                `[useClientForm] Error ${mode === "create" ? "creando" : "actualizando"} cliente:`,
                err,
            );
            return { success: false, error: err };
        }
    }, [formData, mode, clientId, createClient, updateClient]);

    return {
        formData,
        errors,
        updateField,
        validate,
        handleSubmit,
        isSubmitting,
    };
}

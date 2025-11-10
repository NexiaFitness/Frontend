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
    handleSubmit: () => Promise<{ success: boolean; error?: unknown }>;
    isSubmitting: boolean;
}

/**
 * Hook unificado para formularios de cliente
 * 
 * @param options - Configuración del formulario (mode, clientId, initialData)
 * @returns Estado y acciones del formulario
 */
export function useClientForm(options: UseClientFormOptions): UseClientFormResult {
    const { mode, clientId, initialData } = options;

    // Estado local
    const [formData, setFormData] = useState<ClientFormData>(initialData);
    const [errors, setErrors] = useState<ClientFormErrors>({});

    // RTK Query mutations
    const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
    const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

    const isSubmitting = isCreating || isUpdating;

    /**
     * updateField — Actualiza un campo del formulario
     * Limpia el error asociado si existía
     */
    const updateField = useCallback(
        <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        []
    );

    /**
     * handleSubmit — Valida y envía el formulario
     * Decide automáticamente entre crear o actualizar según mode
     */
    const handleSubmit = useCallback(async () => {
        // Validar formulario completo
        const { isValid, stepErrors } = validateClientForm(formData);
        if (!isValid) {
            setErrors(stepErrors);
            return { success: false, error: stepErrors };
        }

        try {
            if (mode === "create") {
                // Crear nuevo cliente
                await createClient(formData).unwrap();
                return { success: true };
            } else {
                // Actualizar cliente existente
                if (!clientId) {
                    return { success: false, error: "clientId es requerido para editar" };
                }
                
                // Excluir confirmEmail del payload (solo validación frontend)
                const { confirmEmail, ...updateData } = formData;
                
                await updateClient({ id: clientId, data: updateData }).unwrap();
                return { success: true };
            }
        } catch (err) {
            console.error(`[useClientForm] Error ${mode === "create" ? "creando" : "actualizando"} cliente:`, err);
            return { success: false, error: err };
        }
    }, [formData, mode, clientId, createClient, updateClient]);

    return {
        formData,
        errors,
        updateField,
        handleSubmit,
        isSubmitting,
    };
}


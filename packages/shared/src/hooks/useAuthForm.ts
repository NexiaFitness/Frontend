/**
 * Hook personalizado reutilizable para formularios de autenticación
 * Extrae lógica común del LoginForm existente y la centraliza
 * Reutilizable en Web + React Native (lógica pura TypeScript)
 * 
 * @author Frontend Team  
 * @since v1.0.0
 */

import { useState } from "react";
import { useDispatch } from "react-redux";
import { clearError } from "@shared/store/authSlice";
import type { AppDispatch } from "@shared/store";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface UseAuthFormProps<T> {
    initialState: T;
    validate: (formData: T) => { isValid: boolean; errors: Record<string, string> };
}

// Tipo específico para errores RTK Query
type RTKError = FetchBaseQueryError | {
    status: number;
    data?: { detail?: string; message?: string };
};

export function useAuthForm<T extends Record<string, unknown>>({ 
    initialState,
    validate,
}: UseAuthFormProps<T>) {
    const dispatch = useDispatch<AppDispatch>();

    // Estado del formulario
    const [formData, setFormData] = useState<T>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // Manejar cambios de inputs
    const handleInputChange = (field: keyof T) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }

        if (serverError) {
            setServerError(null);
            dispatch(clearError(undefined));
        }
    };

    // Validar formulario
    const validateForm = (): boolean => {
        const validation = validate(formData);
        setErrors(validation.errors as Partial<Record<keyof T, string>>);
        return validation.isValid;
    };

    // Manejar errores de servidor (con prioridad a mensajes backend)
    const handleServerError = (error: RTKError): string => {
        let errorMessage = "Error de conexión. Intenta de nuevo.";

        if ("status" in error) {
            // 1. Si el backend manda mensaje → usarlo
            if ("data" in error && error.data) {
                const data = error.data as { detail?: string; message?: string };

                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }

            // 2. Si no había mensaje → fallback por código
            if (errorMessage === "Error de conexión. Intenta de nuevo.") {
                if (error.status === 401) {
                    errorMessage = "Correo o contraseña incorrectos";
                } else if (error.status === 409) {
                    errorMessage = "Este email ya está registrado";
                } else if (error.status === 422) {
                    errorMessage = "Datos inválidos. Verifica la información";
                } else if (error.status === 429) {
                    errorMessage = "Demasiados intentos. Espera un momento.";
                }
            }
        }

        setServerError(errorMessage);
        return errorMessage;
    };

    // Limpiar errores
    const clearErrors = (): void => {
        setServerError(null);
        dispatch(clearError(undefined));
    };

    // Reset del formulario
    const resetForm = (): void => {
        setFormData(initialState);
        setErrors({});
        setServerError(null);
    };

    return {
        formData,
        errors,
        serverError,

        handleInputChange,
        validateForm,
        handleServerError,

        clearErrors,
        resetForm,

        setFormData,
        setServerError,
    };
}
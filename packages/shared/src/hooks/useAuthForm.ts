/**
 * Hook personalizado reutilizable para formularios de autenticación
 * Funciones estables con useCallback para evitar infinite loops
 * Reutilizable en Web + React Native (lógica pura TypeScript)
 * 
 * @author Frontend Team  
 * @since v1.0.0
 * @updated v4.3.3 - Cross-platform types: Removed HTMLInputElement dependencies
 */

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearError } from "@nexia/shared/store/authSlice";
import type { AppDispatch } from "@nexia/shared/store";
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface UseAuthFormProps<T> {
    initialState: T;
    validate: (formData: T) => { isValid: boolean; errors: Record<string, string> };
}

// Cross-platform event type - works for both web and React Native
type CrossPlatformChangeEvent = {
    target: {
        value: string;
    };
} | {
    nativeEvent: {
        text: string;
    };
} | string; // For direct value updates

// Tipo específico para errores RTK Query
type RTKError = FetchBaseQueryError | {
    status: number;
    data?: { detail?: string; message?: string };
};

// Helper function to extract value from different event types
const extractValue = (e: CrossPlatformChangeEvent): string => {
    if (typeof e === 'string') {
        return e;
    }
    if ('target' in e && e.target) {
        return e.target.value;
    }
    if ('nativeEvent' in e && e.nativeEvent) {
        return e.nativeEvent.text;
    }
    return '';
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

    // FUNCIONES ESTABLES CON useCallback - CROSS-PLATFORM COMPATIBLE
    const handleInputChange = useCallback((field: keyof T) => (
        e: CrossPlatformChangeEvent
    ) => {
        const value = extractValue(e);
        
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));

        setServerError(null);
        dispatch(clearError(undefined));
    }, [dispatch]);

    // Validar formulario
    const validateForm = useCallback((): boolean => {
        const validation = validate(formData);
        setErrors(validation.errors as Partial<Record<keyof T, string>>);
        return validation.isValid;
    }, [formData, validate]);

    // Manejar errores de servidor
    const handleServerError = useCallback((error: RTKError): string => {
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
    }, []);

    // Limpiar errores
    const clearErrors = useCallback((): void => {
        setServerError(null);
        dispatch(clearError(undefined));
    }, [dispatch]);

    // Reset del formulario
    const resetForm = useCallback((): void => {
        setFormData(initialState);
        setErrors({});
        setServerError(null);
    }, [initialState]);

    // setFormData estable con useCallback
    const stableSetFormData = useCallback((
        updater: T | ((prev: T) => T)
    ) => {
        setFormData(updater);
    }, []);

    // setServerError estable con useCallback  
    const stableSetServerError = useCallback((error: string | null) => {
        setServerError(error);
    }, []);

    return {
        formData,
        errors,
        serverError,

        handleInputChange,
        validateForm,
        handleServerError,

        clearErrors,
        resetForm,

        // Funciones estables
        setFormData: stableSetFormData,
        setServerError: stableSetServerError,
    };
}
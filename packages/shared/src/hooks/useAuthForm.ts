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


interface UseAuthFormProps<T> {
    initialState: T;
    validate: (formData: T) => { isValid: boolean; errors: Record<string, string> };
}

export function useAuthForm<T extends Record<string, any>>({
    initialState,
    validate,
}: UseAuthFormProps<T>) {
    const dispatch = useDispatch<AppDispatch>();

    // Estado del formulario (extraído de LoginForm)
    const [formData, setFormData] = useState<T>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // handleInputChange (extraído exacto de LoginForm)
    const handleInputChange = (field: keyof T) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

        // Limpiar errores cuando usuario escribe (mismo patrón LoginForm)
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }

        // Limpiar error de servidor cuando usuario escribe (mismo patrón LoginForm)
        if (serverError) {
            setServerError(null);
            dispatch(clearError(undefined));
        }
    };

    // Validar formulario usando función externa
    const validateForm = (): boolean => {
        const validation = validate(formData);
        setErrors(validation.errors as Partial<Record<keyof T, string>>);
        return validation.isValid;
    };

    // handleServerError (extraído y mejorado de LoginForm)
    const handleServerError = (error: any): string => {
        let errorMessage = "Error de conexión. Intenta de nuevo.";

        // Mismos códigos que LoginForm + casos adicionales
        if (error?.status === 401) {
            errorMessage = "Correo o contraseña incorrectos";
        } else if (error?.status === 409) {
            errorMessage = "Este email ya está registrado";
        } else if (error?.status === 422) {
            errorMessage = "Datos inválidos. Verifica la información";
        } else if (error?.status === 429) {
            errorMessage = "Demasiados intentos. Espera un momento.";
        } else if (error?.data?.detail) {
            errorMessage = error.data.detail;
        } else if (error?.data?.message) {
            errorMessage = error.data.message;
        }

        setServerError(errorMessage);
        return errorMessage;
    };

    // Limpiar errores (utilidad adicional)
    const clearErrors = (): void => {
        setServerError(null);
        dispatch(clearError(undefined));
    };

    // Reset formulario (utilidad adicional)
    const resetForm = (): void => {
        setFormData(initialState);
        setErrors({});
        setServerError(null);
    };

    return {
        // Estado
        formData,
        errors,
        serverError,

        // Funciones principales
        handleInputChange,
        validateForm,
        handleServerError,

        // Utilidades
        clearErrors,
        resetForm,

        // Setters directos (por si se necesitan)
        setFormData,
        setServerError,
    };
}
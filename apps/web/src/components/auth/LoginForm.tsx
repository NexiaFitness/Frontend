/**
 * Formulario de login refactorizado usando arquitectura reutilizable
 * Migrado de estado manual a useAuthForm para consistencia
 * Usa validateLoginForm + useAuthForm + ServerErrorBanner
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useLoginMutation } from "@shared/api/authApi";
import { loginSuccess, loginFailure, clearError } from "@shared/store/authSlice";
import { useAuthForm, validateLoginForm } from "@/components/ui/forms";
import type { AppDispatch } from "@shared/store";
import type { LoginCredentials } from "@shared/types/auth";

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // RTK Query hook
    const [login, { isLoading }] = useLoginMutation();
    
    // Initial state con email del estado de navegación si existe
    const initialFormState: LoginFormData = {
        email: location.state?.email || "",
        password: "",
    };

    // useAuthForm hook para consistencia con otros formularios
    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        handleServerError,
        clearErrors,
    } = useAuthForm({
        initialState: initialFormState,
        validate: validateLoginForm,
    });

    // Mensaje de éxito del registro si viene de register
    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            // Preparar credenciales para API - Backend espera username, no email
            const credentials: LoginCredentials = {
                username: formData.email,  // UI muestra "email" pero backend espera "username"
                password: formData.password,
            };

            const response = await login(credentials).unwrap();
            
            // Despachar acción de éxito - Backend retorna access_token
            dispatch(loginSuccess({
                user: response.user,
                token: response.access_token,
            }));

            // Navegar a destino apropiado
            const redirectTo = location.state?.from || "/dashboard";
            navigate(redirectTo, { replace: true });

        } catch (error: any) {
            const errorMessage = handleServerError(error);
            dispatch(loginFailure(errorMessage));
        }
    };

    const handleForgotPassword = () => {
        navigate("/auth/forgot-password");
    };

    const handleRegister = () => {
        navigate("/auth/register");
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 text-primary-400">
                    Bienvenido de vuelta
                </h1>
                <p className="text-gray-600">
                    Inicia sesión en tu cuenta de NEXIA
                </p>
            </div>

            {/* Mensaje de éxito del registro */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm font-medium">
                        {successMessage}
                    </p>
                </div>
            )}

            {/* Banner de error del servidor */}
            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    type="email"
                    label="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    error={errors.email}
                    placeholder="Introduce tu correo electrónico"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    error={errors.password}
                    placeholder="Introduce tu contraseña"
                    isRequired
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>

                <div className="flex flex-col space-y-3 text-center text-sm">
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                        disabled={isLoading}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                    <div className="text-gray-600">
                        ¿No tienes cuenta?{" "}
                        <button
                            type="button"
                            onClick={handleRegister}
                            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Regístrate aquí
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
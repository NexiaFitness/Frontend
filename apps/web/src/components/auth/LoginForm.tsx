/**
 * LoginForm.tsx — Formulario de login profesional.
 *
 * Contexto:
 * - Usa useAuthForm para validaciones consistentes.
 * - Conectado a RTK Query (useLoginMutation).
 * - Feedback de loading: spinner (desde Button) + texto accesible "Iniciando sesión...".
 *
 * Notas de mantenimiento:
 * - Backend espera `username`, la UI usa `email`.
 * - Ajustar redirecciones en función de location.state.
 * - Mantener accesibilidad: inputs y enlaces se deshabilitan durante loading.
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v4.3.1 - Typography system integration + BUTTON_PRESETS unificado
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useLoginMutation, loginSuccess, loginFailure, useAuthForm } from "@nexia/shared";
import { validateLoginForm } from "@nexia/shared/utils/validations";
import type { AppDispatch } from "@nexia/shared/store";
import type { LoginCredentials } from "@nexia/shared/types/auth";

interface LoginFormData {
    email: string;
    password: string;
}

export const LoginForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    const [login, { isLoading }] = useLoginMutation();

    const initialFormState: LoginFormData = {
        email: location.state?.email || "",
        password: "",
    };

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

    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            const credentials: LoginCredentials = {
                username: formData.email, // UI muestra "email", backend espera "username"
                password: formData.password,
            };

            const response = await login(credentials).unwrap();

            dispatch(
                loginSuccess({
                    user: response.user,
                    token: response.access_token,
                })
            );

            const redirectTo = location.state?.from || "/dashboard";
            navigate(redirectTo, { replace: true });
        } catch (error) {
            const errorMessage = handleServerError(
                error as Parameters<typeof handleServerError>[0]
            );
            dispatch(loginFailure(errorMessage));
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className={`${TYPOGRAPHY.pageTitle} mb-2`} style={{ color: '#4A67B3' }}>
                    Bienvenido de vuelta
                </h1>
                <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                    Inicia sesión en tu cuenta de NEXIA
                </p>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className={TYPOGRAPHY_COMBINATIONS.successMessage}>
                        {successMessage}
                    </p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                    type="email"
                    label="Correo electrónico"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    error={errors.email}
                    placeholder="Introduce tu correo electrónico"
                    isRequired
                    disabled={isLoading}
                    autoComplete="email"
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
                    autoComplete="current-password"
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md" // unificado con LogoutButton
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={BUTTON_PRESETS.formPrimary}
                >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>

                <div className="flex flex-col space-y-3 text-center text-sm">
                    <button
                        type="button"
                        onClick={() => navigate("/auth/forgot-password")}
                        className={`${TYPOGRAPHY.linkText} underline disabled:opacity-50`}
                        style={{ color: '#4A67B3' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#3a5db3'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#4A67B3'}
                        disabled={isLoading}
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                    <div className="text-gray-600">
                        ¿No tienes cuenta?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/auth/register")}
                            className={`${TYPOGRAPHY.linkText} underline disabled:opacity-50`}
                            style={{ color: '#4A67B3' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#3a5db3'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#4A67B3'}
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

/**
 * RegisterForm.tsx — Formulario de registro con autologin automático.
 *
 * Contexto:
 * - Usa RTK Query (authApi) para registro con autologin.
 * - Registro público solo para entrenadores (Q2: atletas vía invitación).
 * - Redirección automática según rol tras registro exitoso.
 * - Compatible con React Web y React Native.
 * - Arquitectura limpia: navegación delegada al componente padre.
 *
 * Flujo:
 * 1. Usuario completa formulario → useRegisterMutation()
 * 2. Backend devuelve tokens → autologin automático
 * 3. Redirección automática según rol (trainer/admin)
 *
 * @since v1.0.0
 * @updated v2.0.0 - Integración con useAuth y autologin
 * @updated v4.4.0 - Migrado a RTK Query (authApi)
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import {
    AUTH_INPUT_MOBILE,
    AUTH_LINK,
    AUTH_LINK_MUTED,
    AUTH_SUBMIT_MOBILE,
} from "@/components/auth/authFormPresentation";
import { useRegisterMutation, loginSuccess, loginFailure } from "@nexia/shared";
import { useAuthForm } from "@nexia/shared/hooks/useAuthForm";
import { USER_ROLES } from "@nexia/shared/config/constants";
import { validateRegisterForm, PASSWORD_REQUIREMENTS_HINT } from "@nexia/shared/utils/validations";
import type { AppDispatch } from "@nexia/shared/store";
import type { RegisterCredentials } from "@nexia/shared/types/auth";

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    apellidos: string;
    [key: string]: unknown;
}

const initialFormState: RegisterFormData = {
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellidos: "",
};

const validateTrainerRegisterForm = (formData: RegisterFormData) =>
    validateRegisterForm({ ...formData, role: USER_ROLES.TRAINER });

export const RegisterForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

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
        validate: validateTrainerRegisterForm,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            const credentials: RegisterCredentials = {
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                role: USER_ROLES.TRAINER,
            };

            const response = await register(credentials).unwrap();

            if (!response?.user || !response?.access_token) {
                console.error("[RegisterForm] Invalid response from server:", response);
                handleServerError({
                    status: 500,
                    data: {
                        detail:
                            "Respuesta inválida del servidor. El usuario puede haberse creado correctamente. Por favor, intenta iniciar sesión.",
                    },
                });
                return;
            }

            dispatch(
                loginSuccess({
                    user: response.user,
                    token: response.access_token,
                    refreshToken: response.refresh_token,
                }),
            );

            navigate("/dashboard", { replace: true });
        } catch (error: unknown) {
            const apiError = error as {
                status?: number;
                data?: { detail?: string };
                message?: string;
            };
            console.error("[RegisterForm] Registration failed:", {
                error,
                status: apiError?.status,
                data: apiError?.data,
                message: apiError?.message,
            });

            if (apiError?.status === 422) {
                const errorDetail = apiError?.data?.detail || "";
                const isDuplicateUser =
                    typeof errorDetail === "string" &&
                    (errorDetail.toLowerCase().includes("already exists") ||
                        errorDetail.toLowerCase().includes("ya existe") ||
                        errorDetail.toLowerCase().includes("duplicate") ||
                        errorDetail.toLowerCase().includes("duplicado"));

                if (isDuplicateUser) {
                    const errorMessage =
                        "Este email ya está registrado. ¿Quieres iniciar sesión?";
                    handleServerError({
                        status: 422,
                        data: { detail: errorMessage },
                    });
                    navigate("/auth/login", {
                        state: { email: formData.email },
                        replace: true,
                    });
                    return;
                }
            }

            const errorMessage =
                apiError?.data?.detail ||
                apiError?.message ||
                "Error al crear la cuenta. Intenta de nuevo.";

            handleServerError({
                status: apiError?.status || 500,
                data: { detail: errorMessage },
            });

            dispatch(loginFailure(errorMessage));
        }
    };

    const handleLogin = () => {
        navigate("/auth/login");
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    Únete a NEXIA
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Crea tu cuenta de entrenador para gestionar a tus atletas
                </p>
            </div>

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                    type="email"
                    label="Correo electrónico"
                    size="sm"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    error={errors.email}
                    placeholder="Introduce tu correo electrónico"
                    isRequired
                    disabled={isLoading}
                    className={AUTH_INPUT_MOBILE}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        type="text"
                        label="Nombre"
                        size="sm"
                        value={formData.nombre}
                        onChange={handleInputChange("nombre")}
                        error={errors.nombre}
                        placeholder="Tu nombre"
                        isRequired
                        disabled={isLoading}
                        className={AUTH_INPUT_MOBILE}
                    />

                    <Input
                        type="text"
                        label="Apellidos"
                        size="sm"
                        value={formData.apellidos}
                        onChange={handleInputChange("apellidos")}
                        error={errors.apellidos}
                        placeholder="Tus apellidos"
                        isRequired
                        disabled={isLoading}
                        className={AUTH_INPUT_MOBILE}
                    />
                </div>

                <Input
                    type="password"
                    label="Contraseña"
                    size="sm"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    error={errors.password}
                    placeholder={PASSWORD_REQUIREMENTS_HINT}
                    isRequired
                    disabled={isLoading}
                    className={AUTH_INPUT_MOBILE}
                />

                <Input
                    type="password"
                    label="Confirmar contraseña"
                    size="sm"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    error={errors.confirmPassword}
                    placeholder="Repite tu contraseña"
                    isRequired
                    disabled={isLoading}
                    className={AUTH_INPUT_MOBILE}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={`w-full ${AUTH_SUBMIT_MOBILE}`}
                >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                    ¿Eres atleta? Tu entrenador te enviará una invitación por correo
                    electrónico.
                </p>

                <div className={`text-center ${AUTH_LINK_MUTED}`}>
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={handleLogin}
                        className={`${AUTH_LINK} disabled:opacity-50`}
                        disabled={isLoading}
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </div>
    );
};

/**
 * RegisterForm.tsx — Formulario de registro con autologin automático.
 *
 * Contexto:
 * - Usa useAuth hook centralizado para registro con autologin.
 * - Redirección automática según rol tras registro exitoso.
 * - Compatible con React Web y React Native.
 * - Arquitectura limpia: navegación delegada al componente padre.
 *
 * Flujo:
 * 1. Usuario completa formulario → useAuth.register()
 * 2. Backend devuelve tokens → autologin automático
 * 3. Redirección automática según rol (trainer/athlete/admin)
 *
 * @since v1.0.0
 * @updated v2.0.0 - Integración con useAuth y autologin
 */

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useAuth } from "@nexia/shared/hooks/useAuth";
import { loginFailure } from "@nexia/shared/store/authSlice";
import { useAuthForm } from "@nexia/shared/hooks/useAuthForm";
import { USER_ROLES } from "@nexia/shared/config/constants";
import { validateRegisterForm } from "@nexia/shared/utils/validations";
import type { AppDispatch } from "@nexia/shared/store";
import type { RegisterCredentials, UserRole } from "@nexia/shared/types/auth";
import type { SelectOption } from "@/components/ui/forms";

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    nombre: string;
    apellidos: string;
    role: UserRole | ""; // Puede empezar vacío hasta que el usuario seleccione
    [key: string]: unknown;
}

const initialFormState: RegisterFormData = {
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellidos: "",
    role: "",
};

// Opciones para el selector de roles - Solo registro público
const roleOptions: SelectOption[] = [
    { value: USER_ROLES.TRAINER, label: "Entrenador Personal" },
    { value: USER_ROLES.ATHLETE, label: "Atleta" },
];

export const RegisterForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Hook centralizado de autenticación con autologin
    const { register, isLoading, error } = useAuth();

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
        validate: validateRegisterForm,
    });

    // Usar error del hook useAuth si está disponible, sino usar serverError del form
    const displayError = error || serverError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            // Validación explícita de role
            if (!formData.role) {
                dispatch(loginFailure("Debes seleccionar un tipo de cuenta"));
                return;
            }

            const credentials: RegisterCredentials = {
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                role: formData.role as UserRole,
            };

            // Usar hook centralizado con autologin automático
            await register(credentials);

            // Redirección automática según rol (manejada por useAuth)
            const redirectPath = getRedirectPath(formData.role as UserRole);
            navigate(redirectPath, { replace: true });

        } catch (error) {
            const errorMessage = handleServerError(
                error as Parameters<typeof handleServerError>[0]
            );
            dispatch(loginFailure(errorMessage));
        }
    };

    // Función helper para obtener ruta de redirección según rol
    const getRedirectPath = (role: UserRole): string => {
        switch (role) {
            case USER_ROLES.TRAINER:
                return "/dashboard/trainer";
            case USER_ROLES.ATHLETE:
                return "/dashboard/athlete";
            case USER_ROLES.ADMIN:
                return "/dashboard/admin";
            default:
                return "/dashboard";
        }
    };

    const handleLogin = () => {
        navigate("/auth/login");
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className={`${TYPOGRAPHY.pageTitle} mb-2 text-primary-400`}>
                    Únete a NEXIA
                </h1>
                <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                    Crea tu cuenta para empezar a entrenar de forma profesional
                </p>
            </div>

            <ServerErrorBanner error={displayError} onDismiss={clearErrors} />

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
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        type="text"
                        label="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange("nombre")}
                        error={errors.nombre}
                        placeholder="Tu nombre"
                        isRequired
                        disabled={isLoading}
                    />

                    <Input
                        type="text"
                        label="Apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange("apellidos")}
                        error={errors.apellidos}
                        placeholder="Tus apellidos"
                        isRequired
                        disabled={isLoading}
                    />
                </div>

                <FormSelect
                    label="Tipo de cuenta"
                    value={formData.role}
                    onChange={handleInputChange("role")}
                    options={roleOptions}
                    error={errors.role}
                    placeholder="Selecciona tu tipo de cuenta"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    error={errors.password}
                    placeholder="Mínimo 6 caracteres"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    error={errors.confirmPassword}
                    placeholder="Repite tu contraseña"
                    isRequired
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={BUTTON_PRESETS.formPrimary}
                >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={handleLogin}
                        className={`${TYPOGRAPHY.linkText} text-blue-600 hover:text-blue-700 underline disabled:opacity-50`}
                        disabled={isLoading}
                    >
                        Inicia sesión
                    </button>
                </div>
            </form>
        </div>
    );
};

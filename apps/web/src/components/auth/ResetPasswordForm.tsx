/**
 * Formulario de reseteo de contraseña usando arquitectura reutilizable.
 * Usa useAuthForm hook + validation utilities + ServerErrorBanner.
 * Siguiendo mismos patrones que RegisterForm para consistencia.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useResetPasswordMutation } from "@shared/api/authApi";
import { useAuthForm } from "@shared/hooks/useAuthForm";
import { validateResetPasswordForm } from "@shared/utils/validation";
import type { ResetPasswordData } from "@shared/types/auth";

interface ResetPasswordFormData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export const ResetPasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [isPasswordReset, setIsPasswordReset] = React.useState(false);

    // Obtener token de la URL
    const tokenFromUrl = searchParams.get("token") || "";

    const initialFormState: ResetPasswordFormData = {
        token: tokenFromUrl,
        newPassword: "",
        confirmPassword: "",
    };

    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        handleServerError,
        clearErrors,
        setFormData,
    } = useAuthForm({
        initialState: initialFormState,
        validate: validateResetPasswordForm,
    });

    // Validar que hay token al cargar
    React.useEffect(() => {
        if (!tokenFromUrl) {
            // 🔹 Log solo para desarrolladores
            console.error("[ResetPasswordForm] Falta token en la URL. No se puede proceder al reseteo.");

            // 🔹 Mensaje claro para el usuario final
            handleServerError({
                status: 400,
                data: { detail: "El enlace de recuperación no es válido. Solicita uno nuevo para continuar." }
            });
        } else {
            setFormData(prev => ({ ...prev, token: tokenFromUrl }));
        }
    }, [tokenFromUrl, handleServerError, setFormData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            const resetData: ResetPasswordData = {
                token: formData.token,
                password: formData.newPassword,
            };

            await resetPassword(resetData).unwrap();
            setIsPasswordReset(true);
        } catch (error: any) {
            handleServerError(error);
        }
    };

    const handleBackToLogin = () => {
        navigate("/auth/login");
    };

    const handleRequestNewToken = () => {
        navigate("/auth/forgot-password");
    };

    // Vista de éxito después de resetear contraseña
    if (isPasswordReset) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-2 text-primary-400">
                        Contraseña actualizada
                    </h1>
                    <p className="text-gray-600">
                        Tu contraseña ha sido cambiada exitosamente
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm font-medium">
                        Ya puedes iniciar sesión con tu nueva contraseña
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleBackToLogin}
                    className="w-full"
                >
                    Iniciar sesión
                </Button>
            </div>
        );
    }

    // Vista del formulario
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-2 text-primary-400">
                    Nueva contraseña
                </h1>
                <p className="text-gray-600">
                    Introduce tu nueva contraseña para tu cuenta
                </p>
            </div>

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    type="password"
                    label="Nueva contraseña"
                    value={formData.newPassword}
                    onChange={handleInputChange("newPassword")}
                    error={errors.newPassword}
                    placeholder="Mínimo 6 caracteres"
                    isRequired
                    disabled={isLoading}
                />

                <Input
                    type="password"
                    label="Confirmar nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    error={errors.confirmPassword}
                    placeholder="Repite tu nueva contraseña"
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
                    {isLoading ? "Actualizando contraseña..." : "Cambiar contraseña"}
                </Button>

                <div className="text-center space-y-2">
                    <div className="text-sm text-gray-600">
                        <button
                            type="button"
                            onClick={handleRequestNewToken}
                            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Tu enlace ha caducado. Solicita uno nuevo
                        </button>

                    </div>

                    <div className="text-sm text-gray-600">
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="text-blue-600 hover:text-blue-700 font-medium underline disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Volver al login
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

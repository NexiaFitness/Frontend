/**
 * ResetPasswordForm.tsx — Formulario de reseteo de contraseña profesional.
 *
 * Contexto:
 * - Usa useAuthForm para validaciones consistentes.
 * - Conectado a RTK Query (useResetPasswordMutation).
 * - Feedback de loading: spinner (desde Button) + texto accesible.
 *
 * Notas de mantenimiento:
 * - Token obtenido desde URL.
 * - Vista de éxito con feedback consistente.
 * - No modifica Redux, solo estado local.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v4.3.1 - Typography system integration + BUTTON_PRESETS unificado
 */

import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useResetPasswordMutation } from "@nexia/shared/api/authApi";
import { useAuthForm } from "@nexia/shared/hooks/useAuthForm";
import { validateResetPasswordForm } from "@nexia/shared/utils/validations";
import type { ResetPasswordData } from "@nexia/shared/types/auth";

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

    // useEffect AHORA ES SEGURO con funciones estables
    React.useEffect(() => {
        if (!tokenFromUrl) {
            console.error(
                "[ResetPasswordForm] Falta token en la URL. No se puede proceder al reseteo."
            );
            handleServerError({
                status: 400,
                data: {
                    detail:
                        "El enlace de recuperación no es válido. Solicita uno nuevo para continuar.",
                },
            });
        } else {
            setFormData((prev) => ({ ...prev, token: tokenFromUrl }));
        }
    }, [tokenFromUrl, handleServerError, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            const resetData: ResetPasswordData = {
                token: formData.token,
                new_password: formData.newPassword,
            };

            await resetPassword(resetData).unwrap();
            setIsPasswordReset(true);
        } catch (error) {
            handleServerError(error as Parameters<typeof handleServerError>[0]);
        }
    };

    const handleBackToLogin = () => navigate("/auth/login");
    const handleRequestNewToken = () => navigate("/auth/forgot-password");

    // Vista de éxito después de resetear contraseña
    if (isPasswordReset) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-primary">
                        Contraseña actualizada
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Tu contraseña ha sido cambiada exitosamente
                    </p>
                </div>

                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">
                        Ya puedes iniciar sesión con tu nueva contraseña
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleBackToLogin}
                    className="w-full text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3"
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-primary">
                    Nueva contraseña
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Introduce tu nueva contraseña para tu cuenta
                </p>
            </div>

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3"
                >
                    {isLoading ? "Actualizando contraseña..." : "Cambiar contraseña"}
                </Button>

                <div className="flex flex-col space-y-2 text-center text-sm">
                    <button
                        type="button"
                        onClick={handleRequestNewToken}
                        className="text-sm sm:text-base font-medium text-primary underline underline-offset-4 hover:text-primary/90 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        Tu enlace ha caducado. Solicita uno nuevo
                    </button>

                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-sm sm:text-base font-medium text-primary underline underline-offset-4 hover:text-primary/90 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        Volver al login
                    </button>
                </div>
            </form>
        </div>
    );
};

/**
 * ForgotPasswordForm.tsx — Formulario de recuperación de contraseña profesional.
 *
 * Contexto:
 * - Usa useAuthForm para validaciones consistentes.
 * - Conectado a RTK Query (useForgotPasswordMutation).
 * - Feedback de loading y tipografía unificada.
 *
 * Notas de mantenimiento:
 * - Feedback visual consistente con LoginForm y ResetPasswordForm.
 * - Accesibilidad: inputs y enlaces se deshabilitan durante loading.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v4.3.1 - Typography system integration + BUTTON_PRESETS unificado
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useForgotPasswordMutation } from "@nexia/shared/api/authApi";
import { useAuthForm } from "@nexia/shared/hooks/useAuthForm";
import { validateForgotPasswordForm } from "@nexia/shared/utils/validations";

interface ForgotPasswordFormData {
    email: string;
}

const initialFormState: ForgotPasswordFormData = { email: "" };

export const ForgotPasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [isEmailSent, setIsEmailSent] = React.useState(false);

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
        validate: validateForgotPasswordForm,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        clearErrors();

        try {
            await forgotPassword({ email: formData.email }).unwrap();
            setIsEmailSent(true);
        } catch (error) {
            handleServerError(error as Parameters<typeof handleServerError>[0]);
        }
    };

    const handleBackToLogin = () => navigate("/auth/login");

    // Vista de éxito después de enviar email
    if (isEmailSent) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                        Correo enviado
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Revisa tu bandeja de entrada para recuperar tu contraseña
                    </p>
                </div>

                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">
                        Te hemos enviado un enlace de recuperación a{" "}
                        <strong>{formData.email}</strong>
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleBackToLogin}
                    className="w-full"
                >
                    Volver al login
                </Button>
            </div>
        );
    }

    // Vista del formulario
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    Recuperar contraseña
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Introduce tu correo electrónico para recuperar tu contraseña
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
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    ¿Recordaste tu contraseña?{" "}
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                    >
                        Volver al login
                    </button>
                </div>
            </form>
        </div>
    );
};

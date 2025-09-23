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
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useForgotPasswordMutation } from "@shared/api/authApi";
import { useAuthForm } from "@shared/hooks/useAuthForm";
import { validateForgotPasswordForm } from "@shared/utils/validation";

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
                    <h1 className={`${TYPOGRAPHY.pageTitle} mb-2 text-primary-400`}>
                        Correo enviado
                    </h1>
                    <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                        Revisa tu bandeja de entrada para recuperar tu contraseña
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className={TYPOGRAPHY_COMBINATIONS.successMessage}>
                        Te hemos enviado un enlace de recuperación a{" "}
                        <strong>{formData.email}</strong>
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleBackToLogin}
                    className={BUTTON_PRESETS.formPrimary}
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
                <h1 className={`${TYPOGRAPHY.pageTitle} mb-2 text-primary-400`}>
                    Recuperar contraseña
                </h1>
                <p className={`${TYPOGRAPHY.body} text-gray-600`}>
                    Introduce tu correo electrónico para recuperar tu contraseña
                </p>
            </div>

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
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={BUTTON_PRESETS.formPrimary}
                >
                    {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                    ¿Recordaste tu contraseña?{" "}
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className={`${TYPOGRAPHY.linkText} text-blue-600 hover:text-blue-700 underline disabled:opacity-50`}
                        disabled={isLoading}
                    >
                        Volver al login
                    </button>
                </div>
            </form>
        </div>
    );
};

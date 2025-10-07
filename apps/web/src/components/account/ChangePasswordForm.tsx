/**
 * ChangePasswordForm.tsx — Formulario de cambio de contraseña profesional.
 *
 * Contexto:
 * - Usa useAuthForm para validaciones consistentes.
 * - Conectado a RTK Query (useChangePasswordMutation).
 * - Feedback de loading y tipografía unificada con auth forms.
 *
 * Notas de mantenimiento:
 * - Success y error usan tipografía consistente.
 * - Botón unificado con BUTTON_PRESETS.
 *
 * @author Frontend
 * @since v4.2.0
 * @updated v4.3.6 - Typography system integration + BUTTON_PRESETS unificado
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useChangePasswordMutation } from "@shared/api/accountApi";
import { useAuthForm } from "@shared/hooks/useAuthForm";
import { validateChangePasswordForm } from "@shared/utils/validations";

interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    [key: string]: unknown;
}

export const ChangePasswordForm: React.FC = () => {
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        handleServerError,
        clearErrors,
        resetForm,
    } = useAuthForm<ChangePasswordFormData>({
        initialState: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validate: validateChangePasswordForm,
    });

    const [successMessage, setSuccessMessage] = React.useState<string | null>(
        null
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (!validateForm()) return;
        clearErrors();

        try {
            await changePassword({
                current_password: formData.currentPassword,
                new_password: formData.newPassword,
            }).unwrap();

            setSuccessMessage("Contraseña actualizada correctamente");
            resetForm();

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            handleServerError(error as Parameters<typeof handleServerError>[0]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
                <h2 className={`${TYPOGRAPHY.pageTitle} text-slate-800 mb-2`}>
                    Seguridad
                </h2>
                <p className={`${TYPOGRAPHY.body} text-slate-600`}>
                    Cambia tu contraseña para mantener tu cuenta segura
                </p>
            </div>

            {/* Success message */}
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
                    type="password"
                    label="Contraseña actual"
                    value={formData.currentPassword}
                    onChange={handleInputChange("currentPassword")}
                    error={errors.currentPassword}
                    placeholder="Introduce tu contraseña actual"
                    isRequired
                    disabled={isLoading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isLoading}
                        disabled={isLoading}
                        className={BUTTON_PRESETS.formPrimary + " md:w-auto md:min-w-[180px]"}
                    >
                        {isLoading ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

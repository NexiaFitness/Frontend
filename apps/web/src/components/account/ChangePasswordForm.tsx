/**
 * Formulario de cambio de contraseña optimizado para dashboard context
 * CONSISTENTE con patrón de auth forms
 * 
 * @author Frontend Team
 * @since v4.2.0 - Simplified, consistent with auth forms pattern
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useChangePasswordMutation } from "@shared/api/accountApi";
import { useAuthForm } from "@shared/hooks/useAuthForm";
import { validateChangePasswordForm } from "@shared/utils/validation";

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

    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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
            {/* Header - consistent with auth forms */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Seguridad</h2>
                <p className="text-slate-600">
                    Cambia tu contraseña para mantener tu cuenta segura
                </p>
            </div>

            {/* Success message - consistent with auth styling */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm font-medium">{successMessage}</p>
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
                        isLoading={isLoading}
                        className="px-8 min-w-[180px]"
                    >
                        {isLoading ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
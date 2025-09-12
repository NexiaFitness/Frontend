/**
 * Formulario de cambio de contraseña optimizado para dashboard context
 * Permite al usuario actualizar su contraseña desde el dashboard,
 * validando la contraseña actual y estableciendo una nueva.
 * REDISEÑADO: Cohesivo con ProfileForm glassmorphism card design
 *
 * Reglas de negocio:
 * - Todos los roles (Trainer, Athlete, Admin) pueden cambiar contraseña.
 * - No se usa token (a diferencia de ResetPassword), ya que el usuario está logueado.
 *
 * Notas:
 * - Usa RTK Query (accountApi) -> useChangePasswordMutation.
 * - Validación: current_password obligatorio, nueva contraseña >= 6 caracteres, confirmación igual.
 * - Se renderiza dentro de ProfileForm card, sin headers propios.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.3.0 - Dashboard-optimized design consistency
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

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            handleServerError(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header - consistent with ProfileForm sections */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Seguridad</h2>
                <p className="text-slate-600">
                    Cambia tu contraseña para mantener tu cuenta segura
                </p>
            </div>

            {/* Success message - consistent with dashboard styling */}
            {successMessage && (
                <div className="bg-green-50/95 backdrop-blur-sm border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-800 font-medium">{successMessage}</p>
                    </div>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    type="password"
                    label="Contraseña actual"
                    value={formData.currentPassword}
                    onChange={handleInputChange("currentPassword")}
                    error={errors.currentPassword}
                    placeholder="Introduce tu contraseña actual"
                    isRequired
                    disabled={isLoading}
                    size="lg"
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
                        size="lg"
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
                        size="lg"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
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
/**
 * ChangePasswordForm.tsx — Formulario de cambio de contraseña (plataforma).
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import { useChangePasswordForm } from "@/hooks/account/useChangePasswordForm";

export const ChangePasswordForm: React.FC = () => {
    const {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleSubmit,
        clearErrors,
        onFieldChange,
    } = useChangePasswordForm();

    return (
        <div className="space-y-6">
            <div className="mb-8 text-center md:text-left">
                <h2 className="mb-2 text-xl font-bold text-foreground">Seguridad</h2>
                <p className="text-sm text-muted-foreground">
                    Cambia tu contraseña para mantener tu cuenta segura
                </p>
            </div>

            {successMessage && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                    <p className="text-sm font-medium text-success">{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <Input
                    type="password"
                    label="Contraseña actual"
                    value={formData.currentPassword}
                    onChange={onFieldChange("currentPassword")}
                    error={errors.currentPassword}
                    placeholder="Introduce tu contraseña actual"
                    isRequired
                    disabled={isLoading}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Input
                        type="password"
                        label="Nueva contraseña"
                        value={formData.newPassword}
                        onChange={onFieldChange("newPassword")}
                        error={errors.newPassword}
                        placeholder="Mínimo 6 caracteres"
                        isRequired
                        disabled={isLoading}
                    />

                    <Input
                        type="password"
                        label="Confirmar nueva contraseña"
                        value={formData.confirmPassword}
                        onChange={onFieldChange("confirmPassword")}
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
                        className="w-full px-4 py-2.5 text-base md:w-auto md:min-w-[180px] lg:px-6 lg:py-3 lg:text-lg"
                    >
                        {isLoading ? "Actualizando..." : "Actualizar"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

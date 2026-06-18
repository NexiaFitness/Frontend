/**
 * AthleteChangePasswordSheetForm.tsx — Campos contraseña para BottomSheet V13.
 */

import React from "react";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import type { useChangePasswordForm } from "@/hooks/account/useChangePasswordForm";

type ChangePasswordFormState = ReturnType<typeof useChangePasswordForm>;

export interface AthleteChangePasswordSheetFormProps {
    form: ChangePasswordFormState;
    formId?: string;
}

export const AthleteChangePasswordSheetForm: React.FC<
    AthleteChangePasswordSheetFormProps
> = ({ form, formId = "athlete-change-password-form" }) => {
    const {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleSubmit,
        clearErrors,
        onFieldChange,
    } = form;

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
            {successMessage && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-3">
                    <p className="text-sm font-medium text-success">{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={clearErrors} />

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
        </form>
    );
};

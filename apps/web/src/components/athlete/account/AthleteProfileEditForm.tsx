/**
 * AthleteProfileEditForm.tsx — Formulario editar perfil (presentacional V13).
 */

import React from "react";
import { Input } from "@/components/ui/forms";
import { ServerErrorBanner } from "@/components/ui/feedback";
import type { AccountProfileFormState } from "@/hooks/account/useAccountProfileUpdate";

export interface AthleteProfileEditFormProps {
    profile: AccountProfileFormState;
    formId?: string;
}

export const AthleteProfileEditForm: React.FC<AthleteProfileEditFormProps> = ({
    profile,
    formId = "athlete-profile-edit-form",
}) => {
    const {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleInputChange,
        handleSubmit,
        dismissServerError,
    } = profile;

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
            {successMessage && (
                <div className="rounded-lg border border-success/30 bg-success/10 p-3">
                    <p className="text-sm font-medium text-success">{successMessage}</p>
                </div>
            )}

            <ServerErrorBanner error={serverError} onDismiss={dismissServerError} />

            <Input
                type="text"
                label="Nombre"
                value={formData.nombre || ""}
                onChange={handleInputChange("nombre")}
                error={errors.nombre}
                placeholder="Tu nombre"
                isRequired
                disabled={isLoading}
            />

            <Input
                type="text"
                label="Apellidos"
                value={formData.apellidos || ""}
                onChange={handleInputChange("apellidos")}
                error={errors.apellidos}
                placeholder="Tus apellidos"
                isRequired
                disabled={isLoading}
            />

            <Input
                type="email"
                label="Correo electrónico"
                value={formData.email || ""}
                onChange={handleInputChange("email")}
                error={errors.email}
                placeholder="Introduce tu correo"
                isRequired
                disabled={isLoading}
            />
        </form>
    );
};

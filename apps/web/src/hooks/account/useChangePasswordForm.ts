/**
 * useChangePasswordForm.ts — Lógica cambio contraseña (todos los roles).
 */

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
    useChangePasswordMutation,
    useAuthForm,
    validateChangePasswordForm,
} from "@nexia/shared";

interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    [key: string]: unknown;
}

export function useChangePasswordForm() {
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

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
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

    const onFieldChange =
        (field: keyof ChangePasswordFormData) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            handleInputChange(field)(e);
        };

    return {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleSubmit,
        clearErrors,
        onFieldChange,
    };
}

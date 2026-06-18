/**
 * useAccountProfileUpdate.ts — Actualización perfil cuenta (todos los roles).
 * Contexto: ProfileForm plataforma + AthleteAccountPage V13. Sin DOM.
 */

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setCurrentUser, useUpdateAccountMutation } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import type { UpdateAccountPayload } from "@nexia/shared/types/account";

function getServerErrorMessage(err: unknown): string {
    if (typeof err === "object" && err !== null && "data" in err) {
        const maybe = err as { data?: { detail?: string } };
        return maybe?.data?.detail || "Error al actualizar la cuenta";
    }
    return "Error al actualizar la cuenta";
}

export interface AccountProfileFormState {
    formData: UpdateAccountPayload;
    errors: Partial<UpdateAccountPayload>;
    serverError: string | null;
    successMessage: string | null;
    isLoading: boolean;
    handleInputChange: (
        field: keyof UpdateAccountPayload
    ) => (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
    clearSuccess: () => void;
    dismissServerError: () => void;
}

export function useAccountProfileUpdate(): AccountProfileFormState {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);
    const [updateAccount, { isLoading }] = useUpdateAccountMutation();

    const [formData, setFormData] = useState<UpdateAccountPayload>({
        nombre: "",
        apellidos: "",
        email: "",
    });
    const [errors, setErrors] = useState<Partial<UpdateAccountPayload>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                apellidos: user.apellidos,
                email: user.email,
            });
        }
    }, [user]);

    const handleInputChange = useCallback(
        (field: keyof UpdateAccountPayload) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({ ...prev, [field]: e.target.value }));
                setErrors((prev) =>
                    prev[field] ? { ...prev, [field]: undefined } : prev
                );
            },
        []
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<UpdateAccountPayload> = {};
        if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.apellidos) newErrors.apellidos = "Los apellidos son obligatorios";
        if (!formData.email) newErrors.email = "El email es obligatorio";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setServerError(null);
            setSuccessMessage(null);

            if (!validateForm()) return;

            try {
                const updated = await updateAccount(formData).unwrap();
                dispatch(setCurrentUser(updated));
                setSuccessMessage("Perfil actualizado correctamente");
            } catch (err) {
                setServerError(getServerErrorMessage(err));
            }
        },
        [dispatch, formData, updateAccount, validateForm]
    );

    const clearSuccess = useCallback(() => setSuccessMessage(null), []);
    const dismissServerError = useCallback(() => setServerError(null), []);

    return {
        formData,
        errors,
        serverError,
        successMessage,
        isLoading,
        handleInputChange,
        handleSubmit,
        clearSuccess,
        dismissServerError,
    };
}

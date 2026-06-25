/**
 * useInvitationAccept — validación de token y aceptación de invitación (Fase 4 FE).
 */

import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
    useAcceptInvitationMutation,
    useValidateInvitationQuery,
} from "../../api/invitationsApi";
import { useAuthForm } from "../useAuthForm";
import { validateInvitationAcceptForm } from "../../utils/validations/auth/validation";
import type { RootState } from "../../store";
import type { InvitationAcceptResponse } from "../../types/invitation";

export interface InvitationAcceptFormData {
    nombre: string;
    apellidos: string;
    password: string;
    confirmPassword: string;
    tosAccepted: boolean;
    confirmTrainerSwitch: boolean;
    [key: string]: unknown;
}

const INITIAL_FORM: InvitationAcceptFormData = {
    nombre: "",
    apellidos: "",
    password: "",
    confirmPassword: "",
    tosAccepted: false,
    confirmTrainerSwitch: false,
};

function getFetchErrorDetail(error: unknown): string {
    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (typeof data === "string") return data;
        if (data && typeof data === "object") {
            if ("detail" in data) {
                const detail = (data as { detail?: unknown }).detail;
                if (typeof detail === "string") return detail;
                if (detail && typeof detail === "object" && "message" in detail) {
                    return String((detail as { message?: unknown }).message);
                }
            }
            if ("message" in data) {
                return String((data as { message?: unknown }).message);
            }
        }
    }
    return "No se pudo aceptar la invitación. Inténtalo de nuevo.";
}

export interface UseInvitationAcceptOptions {
    onRequiresLogin?: (email: string) => void;
}

export function useInvitationAccept(
    token: string | null,
    options: UseInvitationAcceptOptions = {},
) {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const {
        data: validation,
        isLoading: isValidating,
        isError: isValidateError,
        error: validateError,
    } = useValidateInvitationQuery(token ?? "", { skip: !token });

    const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();

    const requiresPassword = Boolean(validation?.valid && !validation.user_exists);
    const requiresTrainerSwitch = Boolean(validation?.valid && validation.requires_trainer_switch);

    const validateFn = useCallback(
        (data: InvitationAcceptFormData) =>
            validateInvitationAcceptForm({
                ...data,
                requiresPassword,
                requiresTrainerSwitch,
            }),
        [requiresPassword, requiresTrainerSwitch],
    );

    const {
        formData,
        errors,
        serverError,
        setFormData,
        handleInputChange,
        validateForm,
        handleServerError,
        clearErrors,
    } = useAuthForm({
        initialState: INITIAL_FORM,
        validate: validateFn,
    });

    const needsLogin = Boolean(
        validation?.valid && validation.user_exists && !isAuthenticated,
    );

    const wrongAccount = useMemo(() => {
        if (!validation?.valid || !validation.user_exists || !isAuthenticated || !user?.email) {
            return false;
        }
        return user.email.trim().toLowerCase() !== validation.email?.trim().toLowerCase();
    }, [isAuthenticated, user?.email, validation]);

    const setCheckbox = useCallback(
        (field: "tosAccepted" | "confirmTrainerSwitch", checked: boolean) => {
            setFormData((prev) => ({ ...prev, [field]: checked }));
        },
        [setFormData],
    );

    const requestLogin = useCallback(() => {
        if (!validation?.email) return;
        options.onRequiresLogin?.(validation.email);
    }, [options, validation?.email]);

    const submitAccept = useCallback(async (): Promise<InvitationAcceptResponse | null> => {
        if (!token || !validation?.valid) return null;
        if (needsLogin) {
            requestLogin();
            return null;
        }
        if (wrongAccount) {
            handleServerError({
                status: 401,
                data: {
                    detail: `Inicia sesión con ${validation.email} para aceptar esta invitación.`,
                },
            });
            return null;
        }
        if (!validateForm()) return null;
        clearErrors();

        try {
            return await acceptInvitation({
                token,
                password: requiresPassword ? formData.password : undefined,
                nombre: formData.nombre.trim(),
                apellidos: formData.apellidos.trim(),
                tos_accepted: formData.tosAccepted,
                confirm_trainer_switch: formData.confirmTrainerSwitch,
                tos_version: "1.0",
            }).unwrap();
        } catch (error) {
            handleServerError({
                status: (error as { status?: number })?.status ?? 500,
                data: { detail: getFetchErrorDetail(error) },
            });
            return null;
        }
    }, [
        acceptInvitation,
        clearErrors,
        formData,
        handleServerError,
        needsLogin,
        requestLogin,
        requiresPassword,
        token,
        validateForm,
        validation,
        wrongAccount,
    ]);

    return {
        validation,
        isValidating,
        isValidateError,
        validateError,
        isAccepting,
        formData,
        errors,
        serverError,
        clearErrors,
        handleInputChange,
        setCheckbox,
        requiresPassword,
        requiresTrainerSwitch,
        needsLogin,
        wrongAccount,
        requestLogin,
        submitAccept,
    };
}

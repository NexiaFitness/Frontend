/**
 * useClientInvite — lógica de envío de invitación a atleta (precheck + transfer ack).
 */

import { useCallback, useState } from "react";
import {
    useLazyPrecheckInvitationEmailQuery,
    useResendInvitationMutation,
    useSendInvitationMutation,
} from "../../api/invitationsApi";
import type { Invitation, InvitationWarning } from "../../types/invitation";

export interface ClientInviteFormValues {
    nombre: string;
    apellidos: string;
    email: string;
}

export interface UseClientInviteResult {
    values: ClientInviteFormValues;
    setField: (field: keyof ClientInviteFormValues, value: string) => void;
    isSubmitting: boolean;
    errorMessage: string | null;
    clearError: () => void;
    pendingWarnings: InvitationWarning[];
    showTransferModal: boolean;
    confirmTransferAndSend: () => Promise<Invitation | null>;
    dismissTransferModal: () => void;
    submitInvite: () => Promise<Invitation | null>;
    resendBlockedInvitation: () => Promise<Invitation | null>;
    blockedInvitationId: number | null;
    lastInvitation: Invitation | null;
    resetSuccess: () => void;
}

const INITIAL_VALUES: ClientInviteFormValues = {
    nombre: "",
    apellidos: "",
    email: "",
};

function getFetchErrorDetail(error: unknown): string {
    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (data && typeof data === "object" && "detail" in data) {
            const detail = (data as { detail?: unknown }).detail;
            if (typeof detail === "string") return detail;
            if (Array.isArray(detail) && detail.length > 0) {
                const first = detail[0] as { msg?: string };
                if (first?.msg) return first.msg;
            }
        }
    }
    return "No se pudo enviar la invitación. Inténtalo de nuevo.";
}

export function useClientInvite(): UseClientInviteResult {
    const [values, setValues] = useState<ClientInviteFormValues>(INITIAL_VALUES);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [pendingWarnings, setPendingWarnings] = useState<InvitationWarning[]>([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [lastInvitation, setLastInvitation] = useState<Invitation | null>(null);
    const [blockedInvitationId, setBlockedInvitationId] = useState<number | null>(null);

    const [precheckInvitation] = useLazyPrecheckInvitationEmailQuery();
    const [sendInvitation, { isLoading: isSending }] = useSendInvitationMutation();
    const [resendInvitation, { isLoading: isResending }] = useResendInvitationMutation();

    const setField = useCallback((field: keyof ClientInviteFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrorMessage(null);
        setBlockedInvitationId(null);
    }, []);

    const clearError = useCallback(() => setErrorMessage(null), []);

    const resetSuccess = useCallback(() => {
        setLastInvitation(null);
        setValues(INITIAL_VALUES);
        setPendingWarnings([]);
        setShowTransferModal(false);
        setBlockedInvitationId(null);
    }, []);

    const sendWithPayload = useCallback(
        async (acknowledgeTransfer: boolean): Promise<Invitation | null> => {
            try {
                const result = await sendInvitation({
                    nombre: values.nombre.trim(),
                    apellidos: values.apellidos.trim(),
                    email: values.email.trim(),
                    acknowledge_transfer: acknowledgeTransfer,
                }).unwrap();
                setLastInvitation(result);
                setShowTransferModal(false);
                setPendingWarnings([]);
                return result;
            } catch (error) {
                setErrorMessage(getFetchErrorDetail(error));
                return null;
            }
        },
        [sendInvitation, values],
    );

    const submitInvite = useCallback(async (): Promise<Invitation | null> => {
        setErrorMessage(null);
        setLastInvitation(null);
        setBlockedInvitationId(null);

        const nombre = values.nombre.trim();
        const email = values.email.trim();
        if (!nombre) {
            setErrorMessage("El nombre es obligatorio.");
            return null;
        }
        if (!email) {
            setErrorMessage("El correo electrónico es obligatorio.");
            return null;
        }

        try {
            const precheck = await precheckInvitation(email).unwrap();
            if (!precheck.can_invite) {
                const pendingWarning = precheck.warnings.find(
                    (w) => w.code === "pending_invitation",
                );
                if (pendingWarning?.invitation_id) {
                    setBlockedInvitationId(pendingWarning.invitation_id);
                }
                const blocked =
                    precheck.warnings[0]?.message
                    ?? "No puedes invitar a este correo en este momento.";
                setErrorMessage(blocked);
                return null;
            }

            const transferWarnings = precheck.warnings.filter(
                (w) => w.requires_acknowledgement,
            );
            if (transferWarnings.length > 0) {
                setPendingWarnings(transferWarnings);
                setShowTransferModal(true);
                return null;
            }

            return sendWithPayload(false);
        } catch (error) {
            setErrorMessage(getFetchErrorDetail(error));
            return null;
        }
    }, [precheckInvitation, sendWithPayload, values]);

    const confirmTransferAndSend = useCallback(
        () => sendWithPayload(true),
        [sendWithPayload],
    );

    const dismissTransferModal = useCallback(() => {
        setShowTransferModal(false);
        setPendingWarnings([]);
    }, []);

    const resendBlockedInvitation = useCallback(async (): Promise<Invitation | null> => {
        if (!blockedInvitationId) {
            return null;
        }
        setErrorMessage(null);
        try {
            const result = await resendInvitation(blockedInvitationId).unwrap();
            setLastInvitation(result);
            setBlockedInvitationId(null);
            return result;
        } catch (error) {
            setErrorMessage(getFetchErrorDetail(error));
            return null;
        }
    }, [blockedInvitationId, resendInvitation]);

    return {
        values,
        setField,
        isSubmitting: isSending || isResending,
        errorMessage,
        clearError,
        pendingWarnings,
        showTransferModal,
        confirmTransferAndSend,
        dismissTransferModal,
        submitInvite,
        resendBlockedInvitation,
        blockedInvitationId,
        lastInvitation,
        resetSuccess,
    };
}

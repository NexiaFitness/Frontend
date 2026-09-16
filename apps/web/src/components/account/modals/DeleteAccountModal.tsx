/**
 * DeleteAccountModal.tsx — Confirmación eliminar cuenta (NexiaPremiumConfirmModal).
 */

import React from "react";

import { useDeleteAccountMutation } from "@nexia/shared";

import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess?: () => void;
    userName?: string;
    userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isOpen,
    onClose,
    onDeleteSuccess,
    userName,
    userEmail,
}) => {
    const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

    const handleDelete = async () => {
        try {
            await deleteAccount().unwrap();
            onDeleteSuccess?.();
            onClose();
        } catch (error) {
            console.error("[DeleteAccountModal] Error al eliminar cuenta:", error);
        }
    };

    const identity =
        userName != null
            ? `${userName}${userEmail ? ` · ${userEmail}` : ""}`
            : userEmail ?? null;

    return (
        <NexiaPremiumConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleDelete}
            isLoading={isLoading}
            loadingConfirmLabel="Eliminando…"
            title="Eliminar cuenta"
            description={
                identity ? (
                    <>
                        ¿Estás seguro de que quieres eliminar tu cuenta{" "}
                        <span className={NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS}>
                            ({identity})
                        </span>
                        ?
                    </>
                ) : (
                    "¿Estás seguro de que quieres eliminar tu cuenta?"
                )
            }
            bodyContent={
                <p className={NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS}>
                    Esta acción es irreversible.
                </p>
            }
            confirmLabel="Eliminar cuenta"
        />
    );
};

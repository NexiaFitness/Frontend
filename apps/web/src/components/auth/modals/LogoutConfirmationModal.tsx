/**
 * LogoutConfirmationModal.tsx — Confirmación cerrar sesión (NexiaPremiumConfirmModal).
 */

import React from "react";

import { NexiaPremiumConfirmModal } from "@/components/ui/modals";

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    userName?: string;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    isLoading = false,
    userName,
}) => {
    const description = userName
        ? `¿Seguro que quieres cerrar sesión, ${userName}?`
        : "¿Seguro que deseas cerrar sesión?";

    return (
        <NexiaPremiumConfirmModal
            isOpen={isOpen}
            onClose={onCancel}
            onConfirm={onConfirm}
            isLoading={isLoading}
            loadingConfirmLabel="Cerrando…"
            title="¿Cerrar sesión?"
            description={description}
            confirmLabel="Cerrar sesión"
            confirmVariant="destructive"
        />
    );
};

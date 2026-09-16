/**
 * DiscardUnsavedChangesModal — Confirmación salir sin guardar (NexiaPremiumConfirmModal).
 */

import React from "react";

import { NexiaPremiumConfirmModal } from "./NexiaPremiumConfirmModal";

interface DiscardUnsavedChangesModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export const DiscardUnsavedChangesModal: React.FC<DiscardUnsavedChangesModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title = "¿Descartar cambios?",
    description = "Tienes cambios sin guardar. Si sales ahora se perderán.",
    confirmLabel = "Salir sin guardar",
    cancelLabel = "Seguir editando",
}) => (
    <NexiaPremiumConfirmModal
        isOpen={isOpen}
        onClose={onCancel}
        onConfirm={onConfirm}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        confirmVariant="destructive"
    />
);

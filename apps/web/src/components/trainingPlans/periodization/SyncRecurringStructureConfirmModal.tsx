/**
 * SyncRecurringStructureConfirmModal — Confirmación guardar estructura recurrente (premium).
 */

import React from "react";

import { NexiaPremiumConfirmModal } from "@/components/ui/modals";

import { buildSyncRecurringConfirmMessage } from "./syncRecurringStructureConfirm";

interface Props {
    isOpen: boolean;
    personalizedOrdinals: readonly number[];
    onConfirm: () => void;
    onCancel: () => void;
}

export const SyncRecurringStructureConfirmModal: React.FC<Props> = ({
    isOpen,
    personalizedOrdinals,
    onConfirm,
    onCancel,
}) => (
    <NexiaPremiumConfirmModal
        isOpen={isOpen}
        onClose={onCancel}
        onConfirm={onConfirm}
        title="¿Guardamos los cambios?"
        description={buildSyncRecurringConfirmMessage(personalizedOrdinals)}
        confirmLabel="Guardar"
        confirmVariant="primary"
    />
);

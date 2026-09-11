/**
 * SyncRecurringStructureConfirmModal.tsx — Confirmación al guardar edit con excepciones.
 *
 * Contexto: §6.1 D-ST — aviso breve cuando un cambio de semana tipo afecta al resto
 * pero conserva semanas que el entrenador editó a mano.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import React from "react";

import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";

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
    <BaseModal
        isOpen={isOpen}
        onClose={onCancel}
        title="¿Guardamos los cambios?"
        description={buildSyncRecurringConfirmMessage(personalizedOrdinals)}
        iconType="warning"
        titleId="sync-recurring-confirm-title"
        descriptionId="sync-recurring-confirm-description"
    >
        <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button
                variant="outline"
                onClick={onCancel}
                size="md"
                className={BUTTON_PRESETS.modalEqual}
            >
                Cancelar
            </Button>
            <Button
                variant="primary"
                onClick={onConfirm}
                size="md"
                className={BUTTON_PRESETS.modalEqual}
            >
                Guardar
            </Button>
        </div>
    </BaseModal>
);

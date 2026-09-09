/**
 * DiscardUnsavedChangesModal — Confirmación premium al salir con cambios sin guardar.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";

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
    <BaseModal
        isOpen={isOpen}
        onClose={onCancel}
        title={title}
        description={description}
        iconType="warning"
        titleId="discard-unsaved-title"
        descriptionId="discard-unsaved-description"
    >
        <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button
                variant="outline"
                onClick={onCancel}
                size="md"
                className={BUTTON_PRESETS.modalEqual}
            >
                {cancelLabel}
            </Button>
            <Button
                variant="danger"
                onClick={onConfirm}
                size="md"
                className={BUTTON_PRESETS.modalEqual}
            >
                {confirmLabel}
            </Button>
        </div>
    </BaseModal>
);

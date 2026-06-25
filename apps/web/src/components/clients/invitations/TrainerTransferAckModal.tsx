/**
 * TrainerTransferAckModal — confirmación antes de invitar si hay otro entrenador activo.
 */

import React from "react";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import type { InvitationWarning } from "@nexia/shared/types/invitation";

interface TrainerTransferAckModalProps {
    isOpen: boolean;
    warnings: InvitationWarning[];
    isSubmitting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const TrainerTransferAckModal: React.FC<TrainerTransferAckModalProps> = ({
    isOpen,
    warnings,
    isSubmitting = false,
    onConfirm,
    onCancel,
}) => {
    const primaryMessage =
        warnings[0]?.message ??
        "Este atleta está vinculado a otro entrenador. Si acepta, se desvinculará.";

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onCancel}
            title="Cambio de entrenador"
            description={primaryMessage}
            iconType="warning"
            titleId="trainer-transfer-ack-title"
            descriptionId="trainer-transfer-ack-description"
        >
            {warnings[0]?.current_trainer_name ? (
                <p className="mb-6 text-sm text-muted-foreground">
                    Entrenador actual:{" "}
                    <span className="font-medium text-foreground">
                        {warnings[0].current_trainer_name}
                    </span>
                </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                    variant="primary"
                    size="md"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1"
                >
                    {isSubmitting ? "Enviando…" : "Entiendo, enviar invitación"}
                </Button>
                <Button
                    variant="outline"
                    size="md"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1"
                >
                    Cancelar
                </Button>
            </div>
        </BaseModal>
    );
};

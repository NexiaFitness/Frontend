/**
 * DeleteAccountModal.tsx — Modal de confirmación para eliminar la cuenta del usuario.
 *
 * Contexto:
 * - Usa BaseModal responsive (mobile + desktop).
 * - Botones con ancho fijo estandarizado (BUTTON_PRESETS.modalEqual).
 * - Spinner gestionado por Button base.
 *
 * Notas de mantenimiento:
 * - Accesibilidad: usa titleId y descriptionId en BaseModal.
 * - Acción irreversible → mensaje destacado con tipografía unificada.
 *
 * @author Nelson
 * @since v4.2.0
 * @updated v4.3.7 - Botones corregidos a BUTTON_PRESETS.modalEqual (consistencia global)
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { useDeleteAccountMutation } from "@nexia/shared";

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

    const description = userName
        ? `¿Estás seguro de que quieres eliminar tu cuenta (${userName}${
              userEmail ? ` · ${userEmail}` : ""
          })?`
        : "¿Estás seguro de que quieres eliminar tu cuenta?";

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Eliminar cuenta"
            description={description}
            iconType="danger"
            isLoading={isLoading}
            titleId="delete-account-title"
            descriptionId="delete-account-description"
        >
            {/* Warning message */}
            <div className="text-center mb-6 sm:mb-8">
                <p className="text-sm font-medium text-destructive">
                    Esta acción es irreversible.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    size="md"
                    className="min-w-[140px] sm:min-w-[160px]"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className="min-w-[140px] sm:min-w-[160px]"
                >
                    Eliminar cuenta
                </Button>
            </div>
        </BaseModal>
    );
};

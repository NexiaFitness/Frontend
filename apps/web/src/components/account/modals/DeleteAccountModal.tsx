/**
 * DeleteAccountModal.tsx — Modal de confirmación para eliminar la cuenta del usuario.
 *
 * Contexto:
 * - Usa BaseModal responsive (mobile + desktop).
 * - Botones con ancho igual en desktop (md:flex-1).
 * - Spinner gestionado por Button base.
 *
 * Notas de mantenimiento:
 * - Accesibilidad: usa titleId y descriptionId en BaseModal.
 * - Acción irreversible → mensaje destacado con tipografía unificada.
 *
 * @author Nelson
 * @since v4.2.0
 * @updated v4.3.5 - Botones responsive con mismo ancho en desktop
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { TYPOGRAPHY } from "@/utils/typography";
import { useDeleteAccountMutation } from "@shared/api/accountApi";

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
        ? `¿Estás seguro de que quieres eliminar tu cuenta (${userName}${userEmail ? ` · ${userEmail}` : ""
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
                <p className={`${TYPOGRAPHY.errorText} text-red-600 font-medium`}>
                    Esta acción es irreversible.
                </p>
            </div>

            {/* Action buttons - Mobile: stacked, Desktop: side by side with equal width */}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    size="md"
                    className="w-full md:flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className="w-full md:flex-1"
                >
                    Eliminar cuenta
                </Button>
            </div>
        </BaseModal>
    );
};

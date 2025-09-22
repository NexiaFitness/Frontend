/**
 * Modal de confirmación para eliminar la cuenta del usuario autenticado.
 * Confirma una acción irreversible y orquesta la llamada a deleteAccount (RTK Query).
 * 
 * RESPONSIVE: Usa BaseModal para comportamiento móvil optimizado
 *
 * @author Nelson
 * @since v4.2.0 - Refactored with BaseModal responsive
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
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
        ? `¿Estás seguro de que quieres eliminar tu cuenta (${userName}${userEmail ? ` · ${userEmail}` : ""})?`
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
                <p className="text-sm text-red-600 font-medium">
                    Esta acción es irreversible.
                </p>
            </div>

            {/* Action buttons - Mobile: stacked, Desktop: side by side */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-full sm:min-w-[160px] sm:w-auto order-2 sm:order-1"
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="px-6 py-2.5 w-full sm:min-w-[160px] sm:w-auto order-1 sm:order-2"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Eliminando...
                        </div>
                    ) : (
                        "Eliminar cuenta"
                    )}
                </Button>
            </div>
        </BaseModal>
    );
};
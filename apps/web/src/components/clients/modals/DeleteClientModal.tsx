/**
 * DeleteClientModal.tsx — Modal de confirmación para eliminar cliente.
 *
 * Cambios v4.3.8:
 * - Botones actualizados a BUTTON_PRESETS.modalEqual (consistencia con otros modales).
 * - Se mantiene warning con TYPOGRAPHY.errorText.
 *
 * Contexto:
 * - Usa BaseModal responsive y accesible.
 * - Consistencia global en tipografía (heredada de BaseModal) y botones.
 *
 * @author Nelson
 * @since v2.1.0
 * @updated v4.3.8 - Botones alineados con sistema centralizado
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useDeleteClientMutation } from "@nexia/shared/api/clientsApi";
import type { Client } from "@nexia/shared/types/client";

interface DeleteClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onDeleteSuccess?: () => void;
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
    isOpen,
    onClose,
    client,
    onDeleteSuccess,
}) => {
    const [deleteClient, { isLoading }] = useDeleteClientMutation();

    const handleDelete = async () => {
        if (!client) return;
        try {
            await deleteClient(client.id).unwrap();
            onDeleteSuccess?.();
            onClose();
        } catch (error) {
            console.error(
                "[DeleteClientModal] Error eliminando cliente:",
                error
            );
        }
    };

    if (!client) return null;

    const description = `¿Estás seguro de que deseas eliminar a ${client.nombre} ${client.apellidos}?`;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Eliminar Cliente"
            description={description}
            iconType="danger"
            isLoading={isLoading}
            titleId="delete-client-title"
            descriptionId="delete-client-description"
        >
            {/* Warning text */}
            <div className="text-center mb-6 sm:mb-8">
                <p className={`${TYPOGRAPHY.errorText} text-red-600 font-medium`}>
                    Esta acción no se puede deshacer.
                </p>
            </div>

            {/* Client details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{client.email}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Objetivo:</span>
                    <span className="font-medium capitalize">
                        {client.objetivo?.replace("_", " ") || "No especificado"}
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    size="md"
                    className={BUTTON_PRESETS.modalEqual}
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className={BUTTON_PRESETS.modalEqual}
                >
                    Eliminar cliente
                </Button>
            </div>
        </BaseModal>
    );
};

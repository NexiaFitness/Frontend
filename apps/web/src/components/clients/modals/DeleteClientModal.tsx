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
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/buttons";
import { BaseModal } from "@/components/ui/modals";
import { TYPOGRAPHY } from "@/utils/typography";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useUnlinkClientMutation } from "@nexia/shared/api/trainerApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { Client } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

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
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });
    const [unlinkClient, { isLoading }] = useUnlinkClientMutation();

    const handleUnlink = async () => {
        if (!client || !trainerProfile) return;
        try {
            await unlinkClient({ trainerId: trainerProfile.id, clientId: client.id }).unwrap();
            onDeleteSuccess?.();
            onClose();
        } catch (error) {
            console.error(
                "[DeleteClientModal] Error desvinculando cliente:",
                error
            );
        }
    };

    if (!client) return null;

    const description = `¿Estás seguro de que deseas desvincular a ${client.nombre} ${client.apellidos}?`;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Desvincular Cliente"
            description={description}
            iconType="danger"
            isLoading={isLoading}
            titleId="unlink-client-title"
            descriptionId="unlink-client-description"
        >
            {/* Warning text */}
            <div className="text-center mb-6 sm:mb-8">
                <p className={`${TYPOGRAPHY.errorText} text-red-600 font-medium`}>
                    Esta acción es irreversible.
                </p>
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
                    onClick={handleUnlink}
                    isLoading={isLoading}
                    disabled={isLoading}
                    size="md"
                    className={BUTTON_PRESETS.modalEqual}
                >
                    Desvincular cliente
                </Button>
            </div>
        </BaseModal>
    );
};

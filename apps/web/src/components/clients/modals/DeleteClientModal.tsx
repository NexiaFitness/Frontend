/**
 * DeleteClientModal.tsx — Confirmación desvincular cliente (NexiaPremiumConfirmModal).
 */

import React from "react";
import { useSelector } from "react-redux";

import { useUnlinkClientMutation, useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { Client } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";

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
            console.error("[DeleteClientModal] Error desvinculando cliente:", error);
        }
    };

    if (!client) return null;

    const clientName = `${client.nombre} ${client.apellidos}`;

    return (
        <NexiaPremiumConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleUnlink}
            isLoading={isLoading}
            loadingConfirmLabel="Desvinculando…"
            title="Desvincular cliente"
            description={
                <>
                    ¿Estás seguro de que deseas desvincular a{" "}
                    <span className={NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS}>
                        {clientName}
                    </span>
                    ?
                </>
            }
            bodyContent={
                <p className={NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS}>
                    Esta acción es irreversible.
                </p>
            }
            confirmLabel="Desvincular cliente"
        />
    );
};

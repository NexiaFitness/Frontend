/**
 * useAdminAthleteSuperviseLink.ts — Navegación «Ver como supervisor» (SUP F3).
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyGetClientTrainersQuery } from "@nexia/shared/api/clientsApi";
import { useLazyGetTrainerQuery } from "@nexia/shared/api/trainerApi";

export function useAdminAthleteSuperviseLink(clientProfileId: number | null | undefined) {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const [fetchTrainers] = useLazyGetClientTrainersQuery();
    const [fetchTrainer] = useLazyGetTrainerQuery();

    const openSupervise = useCallback(async () => {
        if (clientProfileId == null || clientProfileId <= 0) return;
        setErrorMessage(null);
        setIsResolving(true);
        try {
            const result = await fetchTrainers({
                clientId: clientProfileId,
                limit: 50,
            }).unwrap();
            const items = result.items ?? [];
            if (items.length === 0) {
                setErrorMessage("No hay entrenadores vinculados a este atleta.");
                return;
            }
            if (items.length === 1) {
                const trainer = await fetchTrainer(items[0].id).unwrap();
                if (trainer.user_id == null) {
                    setErrorMessage(
                        "El entrenador vinculado no tiene cuenta de usuario asociada."
                    );
                    return;
                }
                navigate(
                    `/dashboard/admin/users/${trainer.user_id}/clients/${clientProfileId}`
                );
                return;
            }
            setModalOpen(true);
        } catch {
            setErrorMessage("No se pudo cargar la lista de entrenadores.");
        } finally {
            setIsResolving(false);
        }
    }, [clientProfileId, fetchTrainers, fetchTrainer, navigate]);

    return {
        modalOpen,
        setModalOpen,
        openSupervise,
        isResolving,
        errorMessage,
        clearError: () => setErrorMessage(null),
    };
}

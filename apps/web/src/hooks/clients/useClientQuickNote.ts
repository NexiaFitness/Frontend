/**
 * useClientQuickNote — Añadir nota rápida al perfil (PUT parcial) sin salir del detalle.
 *
 * Prioridad: notes_1 → notes_2 → notes_3; si están llenas, concatena en observaciones.
 */

import { useCallback } from "react";
import { useUpdateClientMutation } from "@nexia/shared/api/clientsApi";
import type { Client, UpdateClientData } from "@nexia/shared/types/client";
import { getMutationErrorMessage } from "@nexia/shared";
import { useToast } from "@/components/ui/feedback";

export function useClientQuickNote(client: Client | undefined, clientId: number) {
    const [updateClient, { isLoading }] = useUpdateClientMutation();
    const { showSuccess, showError } = useToast();

    const saveQuickNote = useCallback(
        async (text: string): Promise<boolean> => {
            const t = text.trim();
            if (!t || !client) return false;

            const payload: UpdateClientData = {};
            const n1 = (client.notes_1 ?? "").trim();
            const n2 = (client.notes_2 ?? "").trim();
            const n3 = (client.notes_3 ?? "").trim();

            if (!n1) {
                payload.notes_1 = t;
            } else if (!n2) {
                payload.notes_2 = t;
            } else if (!n3) {
                payload.notes_3 = t;
            } else {
                const obs = (client.observaciones ?? "").trim();
                payload.observaciones = obs ? `${obs}\n\n${t}` : t;
            }

            try {
                await updateClient({ id: clientId, data: payload }).unwrap();
                showSuccess("Nota guardada");
                return true;
            } catch (e) {
                showError(getMutationErrorMessage(e));
                return false;
            }
        },
        [client, clientId, updateClient, showSuccess, showError]
    );

    return { saveQuickNote, isSavingQuickNote: isLoading };
}

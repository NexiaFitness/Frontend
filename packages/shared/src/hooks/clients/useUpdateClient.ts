/**
 * useUpdateClient — Hook para actualizar datos de un cliente
 *
 * @deprecated Usar useClientForm en su lugar.
 * Este hook se mantiene solo por compatibilidad temporal.
 *
 * Contexto:
 * - Permite editar datos personales y administrativos del cliente
 * - No afecta métricas ni progreso (solo perfil base)
 *
 * Usa RTK Query mutation: updateClient
 * 
 * @author Frontend
 * @since v4.5.0
 * @updated v4.6.0 - Deprecado, usar useClientForm
 */

import { useUpdateClientMutation } from "../../api/clientsApi";
import type { UpdateClientData } from "../../types/client";

export const useUpdateClient = () => {
    const [updateClient, { isLoading, isSuccess, isError, error }] =
        useUpdateClientMutation();

    const updateClientData = async (id: number, data: UpdateClientData) => {
        try {
            await updateClient({ id, data }).unwrap();
            return true;
        } catch (err) {
            console.error("Error actualizando cliente:", err);
            return false;
        }
    };

    return {
        updateClientData,
        isLoading,
        isSuccess,
        isError,
        error,
    };
};

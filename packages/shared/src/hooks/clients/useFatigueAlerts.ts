/**
 * useFatigueAlerts.ts — Hook para gestión de alertas de fatiga del cliente
 *
 * Contexto:
 * - Gestiona alertas de fatiga de un cliente específico
 * - Proporciona acciones para crear, marcar como leída y resolver alertas
 * - Obtiene trainer_id automáticamente del perfil del trainer actual
 *
 * Uso:
 * ```tsx
 * const { alerts, createAlert, markAsRead, resolveAlert, isLoading } = useFatigueAlerts(clientId);
 * ```
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
    useGetClientFatigueAlertsQuery,
    useCreateFatigueAlertMutation,
    useMarkFatigueAlertAsReadMutation,
    useResolveFatigueAlertMutation,
} from "../../api/fatigueApi";
import { useGetCurrentTrainerProfileQuery } from "../../api/trainerApi";
import type { RootState } from "../../store";
import type { FatigueAlert, FatigueAlertCreate } from "../../types/training";

interface UseFatigueAlertsResult {
    // Data
    alerts: FatigueAlert[];
    unreadCount: number;
    activeCount: number;

    // Trainer info
    trainerId: number | null;
    isLoadingTrainer: boolean;

    // Actions
    createAlert: (alertData: Omit<FatigueAlertCreate, "client_id" | "trainer_id">) => Promise<FatigueAlert>;
    markAsRead: (alertId: number) => Promise<void>;
    resolveAlert: (alertId: number, resolutionNotes?: string) => Promise<void>;

    // States
    isLoading: boolean;
    isCreating: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Hook para gestión de alertas de fatiga del cliente
 */
export const useFatigueAlerts = (clientId: number): UseFatigueAlertsResult => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    // Obtener perfil del trainer actual para obtener trainer_id
    const {
        data: trainerProfile,
        isLoading: isLoadingTrainer,
    } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const trainerId = trainerProfile?.id ?? null;

    // Query: Obtener alertas del trainer (backend retorna todas, filtramos por client_id)
    const {
        data: allAlerts = [],
        isLoading: isLoadingAlerts,
        isError,
        error,
        refetch,
    } = useGetClientFatigueAlertsQuery(clientId, {
        skip: !clientId || !isAuthenticated,
    });

    // Filtrar alertas por client_id
    const alerts = allAlerts.filter((alert) => alert.client_id === clientId);

    // Mutations
    const [createAlertMutation, { isLoading: isCreating }] = useCreateFatigueAlertMutation();
    const [markAsReadMutation] = useMarkFatigueAlertAsReadMutation();
    const [resolveAlertMutation] = useResolveFatigueAlertMutation();

    // Calcular métricas
    const unreadCount = alerts.filter((alert) => !alert.is_read).length;
    const activeCount = alerts.filter((alert) => !alert.is_resolved && alert.is_active).length;

    // Actions
    const createAlert = useCallback(
        async (alertData: Omit<FatigueAlertCreate, "client_id" | "trainer_id">): Promise<FatigueAlert> => {
            if (!trainerId) {
                throw new Error("Trainer ID no disponible. Por favor, inicia sesión como trainer.");
            }

            const fullAlertData: FatigueAlertCreate = {
                ...alertData,
                client_id: clientId,
                trainer_id: trainerId,
            };

            return await createAlertMutation(fullAlertData).unwrap();
        },
        [clientId, trainerId, createAlertMutation]
    );

    const markAsRead = useCallback(
        async (alertId: number): Promise<void> => {
            await markAsReadMutation(alertId).unwrap();
        },
        [markAsReadMutation]
    );

    const resolveAlert = useCallback(
        async (alertId: number, resolutionNotes?: string): Promise<void> => {
            await resolveAlertMutation({ alertId, resolutionNotes }).unwrap();
        },
        [resolveAlertMutation]
    );

    return {
        alerts,
        unreadCount,
        activeCount,
        trainerId,
        isLoadingTrainer,
        createAlert,
        markAsRead,
        resolveAlert,
        isLoading: isLoadingAlerts || isLoadingTrainer,
        isCreating,
        isError,
        error,
        refetch,
    };
};


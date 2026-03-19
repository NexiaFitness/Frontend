/**
 * useUpcomingScheduledSession.ts — Hook para obtener próxima sesión agendada
 *
 * Contexto:
 * - Obtiene la próxima sesión agendada no cancelada
 * - Filtra sesiones futuras (fecha >= hoy)
 * - Ordena por fecha/hora ascendente
 * - Útil para mostrar próxima cita destacada
 *
 * Uso:
 * ```tsx
 * const { upcomingSession, isLoading, error } = useUpcomingScheduledSession({
 *   trainer_id: 1
 * });
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { useMemo } from "react";
import { useGetScheduledSessionsQuery } from "../../api/schedulingApi";
import type { ScheduledSession } from "../../types/scheduling";
import { SESSION_STATUS } from "../../types/scheduling";

interface UseUpcomingScheduledSessionParams {
    trainer_id?: number | null;
    client_id?: number | null;
}

interface UseUpcomingScheduledSessionResult {
    upcomingSession: ScheduledSession | null;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

export const useUpcomingScheduledSession = (
    params?: UseUpcomingScheduledSessionParams
): UseUpcomingScheduledSessionResult => {
    // Calcular fecha de hoy en formato ISO (YYYY-MM-DD)
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split("T")[0];
    }, []);

    const {
        data: sessions = [],
        isLoading,
        isError,
        error,
    } = useGetScheduledSessionsQuery(
        {
            trainer_id: params?.trainer_id ?? null,
            client_id: params?.client_id ?? null,
            start_date: today,
            skip: 0,
            limit: 100,
        },
        {
            skip: !params?.trainer_id && !params?.client_id,
        }
    );

    // Filtrar y ordenar sesiones futuras no canceladas
    const upcomingSession = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const futureSessions = sessions
            .filter((session) => {
                // Filtrar sesiones canceladas
                if (session.status === SESSION_STATUS.CANCELLED) {
                    return false;
                }

                // Filtrar sesiones futuras o de hoy
                const sessionDate = new Date(session.scheduled_date);
                sessionDate.setHours(0, 0, 0, 0);

                // Si es hoy, verificar hora
                if (sessionDate.getTime() === now.getTime()) {
                    const [hours, minutes] = session.start_time.split(":").map(Number);
                    const sessionDateTime = new Date();
                    sessionDateTime.setHours(hours, minutes, 0, 0);
                    return sessionDateTime >= new Date();
                }

                return sessionDate >= now;
            })
            .sort((a, b) => {
                // Ordenar por fecha y hora ascendente
                const dateA = new Date(`${a.scheduled_date}T${a.start_time}`);
                const dateB = new Date(`${b.scheduled_date}T${b.start_time}`);
                return dateA.getTime() - dateB.getTime();
            });

        return futureSessions[0] || null;
    }, [sessions]);

    return {
        upcomingSession,
        isLoading,
        isError,
        error,
    };
};


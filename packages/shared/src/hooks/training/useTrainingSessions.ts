/**
 * useTrainingSessions Hook
 * Business logic para gestión de Training Sessions
 * 
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import { useMemo } from 'react';
import {
    useGetTrainingSessionsQuery,
    useCreateTrainingSessionMutation,
    useUpdateTrainingSessionMutation,
    useDeleteTrainingSessionMutation,
} from '../../api/trainingSessionsApi';
import type { TrainingSession } from '../../types/trainingSessions';

interface UseTrainingSessionsReturn {
    sessions: TrainingSession[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;

    // Sesiones ordenadas por fecha
    sessionsByDate: TrainingSession[];

    // Estadísticas
    totalSessions: number;
    upcomingSessions: TrainingSession[];
    completedSessions: TrainingSession[];
    plannedSessions: TrainingSession[];

    // Mutations
    createSession: ReturnType<typeof useCreateTrainingSessionMutation>[0];
    updateSession: ReturnType<typeof useUpdateTrainingSessionMutation>[0];
    deleteSession: ReturnType<typeof useDeleteTrainingSessionMutation>[0];

    // Loading states
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

/**
 * Hook para gestionar sessions de un Training Plan
 * 
 * @param trainingPlanId - ID del Training Plan
 * @returns Estado y funciones para gestionar sesiones
 * 
 * @example
 * ```tsx
 * const {
 *   sessions,
 *   sessionsByDate,
 *   upcomingSessions,
 *   createSession,
 *   isCreating,
 * } = useTrainingSessions(planId);
 * 
 * // Crear sesión
 * await createSession({
 *   training_plan_id: planId,
 *   client_id: clientId,
 *   trainer_id: trainerId,
 *   session_date: "2026-01-23",
 *   session_name: "Upper Body Strength",
 *   session_type: "strength",
 * });
 * ```
 */
export const useTrainingSessions = (trainingPlanId: number): UseTrainingSessionsReturn => {
    // Queries
    const {
        data: sessions = [],
        isLoading,
        isError,
        error,
    } = useGetTrainingSessionsQuery(trainingPlanId);

    // Mutations
    const [createSession, { isLoading: isCreating }] = useCreateTrainingSessionMutation();
    const [updateSession, { isLoading: isUpdating }] = useUpdateTrainingSessionMutation();
    const [deleteSession, { isLoading: isDeleting }] = useDeleteTrainingSessionMutation();

    // Sesiones ordenadas por fecha (más reciente primero)
    const sessionsByDate = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const dateA = a.session_date ? new Date(a.session_date).getTime() : 0;
            const dateB = b.session_date ? new Date(b.session_date).getTime() : 0;
            return dateB - dateA;
        });
    }, [sessions]);

    // Sesiones próximas (fecha >= hoy)
    const upcomingSessions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return sessions
            .filter((session) => {
                if (!session.session_date) return false;
                const sessionDate = new Date(session.session_date);
                sessionDate.setHours(0, 0, 0, 0);
                return sessionDate >= today;
            })
            .sort((a, b) => {
                const dateA = a.session_date ? new Date(a.session_date).getTime() : 0;
                const dateB = b.session_date ? new Date(b.session_date).getTime() : 0;
                return dateA - dateB;
            });
    }, [sessions]);

    // Sesiones completadas (fecha < hoy o status = 'completed')
    const completedSessions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return sessions.filter((session) => {
            if (session.status === 'completed') return true;
            if (!session.session_date) return false;
            const sessionDate = new Date(session.session_date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate < today;
        });
    }, [sessions]);

    // Sesiones planificadas (status = 'planned')
    const plannedSessions = useMemo(() => {
        return sessions.filter((session) => session.status === 'planned');
    }, [sessions]);

    return {
        sessions,
        isLoading,
        isError,
        error,
        sessionsByDate,
        totalSessions: sessions.length,
        upcomingSessions,
        completedSessions,
        plannedSessions,
        createSession,
        updateSession,
        deleteSession,
        isCreating,
        isUpdating,
        isDeleting,
    };
};


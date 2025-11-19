/**
 * useScheduleSession.ts — Hook para agendamiento de sesiones
 *
 * Contexto:
 * - Encapsula la lógica de creación de sesiones agendadas
 * - Maneja verificación de conflictos
 * - Obtiene slots disponibles
 *
 * Uso:
 * ```tsx
 * const { createSession, checkConflict, getAvailableSlots, isLoading } = useScheduleSession();
 * ```
 *
 * @author Frontend Team
 * @since v5.1.0
 */

import { useCallback } from "react";
import {
    useCreateScheduledSessionMutation,
    useCheckSchedulingConflictMutation,
    useGetAvailableSlotsMutation,
} from "../../api/schedulingApi";
import type {
    ScheduleSessionFormData,
    ScheduledSession,
    ConflictCheckResponse,
    AvailableSlotsResponse,
} from "../../types/scheduling";

interface UseScheduleSessionResult {
    createSession: (formData: ScheduleSessionFormData) => Promise<ScheduledSession>;
    checkConflict: (
        trainerId: number,
        date: string,
        startTime: string,
        endTime: string,
        excludeSessionId?: number | null
    ) => Promise<ConflictCheckResponse>;
    getAvailableSlots: (trainerId: number, date: string) => Promise<AvailableSlotsResponse>;
    isLoading: boolean;
    isCreating: boolean;
    isError: boolean;
    error: unknown;
}

export const useScheduleSession = (): UseScheduleSessionResult => {
    const [createSessionMutation, { isLoading: isCreating, isError: isCreateError, error: createError }] =
        useCreateScheduledSessionMutation();
    const [checkConflictMutation, { isLoading: isCheckingConflict }] = useCheckSchedulingConflictMutation();
    const [getAvailableSlotsMutation, { isLoading: isGettingSlots }] = useGetAvailableSlotsMutation();

    const createSession = useCallback(
        async (formData: ScheduleSessionFormData): Promise<ScheduledSession> => {
            const sessionData = {
                trainer_id: formData.trainerId,
                client_id: formData.clientId,
                scheduled_date: formData.scheduledDate,
                start_time: formData.startTime,
                end_time: formData.endTime,
                duration_minutes: formData.durationMinutes,
                session_type: formData.sessionType,
                notes: formData.notes ?? null,
                location: formData.location ?? null,
                meeting_link: formData.meetingLink ?? null,
            };

            const result = await createSessionMutation(sessionData).unwrap();
            return result;
        },
        [createSessionMutation]
    );

    const checkConflict = useCallback(
        async (
            trainerId: number,
            date: string,
            startTime: string,
            endTime: string,
            excludeSessionId?: number | null
        ): Promise<ConflictCheckResponse> => {
            const result = await checkConflictMutation({
                trainer_id: trainerId,
                scheduled_date: date,
                start_time: startTime,
                end_time: endTime,
                exclude_session_id: excludeSessionId ?? null,
            }).unwrap();
            return result;
        },
        [checkConflictMutation]
    );

    const getAvailableSlots = useCallback(
        async (trainerId: number, date: string): Promise<AvailableSlotsResponse> => {
            const result = await getAvailableSlotsMutation({
                trainer_id: trainerId,
                date,
            }).unwrap();
            return result;
        },
        [getAvailableSlotsMutation]
    );

    const isLoading = isCreating || isCheckingConflict || isGettingSlots;
    const isError = isCreateError;
    const error = createError;

    return {
        createSession,
        checkConflict,
        getAvailableSlots,
        isLoading,
        isCreating,
        isError,
        error,
    };
};



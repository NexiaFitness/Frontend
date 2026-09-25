/**
 * useAdminSupervisedClient.ts — Datos RO del cliente supervisado (SUP F2).
 */

import { useMemo, useState } from "react";
import { useGetAdminUserQuery } from "@nexia/shared/api/adminUsersApi";
import {
    useGetClientQuery,
    useGetClientTestResultsQuery,
} from "@nexia/shared/api/clientsApi";
import { useGetClientInjuriesQuery } from "@nexia/shared/api/injuriesApi";
import {
    useGetActivePlanByClientQuery,
    useGetTrainingPlansQuery,
} from "@nexia/shared/api/trainingPlansApi";
import {
    useGetTrainingSessionQuery,
    useGetTrainingSessionsByClientQuery,
    useGetSessionExercisesQuery,
    useGetSessionFeedbackQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

function isForbidden(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const status = (error as FetchBaseQueryError).status;
    return status === 403 || status === 404;
}

export interface UseAdminSupervisedClientArgs {
    userId: number;
    clientId: number;
}

export function useAdminSupervisedClient({ userId, clientId }: UseAdminSupervisedClientArgs) {
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    const {
        data: trainerUser,
        isLoading: trainerLoading,
        isError: trainerError,
        refetch: refetchTrainer,
    } = useGetAdminUserQuery(userId, {
        skip: !Number.isFinite(userId) || userId <= 0,
    });

    const trainerId = trainerUser?.trainer_id ?? null;
    const scopeReady = trainerId != null && trainerId > 0 && clientId > 0;

    const {
        data: client,
        isLoading: clientLoading,
        isError: clientError,
        error: clientQueryError,
        refetch: refetchClient,
    } = useGetClientQuery(
        { clientId, trainerId: trainerId ?? undefined },
        { skip: !scopeReady }
    );

    const scopeDenied = clientError && isForbidden(clientQueryError);

    const {
        data: activePlan,
        isLoading: activePlanLoading,
        isError: activePlanError,
        refetch: refetchActivePlan,
    } = useGetActivePlanByClientQuery(
        { clientId, trainerId: trainerId ?? undefined },
        { skip: !scopeReady || scopeDenied }
    );

    const {
        data: plans,
        isLoading: plansLoading,
        isError: plansError,
        refetch: refetchPlans,
    } = useGetTrainingPlansQuery(
        { client_id: clientId, trainer_id: trainerId ?? undefined, limit: 50 },
        { skip: !scopeReady || scopeDenied || trainerId == null }
    );

    const {
        data: sessions,
        isLoading: sessionsLoading,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetTrainingSessionsByClientQuery(
        {
            clientId,
            trainerId: trainerId ?? undefined,
            limit: 100,
        },
        { skip: !scopeReady || scopeDenied }
    );

    const {
        data: testResults,
        isLoading: testsLoading,
        isError: testsError,
        refetch: refetchTests,
    } = useGetClientTestResultsQuery(
        { clientId },
        { skip: !scopeReady || scopeDenied }
    );

    const {
        data: injuriesRaw,
        isLoading: injuriesLoading,
        isError: injuriesError,
        refetch: refetchInjuries,
    } = useGetClientInjuriesQuery(
        { clientId, activeOnly: true },
        { skip: !scopeReady || scopeDenied }
    );

    const {
        data: sessionDetail,
        isLoading: sessionDetailLoading,
        isError: sessionDetailError,
    } = useGetTrainingSessionQuery(selectedSessionId ?? 0, {
        skip: selectedSessionId == null || selectedSessionId <= 0,
    });

    const {
        data: sessionExercises,
        isLoading: sessionExercisesLoading,
    } = useGetSessionExercisesQuery(selectedSessionId ?? 0, {
        skip: selectedSessionId == null || selectedSessionId <= 0,
    });

    const {
        data: sessionFeedback,
        isLoading: sessionFeedbackLoading,
        isError: sessionFeedbackError,
        error: sessionFeedbackQueryError,
    } = useGetSessionFeedbackQuery(selectedSessionId ?? 0, {
        skip: selectedSessionId == null || selectedSessionId <= 0,
    });

    const sessionFeedbackMissing =
        sessionFeedbackError &&
        typeof sessionFeedbackQueryError === "object" &&
        sessionFeedbackQueryError != null &&
        "status" in sessionFeedbackQueryError &&
        (sessionFeedbackQueryError as FetchBaseQueryError).status === 404;

    const sortedSessions = useMemo(() => {
        if (!sessions) return [];
        return [...sessions].sort((a, b) => {
            const da = a.session_date ?? "";
            const db = b.session_date ?? "";
            return db.localeCompare(da);
        });
    }, [sessions]);

    const activeInjuries = useMemo(() => {
        if (!injuriesRaw) return [];
        return Array.isArray(injuriesRaw) ? injuriesRaw.filter((i) => i.is_active) : [];
    }, [injuriesRaw]);

    const trainerDisplayName = useMemo(() => {
        if (!trainerUser) return "—";
        return trainerUser.full_name ?? trainerUser.email ?? `Usuario #${trainerUser.id}`;
    }, [trainerUser]);

    const clientDisplayName = useMemo(() => {
        if (!client) return "—";
        return `${client.nombre} ${client.apellidos}`.trim() || client.mail;
    }, [client]);

    const isLoading =
        trainerLoading ||
        (scopeReady && !scopeDenied && (clientLoading || activePlanLoading || plansLoading));

    const refetchAll = () => {
        void refetchTrainer();
        if (scopeReady) {
            void refetchClient();
            void refetchActivePlan();
            void refetchPlans();
            void refetchSessions();
            void refetchTests();
            void refetchInjuries();
        }
    };

    return {
        trainerUser,
        trainerId,
        trainerDisplayName,
        client,
        clientDisplayName,
        scopeDenied,
        scopeReady,
        activePlan,
        plans: plans ?? [],
        sessions: sortedSessions,
        selectedSessionId,
        setSelectedSessionId,
        sessionDetail,
        sessionExercises: sessionExercises ?? [],
        sessionFeedback: sessionFeedbackMissing
            ? null
            : sessionFeedbackError
              ? undefined
              : (sessionFeedback ?? null),
        sessionFeedbackLoading,
        sessionFeedbackMissing,
        sessionFeedbackError: sessionFeedbackError && !sessionFeedbackMissing,
        sessionDetailLoading:
            sessionDetailLoading || sessionExercisesLoading || sessionFeedbackLoading,
        sessionDetailError,
        testResults: testResults ?? [],
        injuries: activeInjuries,
        isLoading,
        trainerError,
        clientError: clientError && !scopeDenied,
        sessionsLoading,
        sessionsError,
        testsLoading,
        testsError,
        injuriesLoading,
        injuriesError,
        plansError,
        activePlanError,
        refetchAll,
        refetchSessions,
        refetchTests,
        refetchInjuries,
    };
}

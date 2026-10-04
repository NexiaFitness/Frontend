/**
 * athleteApi.ts — Endpoints portal atleta (F3b-BE-03).
 */

import { baseApi } from "./baseApi";
import type {
    AthleteWeeklySummary,
    AthleteWeeklySummaryQuery,
} from "../types/athleteWeeklySummary";
import type {
    AiWeeklySummary,
    AiWeeklySummaryRequest,
} from "../types/athleteAiWeeklySummary";
import type {
    AthleteRunExecutionCreate,
    AthleteRunExecutionOut,
    AthleteRunReference,
    AthleteRunReferenceQuery,
    AthleteRunTimedResultCreate,
    AthleteRunTimedResultOut,
} from "../types/athleteRunReference";
import type {
    AthleteRunNotPerformedCreate,
    AthleteRunNotPerformedOut,
    AthleteRunProgress,
    AthleteRunSessionRegistrationMetaPage,
    GetAthleteSessionsRegistrationMetaArg,
} from "../types/athleteRunProgress";

export const athleteApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAthleteWeeklySummary: builder.query<
            AthleteWeeklySummary,
            AthleteWeeklySummaryQuery | void
        >({
            query: (arg) => {
                const params = new URLSearchParams();
                if (arg?.week_start) {
                    params.set("week_start", arg.week_start);
                }
                const qs = params.toString();
                return `/athlete/weekly-summary${qs ? `?${qs}` : ""}`;
            },
            providesTags: [{ type: "AthleteWeeklySummary" as const, id: "CURRENT" }],
        }),

        getAthleteRunReference: builder.query<AthleteRunReference, AthleteRunReferenceQuery>({
            query: (arg) => {
                const params = new URLSearchParams();
                params.set("training_session_id", String(arg.training_session_id));
                params.set("step_key", arg.step_key);
                params.set("exercise_id", String(arg.exercise_id));
                if (arg.set_index != null) params.set("set_index", String(arg.set_index));
                if (arg.round_index != null) params.set("round_index", String(arg.round_index));
                if (arg.slot_label) params.set("slot_label", arg.slot_label);
                if (arg.group_kind) params.set("group_kind", arg.group_kind);
                if (arg.group_id) params.set("group_id", arg.group_id);
                if (arg.prescribed_reps != null) {
                    params.set("prescribed_reps", String(arg.prescribed_reps));
                }
                if (arg.prescribed_reps_max != null) {
                    params.set("prescribed_reps_max", String(arg.prescribed_reps_max));
                }
                if (arg.prescribed_rpe != null) {
                    params.set("prescribed_rpe", String(arg.prescribed_rpe));
                }
                if (arg.prescribed_rir != null) {
                    params.set("prescribed_rir", String(arg.prescribed_rir));
                }
                if (arg.input_mode) params.set("input_mode", arg.input_mode);
                return `/athlete/run-context/reference?${params.toString()}`;
            },
            providesTags: (_result, _error, arg) => [
                {
                    type: "AthleteRunReference" as const,
                    id: `${arg.training_session_id}:${arg.step_key}`,
                },
            ],
        }),

        getAthleteRunProgress: builder.query<AthleteRunProgress, number>({
            query: (trainingSessionId) =>
                `/athlete/run-context/sessions/${trainingSessionId}/progress`,
            providesTags: (_result, _error, trainingSessionId) => [
                { type: "AthleteRunProgress" as const, id: trainingSessionId },
            ],
        }),

        getAthleteSessionsRegistrationMeta: builder.query<
            AthleteRunSessionRegistrationMetaPage,
            GetAthleteSessionsRegistrationMetaArg
        >({
            query: ({ dateFrom, dateTo }) =>
                `/athlete/run-context/sessions/registration-meta?date_from=${dateFrom}&date_to=${dateTo}`,
            providesTags: [{ type: "AthleteRunProgress" as const, id: "REGISTRATION_META" }],
        }),

        postAthleteRunExecution: builder.mutation<
            AthleteRunExecutionOut,
            AthleteRunExecutionCreate
        >({
            query: (body) => ({
                url: "/athlete/run-context/executions",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                {
                    type: "AthleteRunReference" as const,
                    id: `${arg.training_session_id}:${arg.step_key}`,
                },
                {
                    type: "AthleteRunProgress" as const,
                    id: arg.training_session_id,
                },
                { type: "AthleteRunProgress" as const, id: "REGISTRATION_META" },
            ],
        }),

        postAthleteRunTimedResult: builder.mutation<
            AthleteRunTimedResultOut,
            AthleteRunTimedResultCreate
        >({
            query: (body) => ({
                url: "/athlete/run-context/timed-results",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                {
                    type: "AthleteRunReference" as const,
                    id: `${arg.training_session_id}:${arg.step_key}`,
                },
                {
                    type: "AthleteRunProgress" as const,
                    id: arg.training_session_id,
                },
                { type: "AthleteRunProgress" as const, id: "REGISTRATION_META" },
            ],
        }),

        postAthleteRunNotPerformed: builder.mutation<
            AthleteRunNotPerformedOut,
            AthleteRunNotPerformedCreate
        >({
            query: (body) => ({
                url: "/athlete/run-context/not-performed",
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                {
                    type: "AthleteRunProgress" as const,
                    id: arg.training_session_id,
                },
                { type: "AthleteRunProgress" as const, id: "REGISTRATION_META" },
            ],
        }),

        postAiWeeklySummary: builder.mutation<AiWeeklySummary, AiWeeklySummaryRequest | void>({
            query: (body) => ({
                url: "/ai/weekly-summary",
                method: "POST",
                body: body ?? {},
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAthleteWeeklySummaryQuery,
    useGetAthleteRunReferenceQuery,
    useGetAthleteRunProgressQuery,
    useGetAthleteSessionsRegistrationMetaQuery,
    usePostAthleteRunExecutionMutation,
    usePostAthleteRunTimedResultMutation,
    usePostAthleteRunNotPerformedMutation,
    usePostAiWeeklySummaryMutation,
} = athleteApi;

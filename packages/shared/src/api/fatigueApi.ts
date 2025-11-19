import { baseApi } from "./baseApi";
import type { FatigueAlert, FatigueAlertCreate } from "../types/training";

export const fatigueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUnreadFatigueAlerts: builder.query<FatigueAlert[], void>({
            query: () => ({
                url: "/fatigue/fatigue-alerts/",
                method: "GET",
            }),
            providesTags: ["FatigueAlert"],
        }),

        getClientFatigueAlerts: builder.query<FatigueAlert[], number>({
            query: () => ({
                url: "/fatigue/fatigue-alerts/",
                method: "GET",
            }),
            providesTags: ["FatigueAlert"],
        }),

        createFatigueAlert: builder.mutation<FatigueAlert, FatigueAlertCreate>({
            query: (alertData) => ({
                url: "/fatigue/fatigue-alerts/",
                method: "POST",
                body: alertData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["FatigueAlert"],
        }),

        markFatigueAlertAsRead: builder.mutation<void, number>({
            query: (alertId) => ({
                url: `/fatigue/fatigue-alerts/${alertId}/read`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, alertId) => [
                { type: "FatigueAlert", id: alertId },
                "FatigueAlert",
            ],
        }),

        resolveFatigueAlert: builder.mutation<
            void,
            { alertId: number; resolutionNotes?: string }
        >({
            query: ({ alertId, resolutionNotes }) => {
                const params = new URLSearchParams();
                if (resolutionNotes) {
                    params.append("resolution_notes", resolutionNotes);
                }
                const queryString = params.toString();
                return {
                    url: `/fatigue/fatigue-alerts/${alertId}/resolve${queryString ? `?${queryString}` : ""}`,
                    method: "PUT",
                };
            },
            invalidatesTags: (result, error, { alertId }) => [
                { type: "FatigueAlert", id: alertId },
                "FatigueAlert",
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetUnreadFatigueAlertsQuery,
    useGetClientFatigueAlertsQuery,
    useCreateFatigueAlertMutation,
    useMarkFatigueAlertAsReadMutation,
    useResolveFatigueAlertMutation,
} = fatigueApi;


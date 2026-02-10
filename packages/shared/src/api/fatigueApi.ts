import { baseApi } from "./baseApi";
import type {
    FatigueAlert,
    FatigueAlertCreate,
    ClientFatigueAnalytics,
    WorkloadTrackingOut,
} from "../types/training";

export const fatigueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUnreadFatigueAlerts: builder.query<FatigueAlert[], void>({
            query: () => ({
                url: "/fatigue/fatigue-alerts/unread/",
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

        /**
         * Analytics agregados de fatiga por cliente
         * Backend: GET /fatigue/clients/{client_id}/fatigue-analytics/?days=
         */
        getClientFatigueAnalytics: builder.query<
            ClientFatigueAnalytics,
            { clientId: number; days?: number }
        >({
            query: ({ clientId, days = 30 }) => ({
                url: `/fatigue/clients/${clientId}/fatigue-analytics/?days=${days}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `FATIGUE-ANALYTICS-${clientId}` },
            ],
        }),

        /**
         * Workload tracking por cliente
         * Backend: GET /fatigue/clients/{client_id}/workload-tracking/?skip=&limit=
         */
        getClientWorkloadTracking: builder.query<
            WorkloadTrackingOut[],
            { clientId: number; skip?: number; limit?: number }
        >({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/fatigue/clients/${clientId}/workload-tracking/?skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `WORKLOAD-${clientId}` },
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
    useGetClientFatigueAnalyticsQuery,
    useGetClientWorkloadTrackingQuery,
} = fatigueApi;


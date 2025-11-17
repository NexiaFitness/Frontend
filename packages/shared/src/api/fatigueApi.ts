/**
 * Fatigue API - Gestión de alertas de fatiga
 * Integra endpoints reales de /fatigue
 * 
 * @author Frontend Team
 * @since v5.0.0 - Integración TrainerDashboard v2
 */

import { baseApi } from "./baseApi";
import type { FatigueAlert, FatigueAlertCreate } from "../types/training";

export const fatigueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query: Obtener alertas no leídas (para dashboard)
        // Nota: Usamos el endpoint general y filtramos en el frontend porque /unread/ no funciona correctamente
        getUnreadFatigueAlerts: builder.query<FatigueAlert[], void>({
            query: () => "/fatigue/fatigue-alerts/",
            providesTags: ["FatigueAlert"],
            // Transformamos la respuesta para filtrar solo las no leídas
            transformResponse: (response: FatigueAlert[]) => {
                return response.filter(alert => !alert.is_read && alert.is_active);
            },
        }),

        // Query: Obtener alertas de un cliente específico
        // Nota: El backend retorna todas las alertas del trainer, filtramos por client_id en el hook
        getClientFatigueAlerts: builder.query<FatigueAlert[], number>({
            query: () => `/fatigue/fatigue-alerts/`,
            providesTags: ["FatigueAlert"],
        }),

        // Mutation: Crear nueva alerta
        createFatigueAlert: builder.mutation<FatigueAlert, FatigueAlertCreate>({
            query: (alertData) => ({
                url: "/fatigue/fatigue-alerts/",
                method: "POST",
                body: alertData,
            }),
            invalidatesTags: ["FatigueAlert"],
        }),

        // Mutation: Marcar alerta como leída
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

        // Mutation: Resolver alerta
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
});

export const {
    useGetUnreadFatigueAlertsQuery,
    useGetClientFatigueAlertsQuery,
    useCreateFatigueAlertMutation,
    useMarkFatigueAlertAsReadMutation,
    useResolveFatigueAlertMutation,
} = fatigueApi;


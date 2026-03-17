/**
 * Sessions list API (unified training + standalone).
 * Backend: GET /api/v1/sessions
 * VISTA_LISTADO_SESIONES Fase 1.
 */

import { baseApi } from "./baseApi";
import type { SessionListResponse, GetSessionsParams } from "../types/sessions";

export const sessionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET /sessions
         * Listado unificado de sesiones (training + standalone) para un trainer.
         * Soporta filtros, paginación y ordenación.
         */
        getSessions: builder.query<SessionListResponse, GetSessionsParams>({
            query: ({
                trainerId,
                skip = 0,
                limit = 20,
                status,
                sessionType,
                dateFrom,
                dateTo,
                search,
                orderBy = "session_date",
                order = "desc",
            }) => {
                const params: Record<string, string | number> = {
                    trainer_id: trainerId,
                    skip,
                    limit,
                    order_by: orderBy,
                    order,
                };
                if (status != null && status !== "all") params.status = status;
                if (sessionType != null && sessionType !== "all")
                    params.session_type = sessionType;
                if (dateFrom) params.date_from = dateFrom;
                if (dateTo) params.date_to = dateTo;
                if (search?.trim()) params.search = search.trim();
                return {
                    url: "/sessions/",
                    params,
                };
            },
            providesTags: (result, _error, { trainerId }) =>
                result
                    ? [
                          ...result.items.map(({ id, session_kind }) => ({
                              type: "TrainingSession" as const,
                              id: `${session_kind}-${id}`,
                          })),
                          { type: "TrainingSession", id: `LIST_${trainerId}` },
                      ]
                    : [{ type: "TrainingSession", id: `LIST_${trainerId}` }],
        }),
    }),
});

export const { useGetSessionsQuery } = sessionsApi;

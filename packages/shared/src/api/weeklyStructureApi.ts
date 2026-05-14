/**
 * weeklyStructureApi.ts — RTK Query para Estructura Semanal de Bloques
 *
 * Contexto:
 * - Endpoints bajo `/training-plans/{plan_id}/period-blocks/{block_id}/weekly-structure`
 * - Fase 5 del spec: CRUD de semanas con patrones de movimiento por día.
 * - Fase 6 del spec: repetición de semanas (mutation `repeat`).
 *
 * Tags:
 * - `"WeeklyStructure"` con id compuesto `{planId}-{blockId}` para invalidación
 *   granular tras mutaciones.
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 5 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

import { baseApi } from "./baseApi";
import type {
    WeeklyStructureOut,
    WeeklyStructureWeek,
    WeeklyStructureWeekCreate,
    WeeklyStructureWeekRepeatIn,
    WeeklyStructureWeekRepeatOut,
} from "../types/weeklyStructure";

export const weeklyStructureApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // =====================================================================
        // Queries
        // =====================================================================

        /** Obtener la estructura semanal completa de un bloque (semanas + días + patrones). */
        getWeeklyStructure: builder.query<
            WeeklyStructureOut,
            { planId: number; blockId: number }
        >({
            query: ({ planId, blockId }) => ({
                url: `/training-plans/${planId}/period-blocks/${blockId}/weekly-structure`,
                method: "GET",
            }),
            providesTags: (_result, _error, arg) => [
                { type: "WeeklyStructure", id: `${arg.planId}-${arg.blockId}` },
            ],
        }),

        // =====================================================================
        // Mutations
        // =====================================================================

        /** Crear una nueva semana con días y patrones dentro de un bloque. */
        createWeeklyStructureWeek: builder.mutation<
            WeeklyStructureWeek,
            { planId: number; blockId: number; body: WeeklyStructureWeekCreate }
        >({
            query: ({ planId, blockId, body }) => ({
                url: `/training-plans/${planId}/period-blocks/${blockId}/weekly-structure/weeks`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "WeeklyStructure", id: `${arg.planId}-${arg.blockId}` },
            ],
        }),

        /** Actualizar una semana existente (reemplazo completo de días y patrones). */
        updateWeeklyStructureWeek: builder.mutation<
            WeeklyStructureWeek,
            { planId: number; blockId: number; weekId: number; body: WeeklyStructureWeekCreate }
        >({
            query: ({ planId, blockId, weekId, body }) => ({
                url: `/training-plans/${planId}/period-blocks/${blockId}/weekly-structure/weeks/${weekId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "WeeklyStructure", id: `${arg.planId}-${arg.blockId}` },
            ],
        }),

        /** Eliminar una semana y todos sus días/patrones en cascada. */
        deleteWeeklyStructureWeek: builder.mutation<
            void,
            { planId: number; blockId: number; weekId: number }
        >({
            query: ({ planId, blockId, weekId }) => ({
                url: `/training-plans/${planId}/period-blocks/${blockId}/weekly-structure/weeks/${weekId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "WeeklyStructure", id: `${arg.planId}-${arg.blockId}` },
            ],
        }),

        /** Repetir una semana (estructura + sesiones) en otras semanas del mismo bloque. */
        repeatWeeklyStructureWeek: builder.mutation<
            WeeklyStructureWeekRepeatOut,
            {
                planId: number;
                blockId: number;
                weekOrdinal: number;
                body: WeeklyStructureWeekRepeatIn;
            }
        >({
            query: ({ planId, blockId, weekOrdinal, body }) => ({
                url: `/training-plans/${planId}/period-blocks/${blockId}/weekly-structure/weeks/${weekOrdinal}/repeat`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "WeeklyStructure", id: `${arg.planId}-${arg.blockId}` },
                { type: "TrainingSession", id: "LIST" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetWeeklyStructureQuery,
    useCreateWeeklyStructureWeekMutation,
    useUpdateWeeklyStructureWeekMutation,
    useDeleteWeeklyStructureWeekMutation,
    useRepeatWeeklyStructureWeekMutation,
} = weeklyStructureApi;

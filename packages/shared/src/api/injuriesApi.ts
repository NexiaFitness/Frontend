/**
 * injuriesApi.ts — Endpoints RTK Query para sistema de lesiones
 *
 * Endpoints disponibles:
 * - GET /injuries/joints (datos referencia)
 * - GET /injuries/joints/{id}/movements
 * - GET /injuries/muscles
 * - POST /injuries/clients/{client_id} (registrar lesión)
 * - GET /injuries/clients/{client_id} (historial)
 * - GET /injuries/clients/{client_id}/active (activas)
 * - PUT /injuries/{injury_id}
 * - DELETE /injuries/{injury_id}
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import { baseApi } from "./baseApi";
import type {
    Joint,
    Movement,
    Muscle,
    ClientInjury,
    InjuryWithDetails,
    CreateInjuryRequest,
    UpdateInjuryRequest,
} from "../types/injuries";

export const injuriesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========================================================================
        // DATOS DE REFERENCIA (Joints, Movements, Muscles)
        // ========================================================================

        getJoints: builder.query<Joint[], void>({
            query: () => ({
                url: "/injuries/joints",
                method: "GET",
            }),
            providesTags: ["Injuries"],
        }),

        getJointMovements: builder.query<Movement[], number>({
            query: (jointId) => ({
                url: `/injuries/joints/${jointId}/movements`,
                method: "GET",
            }),
            providesTags: (result, error, jointId) => [
                { type: "Injuries", id: `JOINT-${jointId}-MOVEMENTS` },
            ],
        }),

        getMuscles: builder.query<Muscle[], { jointId?: number } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.jointId) {
                    queryParams.append("joint_id", params.jointId.toString());
                }

                return {
                    url: `/injuries/muscles${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["Injuries"],
        }),

        // ========================================================================
        // CRUD DE LESIONES DEL CLIENTE
        // ========================================================================

        createClientInjury: builder.mutation<ClientInjury, { clientId: number; data: CreateInjuryRequest }>({
            query: ({ clientId, data }) => ({
                url: `/injuries/clients/${clientId}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: "Injuries", id: `CLIENT-${clientId}` },
                { type: "Injuries", id: `CLIENT-${clientId}-ACTIVE` },
            ],
        }),

        getClientInjuries: builder.query<InjuryWithDetails[], { clientId: number; activeOnly?: boolean }>({
            query: ({ clientId, activeOnly = false }) => ({
                url: `/injuries/clients/${clientId}${activeOnly ? "?active_only=true" : "?active_only=false"}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Injuries", id: `CLIENT-${clientId}` },
            ],
        }),

        updateInjury: builder.mutation<ClientInjury, { injuryId: number; data: UpdateInjuryRequest }>({
            query: ({ injuryId, data }) => ({
                url: `/injuries/${injuryId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { injuryId }) => {
                const clientId = result?.client_id;
                return [
                    { type: "Injuries", id: injuryId },
                    clientId ? { type: "Injuries", id: `CLIENT-${clientId}` } : { type: "Injuries", id: "LIST" },
                    clientId ? { type: "Injuries", id: `CLIENT-${clientId}-ACTIVE` } : { type: "Injuries", id: "ACTIVE" },
                ];
            },
        }),

        deleteInjury: builder.mutation<{ message: string }, number>({
            query: (injuryId) => ({
                url: `/injuries/${injuryId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, injuryId) => [
                { type: "Injuries", id: injuryId },
                "Injuries",
            ],
        }),
    }),
});

export const {
    useGetJointsQuery,
    useGetJointMovementsQuery,
    useGetMusclesQuery,
    useCreateClientInjuryMutation,
    useGetClientInjuriesQuery,
    useUpdateInjuryMutation,
    useDeleteInjuryMutation,
} = injuriesApi;


/**
 * API de gestión de trainers usando RTK Query
 * Define endpoints: getTrainer, getCurrentTrainerProfile, updateTrainerProfile
 * Integrado con sistema RBAC (trainers pueden ver/actualizar su propio perfil)
 * 
 * Scope inicial: Complete Trainer Profile workflow
 * - GET /trainers/profile: Obtener perfil del trainer autenticado (desde JWT)
 * - PATCH /trainers/profile: Actualizar perfil profesional completo
 * - GET /trainers/{id}: Obtener trainer específico (admin only)
 * 
 * @author Frontend Team
 * @since v2.2.0
 * @updated v2.3.0 - Eliminado TrainerResponse, usando Trainer directo (alineado backend)
 */

import { baseApi } from "./baseApi";
import type {
    Trainer,
    UpdateTrainerData,
} from "../types/trainer";

export const trainerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Obtener perfil del trainer actual desde JWT (no requiere ID)
        getCurrentTrainerProfile: builder.query<Trainer, void>({
            query: () => ({
                url: "/trainers/profile",
                method: "GET",
            }),
            providesTags: ["Trainer"],
        }),

        // Actualizar perfil del trainer actual (Complete Profile workflow)
        updateTrainerProfile: builder.mutation<Trainer, UpdateTrainerData>({
            query: (data) => ({
                url: "/trainers/profile",
                method: "PATCH",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Trainer", "User"],
        }),

        // Obtener trainer específico por ID (admin only)
        getTrainer: builder.query<Trainer, number>({
            query: (id) => ({
                url: `/trainers/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Trainer", id }],
        }),

        // Desvincular cliente de trainer
        unlinkClient: builder.mutation<{ message: string }, { trainerId: number; clientId: number }>({
            query: ({ trainerId, clientId }) => ({
                url: `/trainers/${trainerId}/clients/${clientId}`,
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" },
            ],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    useGetCurrentTrainerProfileQuery,
    useUpdateTrainerProfileMutation,
    useGetTrainerQuery,
    useUnlinkClientMutation,
} = trainerApi;

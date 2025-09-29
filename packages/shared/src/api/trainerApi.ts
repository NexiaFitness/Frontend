/**
 * API de gestión de trainers usando RTK Query
 * Define endpoints: getTrainer, updateTrainer
 * Integrado con sistema RBAC (trainers pueden ver/actualizar su propio perfil)
 * 
 * Scope inicial: Complete Trainer Profile workflow
 * - GET /trainers/{id}: Obtener datos del trainer actual
 * - PUT /trainers/{id}: Actualizar perfil profesional completo
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

import { baseApi } from "./baseApi";
import type {
    Trainer,
    TrainerResponse,
    UpdateTrainerData,
} from "../types/trainer";

export const trainerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Obtener trainer específico por ID
        getTrainer: builder.query<TrainerResponse, number>({
            query: (id) => ({
                url: `/trainers/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Trainer", id }],
        }),

        // Actualizar trainer existente (Complete Profile)
        updateTrainer: builder.mutation<TrainerResponse, { id: number; data: UpdateTrainerData }>({
            query: ({ id, data }) => ({
                url: `/trainers/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Trainer", id },
                { type: "User" }, // También invalidar User para actualizar navbar/header
            ],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    useGetTrainerQuery,
    useUpdateTrainerMutation,
} = trainerApi;
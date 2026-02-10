/**
 * exerciseAlternativesApi.ts - RTK Query para alternativas de ejercicios
 *
 * Propósito: CRUD de alternativas manuales y auto-suggest por equipamiento/patrón.
 * Contexto: Backend /api/v1/exercise-alternatives/*. Usado por InjuriesTab, ExerciseDetail.
 * Mantenimiento: Alinear con backend exercise_alternatives.py.
 *
 * @author Frontend Team
 * @since v6.2.0 - Ola 1 API Layer
 */

import { baseApi } from "./baseApi";
import type {
    ExerciseAlternativeCreate,
    ExerciseAlternativeUpdate,
    ExerciseAlternativeOut,
    ExerciseAlternativeWithDetails,
    ExerciseAutoSuggestItem,
    EquipmentAlternativesResponse,
} from "../types/exerciseAlternatives";

export const exerciseAlternativesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createAlternative: builder.mutation<ExerciseAlternativeOut, ExerciseAlternativeCreate>({
            query: (body) => ({
                url: "/exercise-alternatives/",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Exercise", id: arg.exercise_id },
                { type: "Exercise", id: "LIST" },
            ],
        }),
        getExerciseAlternatives: builder.query<ExerciseAlternativeWithDetails[], number>({
            query: (exerciseId) => ({
                url: `/exercise-alternatives/exercise/${exerciseId}`,
                method: "GET",
            }),
            providesTags: (result, error, exerciseId) => [
                { type: "Exercise", id: exerciseId },
            ],
        }),
        updateAlternative: builder.mutation<
            ExerciseAlternativeOut,
            { alternativeId: number; data: ExerciseAlternativeUpdate }
        >({
            query: ({ alternativeId, data }) => ({
                url: `/exercise-alternatives/${alternativeId}`,
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: ["Exercise"],
        }),
        deleteAlternative: builder.mutation<{ message: string }, number>({
            query: (alternativeId) => ({
                url: `/exercise-alternatives/${alternativeId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Exercise"],
        }),
        getAutoSuggestedAlternatives: builder.query<
            ExerciseAutoSuggestItem[],
            { exerciseId: number; availableEquipment?: string[]; clientId?: number; limit?: number }
        >({
            query: ({ exerciseId, availableEquipment, clientId, limit = 5 }) => {
                const params = new URLSearchParams();
                if (limit !== 5) params.append("limit", limit.toString());
                if (clientId != null) params.append("client_id", clientId.toString());
                if (availableEquipment?.length) {
                    availableEquipment.forEach((eq) => params.append("available_equipment", eq));
                }
                const qs = params.toString();
                return {
                    url: `/exercise-alternatives/auto-suggest/${exerciseId}${qs ? `?${qs}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { exerciseId }) => [{ type: "Exercise", id: exerciseId }],
        }),
        getEquipmentBasedAlternatives: builder.query<
            EquipmentAlternativesResponse,
            { exerciseId: number; targetEquipment: string }
        >({
            query: ({ exerciseId, targetEquipment }) => ({
                url: `/exercise-alternatives/equipment-based/${exerciseId}?target_equipment=${encodeURIComponent(targetEquipment)}`,
                method: "GET",
            }),
            providesTags: (result, error, { exerciseId }) => [{ type: "Exercise", id: exerciseId }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateAlternativeMutation,
    useGetExerciseAlternativesQuery,
    useUpdateAlternativeMutation,
    useDeleteAlternativeMutation,
    useGetAutoSuggestedAlternativesQuery,
    useGetEquipmentBasedAlternativesQuery,
} = exerciseAlternativesApi;

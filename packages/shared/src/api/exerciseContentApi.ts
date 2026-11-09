/**
 * exerciseContentApi.ts — GET del texto de lectura de un ejercicio (H5).
 *
 * Contrato: GET /exercises/{exercise_id}/content → ExerciseContentOut.
 * Entrenador y admin. El atleta lee por sesión en athleteApi
 * (`useGetAthleteSessionExerciseContentQuery`, H8-A).
 */

import { baseApi } from "./baseApi";
import type { ExerciseContentOut } from "../types/exerciseContent";

export const exerciseContentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getExerciseContent: builder.query<ExerciseContentOut, number>({
            query: (exerciseId) => `/exercises/${exerciseId}/content`,
        }),
    }),
});

export const { useGetExerciseContentQuery } = exerciseContentApi;

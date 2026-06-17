/**
 * athleteApi.ts — Endpoints portal atleta (F3b-BE-03).
 */

import { baseApi } from "./baseApi";
import type {
    AthleteWeeklySummary,
    AthleteWeeklySummaryQuery,
} from "../types/athleteWeeklySummary";
import type { AthleteLastPerformance } from "../types/athleteLastPerformance";

export const athleteApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAthleteWeeklySummary: builder.query<
            AthleteWeeklySummary,
            AthleteWeeklySummaryQuery | void
        >({
            query: (arg) => {
                const params = new URLSearchParams();
                if (arg?.week_start) {
                    params.set("week_start", arg.week_start);
                }
                const qs = params.toString();
                return `/athlete/weekly-summary${qs ? `?${qs}` : ""}`;
            },
            providesTags: [{ type: "AthleteWeeklySummary" as const, id: "CURRENT" }],
        }),

        getAthleteLastPerformance: builder.query<AthleteLastPerformance, number>({
            query: (exerciseId) => `/athlete/exercises/${exerciseId}/last-performance`,
            providesTags: (_result, _error, exerciseId) => [
                { type: "AthleteLastPerformance" as const, id: exerciseId },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAthleteWeeklySummaryQuery,
    useGetAthleteLastPerformanceQuery,
} = athleteApi;

import { baseApi } from "./baseApi";
import type { DayException } from "../types/dayExceptions";

export const dayExceptionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDayExceptions: builder.query<
            DayException[],
            { clientId: number; startDate?: string; endDate?: string }
        >({
            query: ({ clientId, startDate, endDate }) => ({
                url: `/clients/${clientId}/day-exceptions`,
                params: {
                    ...(startDate && { start_date: startDate }),
                    ...(endDate && { end_date: endDate }),
                },
            }),
            providesTags: (_result, _error, { clientId }) => [
                { type: "DayException", id: `CLIENT_${clientId}` },
            ],
        }),

        createDayException: builder.mutation<
            DayException,
            { clientId: number; date: string; is_trainable?: boolean; note?: string }
        >({
            query: ({ clientId, date, is_trainable = false, note }) => ({
                url: `/clients/${clientId}/day-exceptions`,
                method: "POST",
                params: { date, is_trainable, ...(note && { note }) },
            }),
            invalidatesTags: (_result, _error, { clientId }) => [
                { type: "DayException", id: `CLIENT_${clientId}` },
            ],
        }),

        deleteDayException: builder.mutation<
            { message: string },
            { clientId: number; date: string }
        >({
            query: ({ clientId, date }) => ({
                url: `/clients/${clientId}/day-exceptions`,
                method: "DELETE",
                params: { date },
            }),
            invalidatesTags: (_result, _error, { clientId }) => [
                { type: "DayException", id: `CLIENT_${clientId}` },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDayExceptionsQuery,
    useCreateDayExceptionMutation,
    useDeleteDayExceptionMutation,
} = dayExceptionsApi;

/**
 * wellbeingCheckInApi.ts — TR-1 batch lookup (I24).
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import { baseApi } from "./baseApi";
import type { WellbeingCheckIn } from "../types/trainingSessions";

export interface WellbeingCheckInListResponse {
    items: WellbeingCheckIn[];
}

export function wellbeingBySessionId(
    items: WellbeingCheckIn[] | undefined
): Map<number, WellbeingCheckIn> {
    const map = new Map<number, WellbeingCheckIn>();
    for (const item of items ?? []) {
        map.set(item.session_id, item);
    }
    return map;
}

export function getSubmitWellbeingInvalidationTags(sessionId: number): Array<{
    type: "TrainingSession";
    id: string | number;
}> {
    return [
        { type: "TrainingSession", id: sessionId },
        { type: "TrainingSession", id: `WELLBEING_${sessionId}` },
    ];
}

export const wellbeingCheckInApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWellbeingCheckInsBySessions: builder.query<
            WellbeingCheckInListResponse,
            number[]
        >({
            query: (sessionIds) => ({
                url: "/training-sessions/wellbeing-check-ins",
                params: { session_ids: sessionIds.join(",") },
            }),
            providesTags: (_result, _error, sessionIds) =>
                sessionIds.map((id) => ({
                    type: "TrainingSession" as const,
                    id: `WELLBEING_${id}`,
                })),
        }),
    }),
});

export const { useGetWellbeingCheckInsBySessionsQuery } = wellbeingCheckInApi;

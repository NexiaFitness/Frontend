/**
 * useOptionalWellbeingCheckIn — TR-1: treat missing check-in (404) as null.
 */

import { useGetWellbeingCheckInQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { WellbeingCheckIn } from "@nexia/shared/types/trainingSessions";

export function useOptionalWellbeingCheckIn(sessionId: number | undefined): {
    checkIn: WellbeingCheckIn | null | undefined;
    isLoading: boolean;
} {
    const result = useGetWellbeingCheckInQuery(sessionId ?? 0, {
        skip: !sessionId,
    });

    if (
        result.isError &&
        result.error &&
        typeof result.error === "object" &&
        "status" in result.error &&
        result.error.status === 404
    ) {
        return { checkIn: null, isLoading: false };
    }

    return {
        checkIn: result.data,
        isLoading: result.isLoading || result.isFetching,
    };
}

/**
 * useOptionalWellbeingCheckIn — TR-1: treat missing check-in (404) as null.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import { useGetWellbeingCheckInQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { WellbeingCheckIn } from "@nexia/shared/types/trainingSessions";
import { resolveOptionalWellbeingQuery } from "./resolveOptionalWellbeingQuery";

export function useOptionalWellbeingCheckIn(sessionId: number | undefined): {
    checkIn: WellbeingCheckIn | null | undefined;
    isLoading: boolean;
    isError: boolean;
} {
    const result = useGetWellbeingCheckInQuery(sessionId ?? 0, {
        skip: !sessionId,
    });

    return resolveOptionalWellbeingQuery(result);
}

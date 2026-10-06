/**
 * resolveOptionalWellbeingQuery — TR-1: 404 = sin check-in; el resto es error.
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import type { WellbeingCheckIn } from "@nexia/shared/types/trainingSessions";

export function isRtkNotFoundError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error != null &&
        "status" in error &&
        (error as { status: unknown }).status === 404
    );
}

export interface OptionalWellbeingQueryInput {
    data?: WellbeingCheckIn;
    error?: unknown;
    isError: boolean;
    isLoading: boolean;
    isFetching: boolean;
}

export interface OptionalWellbeingQueryState {
    checkIn: WellbeingCheckIn | null | undefined;
    isLoading: boolean;
    isError: boolean;
}

export function resolveOptionalWellbeingQuery(
    result: OptionalWellbeingQueryInput
): OptionalWellbeingQueryState {
    if (result.isError && isRtkNotFoundError(result.error)) {
        return { checkIn: null, isLoading: false, isError: false };
    }
    if (result.isError) {
        return { checkIn: null, isLoading: false, isError: true };
    }
    return {
        checkIn: result.data,
        isLoading: result.isLoading || result.isFetching,
        isError: false,
    };
}

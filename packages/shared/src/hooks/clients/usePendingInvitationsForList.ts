/**
 * usePendingInvitationsForList — invitaciones pending/expired para merge en ClientList.
 */

import { useMemo } from "react";
import { useListInvitationsQuery } from "../../api/invitationsApi";
import type { Invitation } from "../../types/invitation";

export interface UsePendingInvitationsForListParams {
    skip?: boolean;
    search?: string | null;
}

export interface UsePendingInvitationsForListResult {
    items: Invitation[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

function matchesSearch(invitation: Invitation, search: string): boolean {
    const q = search.toLowerCase();
    const nombre = (invitation.nombre ?? "").toLowerCase();
    const email = invitation.email.toLowerCase();
    return nombre.includes(q) || email.includes(q);
}

export function usePendingInvitationsForList({
    skip = false,
    search,
}: UsePendingInvitationsForListParams): UsePendingInvitationsForListResult {
    const { data: pendingData, isLoading: pendingLoading, isError: pendingError, refetch: refetchPending } =
        useListInvitationsQuery({ status: "pending", page_size: 50 }, { skip });

    const { data: expiredData, isLoading: expiredLoading, isError: expiredError, refetch: refetchExpired } =
        useListInvitationsQuery({ status: "expired", page_size: 50 }, { skip });

    const items = useMemo(() => {
        const merged = [
            ...(pendingData?.items ?? []),
            ...(expiredData?.items ?? []),
        ];
        const trimmed = search?.trim();
        if (!trimmed) {
            return merged;
        }
        return merged.filter((inv) => matchesSearch(inv, trimmed));
    }, [expiredData?.items, pendingData?.items, search]);

    const refetch = () => {
        refetchPending();
        refetchExpired();
    };

    return {
        items,
        isLoading: pendingLoading || expiredLoading,
        isError: pendingError || expiredError,
        refetch,
    };
}

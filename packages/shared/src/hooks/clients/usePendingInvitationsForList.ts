/**
 * usePendingInvitationsForList — invitaciones pending para merge en ClientList.
 *
 * Spec §5.5: solo leads sin vínculo activo. Las expiradas no se listan aquí
 * (reenvío vía fila pending o «Nuevo cliente»); canceladas/aceptadas ocultas en BE.
 */

import { useMemo } from "react";
import { useListInvitationsQuery } from "../../api/invitationsApi";
import type { Invitation } from "../../types/invitation";
import { mergeInvitationsForClientList } from "../../utils/invitationListMerge";

export interface UsePendingInvitationsForListParams {
    skip?: boolean;
    search?: string | null;
    /** Emails del roster activo — defensa FE si BE desactualizado. */
    rosterEmails?: Iterable<string>;
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
    rosterEmails,
}: UsePendingInvitationsForListParams): UsePendingInvitationsForListResult {
    const { data: pendingData, isLoading, isError, refetch } = useListInvitationsQuery(
        { status: "pending", page_size: 50 },
        { skip },
    );

    const items = useMemo(() => {
        const merged = mergeInvitationsForClientList(
            pendingData?.items ?? [],
            rosterEmails ?? [],
        );
        const trimmed = search?.trim();
        if (!trimmed) {
            return merged;
        }
        return merged.filter((inv) => matchesSearch(inv, trimmed));
    }, [pendingData?.items, rosterEmails, search]);

    return {
        items,
        isLoading,
        isError,
        refetch,
    };
}

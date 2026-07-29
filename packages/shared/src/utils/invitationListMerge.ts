/**
 * invitationListMerge.ts — Merge pending/expired para ClientList (spec §5.5).
 *
 * - Excluye emails ya en roster activo (defensa FE si BE desactualizado).
 * - Una fila por email: pending > expired > cancelled.
 */

import type { Invitation, InvitationStatus } from "../types/invitation";

const STATUS_PRIORITY: Record<InvitationStatus, number> = {
    pending: 3,
    expired: 2,
    cancelled: 1,
    accepted: 0,
};

export function normalizeInvitationEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function mergeInvitationsForClientList(
    invitations: Invitation[],
    rosterEmails: Iterable<string> = [],
): Invitation[] {
    const roster = new Set<string>();
    for (const email of rosterEmails) {
        roster.add(normalizeInvitationEmail(email));
    }

    const byEmail = new Map<string, Invitation>();

    for (const invitation of invitations) {
        const emailKey = normalizeInvitationEmail(invitation.email);
        if (roster.has(emailKey)) {
            continue;
        }

        const existing = byEmail.get(emailKey);
        if (!existing) {
            byEmail.set(emailKey, invitation);
            continue;
        }

        const invPriority = STATUS_PRIORITY[invitation.status] ?? 0;
        const existingPriority = STATUS_PRIORITY[existing.status] ?? 0;

        if (invPriority > existingPriority) {
            byEmail.set(emailKey, invitation);
            continue;
        }

        if (
            invPriority === existingPriority &&
            new Date(invitation.created_at).getTime() >
                new Date(existing.created_at).getTime()
        ) {
            byEmail.set(emailKey, invitation);
        }
    }

    return Array.from(byEmail.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

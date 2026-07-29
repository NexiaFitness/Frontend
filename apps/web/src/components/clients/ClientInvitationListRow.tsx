/**
 * ClientInvitationListRow — Invitación pendiente en lista clientes (premium).
 */

import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import type { Invitation } from "@nexia/shared/types/invitation";
import { useCancelInvitationMutation } from "@nexia/shared/api/invitationsApi";
import { InvitationRowActions } from "@/components/clients/invitations";
import {
    getInvitationBadgeLabel,
    getInvitationDisplayName,
} from "@/components/clients/invitations/invitationPresentation";
import { Alert } from "@/components/ui/feedback";
import {
    CLIENT_LIST_INVITATION_BADGE,
    CLIENT_LIST_INVITATION_DISMISS,
    CLIENT_LIST_INVITATION_EXPIRED_BADGE,
    CLIENT_LIST_ROW_ACTIONS,
    CLIENT_LIST_ROW_BADGE_ROW,
    CLIENT_LIST_ROW_BODY,
    CLIENT_LIST_ROW_EMAIL,
    CLIENT_LIST_ROW_HEAD,
    CLIENT_LIST_ROW_INVITATION,
    CLIENT_LIST_ROW_NAME,
} from "./clientListPresentation";

export interface ClientInvitationListRowProps {
    invitation: Invitation;
}

export const ClientInvitationListRow: React.FC<ClientInvitationListRowProps> = ({ invitation }) => {
    const displayName = getInvitationDisplayName(invitation.nombre, invitation.email);
    const [cancelInvitation, { isLoading: isCancelling }] = useCancelInvitationMutation();
    const [dismissError, setDismissError] = useState<string | null>(null);

    const canDismiss = invitation.status === "pending" || invitation.status === "expired";

    const handleDismiss = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setDismissError(null);
        try {
            await cancelInvitation(invitation.id).unwrap();
        } catch {
            setDismissError("No se pudo quitar la invitación.");
        }
    };

    return (
        <li>
            <article className={CLIENT_LIST_ROW_INVITATION}>
                {canDismiss ? (
                    <button
                        type="button"
                        className={CLIENT_LIST_INVITATION_DISMISS}
                        onClick={handleDismiss}
                        disabled={isCancelling}
                        aria-label="Quitar invitación"
                    >
                        <X className="size-3.5" aria-hidden />
                    </button>
                ) : null}

                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-warning/30 bg-warning/10 sm:size-11">
                    <Mail className="size-4 text-warning" aria-hidden />
                </div>

                <div className={CLIENT_LIST_ROW_BODY}>
                    <div className={CLIENT_LIST_ROW_HEAD}>
                        <div className="min-w-0 pr-6">
                            <p className={CLIENT_LIST_ROW_NAME}>{displayName}</p>
                            <p className={CLIENT_LIST_ROW_EMAIL}>{invitation.email}</p>
                        </div>
                    </div>
                    <div className={CLIENT_LIST_ROW_BADGE_ROW}>
                        <span
                            className={
                                invitation.status === "pending"
                                    ? CLIENT_LIST_INVITATION_BADGE
                                    : CLIENT_LIST_INVITATION_EXPIRED_BADGE
                            }
                        >
                            {getInvitationBadgeLabel(invitation.status)}
                        </span>
                    </div>
                    {dismissError ? (
                        <Alert variant="error" className="text-xs">
                            {dismissError}
                        </Alert>
                    ) : null}
                </div>

                <div className={CLIENT_LIST_ROW_ACTIONS}>
                    <InvitationRowActions invitation={invitation} layout="list" />
                </div>
            </article>
        </li>
    );
};

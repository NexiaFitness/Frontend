/**
 * InvitationRowActions — reenviar invitación desde la lista de clientes.
 */

import React, { useState } from "react";
import { Mail } from "lucide-react";
import {
    useResendInvitationMutation,
} from "@nexia/shared/api/invitationsApi";
import type { Invitation } from "@nexia/shared/types/invitation";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { CLIENT_LIST_INVITATION_RESEND } from "@/components/clients/clientListPresentation";

interface InvitationRowActionsProps {
    invitation: Invitation;
    layout?: "grid" | "list";
}

export const InvitationRowActions: React.FC<InvitationRowActionsProps> = ({
    invitation,
    layout = "grid",
}) => {
    const [resendInvitation, { isLoading: isResending }] = useResendInvitationMutation();
    const [actionError, setActionError] = useState<string | null>(null);

    const handleResend = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setActionError(null);
        try {
            await resendInvitation(invitation.id).unwrap();
        } catch {
            setActionError("No se pudo reenviar la invitación.");
        }
    };

    if (layout === "list") {
        return (
            <div
                className="flex flex-col items-end gap-2"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
            >
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending}
                    className={CLIENT_LIST_INVITATION_RESEND}
                >
                    <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Reenviar
                </Button>
                {actionError ? (
                    <Alert variant="error" className="text-xs">
                        {actionError}
                    </Alert>
                ) : null}
            </div>
        );
    }

    return (
        <div
            className="mt-3 space-y-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <Button
                type="button"
                variant="ghost-primary"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="min-h-touch sm:min-h-0"
            >
                <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Reenviar
            </Button>
            {actionError ? (
                <Alert variant="error" className="text-xs">
                    {actionError}
                </Alert>
            ) : null}
        </div>
    );
};

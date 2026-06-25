/**
 * InvitationRowActions — reenviar / cancelar invitación desde la lista de clientes.
 */

import React, { useState } from "react";
import { Mail, X } from "lucide-react";
import {
    useCancelInvitationMutation,
    useResendInvitationMutation,
} from "@nexia/shared/api/invitationsApi";
import type { Invitation } from "@nexia/shared/types/invitation";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";

interface InvitationRowActionsProps {
    invitation: Invitation;
    layout?: "grid" | "list";
}

export const InvitationRowActions: React.FC<InvitationRowActionsProps> = ({
    invitation,
    layout = "grid",
}) => {
    const [resendInvitation, { isLoading: isResending }] = useResendInvitationMutation();
    const [cancelInvitation, { isLoading: isCancelling }] = useCancelInvitationMutation();
    const [actionError, setActionError] = useState<string | null>(null);
    const [devLink, setDevLink] = useState<string | null>(null);

    const isBusy = isResending || isCancelling;

    const handleResend = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setActionError(null);
        setDevLink(null);
        try {
            const result = await resendInvitation(invitation.id).unwrap();
            if (result.magic_link) {
                setDevLink(result.magic_link);
            }
        } catch {
            setActionError("No se pudo reenviar la invitación.");
        }
    };

    const handleCancel = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setActionError(null);
        setDevLink(null);
        try {
            await cancelInvitation(invitation.id).unwrap();
        } catch {
            setActionError("No se pudo cancelar la invitación.");
        }
    };

    return (
        <div
            className={layout === "list" ? "flex flex-col items-end gap-2" : "mt-3 space-y-2"}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <div className={layout === "list" ? "flex flex-wrap justify-end gap-2" : "flex flex-wrap gap-2"}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isBusy}
                    className="min-h-touch sm:min-h-0"
                >
                    <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Reenviar
                </Button>
                {invitation.status === "pending" ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isBusy}
                        className="min-h-touch text-destructive hover:text-destructive sm:min-h-0"
                    >
                        <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Cancelar
                    </Button>
                ) : null}
            </div>
            {actionError ? (
                <Alert variant="error" className="text-xs">
                    {actionError}
                </Alert>
            ) : null}
            {devLink ? (
                <p className="break-all text-xs text-muted-foreground">
                    Enlace dev: {devLink}
                </p>
            ) : null}
        </div>
    );
};

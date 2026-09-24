/**
 * AdminUserReasonModal.tsx — Confirmación con motivo obligatorio (U2).
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Textarea } from "@/components/ui/forms";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
} from "@/components/ui/modals";
import { cn } from "@/lib/utils";
import type { AdminUserReasonAction } from "./useAdminUserActions";
import { ADMIN_USERS_COPY, ADMIN_USERS_MODAL_FIELD } from "./adminUsersPresentation";

export interface AdminUserReasonModalProps {
    isOpen: boolean;
    action: AdminUserReasonAction | null;
    reason: string;
    onReasonChange: (value: string) => void;
    reasonError?: string;
    canSubmit: boolean;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

function titleForAction(action: AdminUserReasonAction | null): string {
    switch (action) {
        case "suspend":
            return ADMIN_USERS_COPY.actionSuspend;
        case "activate":
            return ADMIN_USERS_COPY.actionActivate;
        case "force-logout":
            return ADMIN_USERS_COPY.actionForceLogout;
        default:
            return ADMIN_USERS_COPY.confirm;
    }
}

export const AdminUserReasonModal: React.FC<AdminUserReasonModalProps> = ({
    isOpen,
    action,
    reason,
    onReasonChange,
    reasonError,
    canSubmit,
    isLoading,
    onClose,
    onConfirm,
}) => {
    const destructive = action === "suspend";

    return (
        <NexiaPremiumModal
            isOpen={isOpen && action != null}
            onClose={onClose}
            title={titleForAction(action)}
            description="Indica el motivo de la intervención. Quedará registrado en auditoría."
            maxWidth="lg"
            isLoading={isLoading}
            data-testid="admin-user-reason-modal"
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                        <Button type="button" variant="ghost-primary" onClick={onClose} disabled={isLoading}>
                            {ADMIN_USERS_COPY.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant={destructive ? "outline-destructive" : "primary"}
                            onClick={onConfirm}
                            disabled={!canSubmit || isLoading}
                            isLoading={isLoading}
                            className={cn(!destructive && NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS)}
                            data-testid="admin-user-reason-submit"
                        >
                            {ADMIN_USERS_COPY.confirm}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className={ADMIN_USERS_MODAL_FIELD}>
                <Textarea
                    label={ADMIN_USERS_COPY.reasonLabel}
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                    placeholder={ADMIN_USERS_COPY.reasonPlaceholder}
                    rows={4}
                    error={reasonError}
                    data-testid="admin-user-reason-input"
                />
            </div>
        </NexiaPremiumModal>
    );
};

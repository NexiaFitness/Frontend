/**
 * AdminSetPasswordModal.tsx — Reset contraseña con motivo (U2).
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
} from "@/components/ui/modals";
import { useSetAdminUserPasswordMutation } from "@nexia/shared/api/adminUsersApi";
import { parseAdminUsersApiError } from "@nexia/shared/utils/adminUsers/parseAdminUsersApiError";
import { validateAdminReason } from "@nexia/shared/utils/adminUsers/adminUserPermissions";
import { validatePassword } from "@nexia/shared/utils/validations/auth/validation";
import { ADMIN_USERS_COPY, ADMIN_USERS_MODAL_FIELD } from "./adminUsersPresentation";

export interface AdminSetPasswordModalProps {
    isOpen: boolean;
    userId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const AdminSetPasswordModal: React.FC<AdminSetPasswordModalProps> = ({
    isOpen,
    userId,
    onClose,
    onSuccess,
}) => {
    const [newPassword, setNewPassword] = useState("");
    const [reason, setReason] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [setPassword, { isLoading }] = useSetAdminUserPasswordMutation();

    const reset = () => {
        setNewPassword("");
        setReason("");
        setFieldErrors({});
    };

    const handleClose = () => {
        if (isLoading) return;
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        const pwdErr = validatePassword(newPassword);
        if (pwdErr) errors.new_password = pwdErr;
        const reasonErr = validateAdminReason(reason);
        if (reasonErr) errors.reason = reasonErr;
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await setPassword({
                userId,
                body: { new_password: newPassword, reason: reason.trim() },
            }).unwrap();
            reset();
            onSuccess();
        } catch (error: unknown) {
            const parsed = parseAdminUsersApiError(error);
            setFieldErrors({
                new_password: parsed.new_password ?? "",
                reason: parsed.reason ?? "",
                form: parsed.form ?? "",
            });
        }
    };

    const livePasswordError =
        newPassword.length > 0 ? validatePassword(newPassword) : undefined;
    const liveReasonError =
        reason.length > 0 ? validateAdminReason(reason) : undefined;
    const canSubmit =
        validatePassword(newPassword) == null && validateAdminReason(reason) == null;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={handleClose}
            title={ADMIN_USERS_COPY.setPasswordTitle}
            maxWidth="lg"
            isLoading={isLoading}
            data-testid="admin-set-password-modal"
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                        <Button type="button" variant="ghost-primary" onClick={handleClose} disabled={isLoading}>
                            {ADMIN_USERS_COPY.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className={NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS}
                            onClick={handleSubmit}
                            disabled={!canSubmit || isLoading}
                            isLoading={isLoading}
                            data-testid="admin-set-password-submit"
                        >
                            {ADMIN_USERS_COPY.setPasswordSubmit}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className={ADMIN_USERS_MODAL_FIELD}>
                {fieldErrors.form ? (
                    <p className="text-sm text-destructive" role="alert">
                        {fieldErrors.form}
                    </p>
                ) : null}
                <Input
                    label={ADMIN_USERS_COPY.fieldNewPassword}
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.new_password) {
                            setFieldErrors((prev) => ({ ...prev, new_password: "" }));
                        }
                    }}
                    error={fieldErrors.new_password || livePasswordError}
                    data-testid="admin-set-password-input"
                />
                <Textarea
                    label={ADMIN_USERS_COPY.reasonLabel}
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (fieldErrors.reason) {
                            setFieldErrors((prev) => ({ ...prev, reason: "" }));
                        }
                    }}
                    placeholder={ADMIN_USERS_COPY.reasonPlaceholder}
                    rows={3}
                    error={fieldErrors.reason || liveReasonError}
                    data-testid="admin-set-password-reason"
                />
            </div>
        </NexiaPremiumModal>
    );
};

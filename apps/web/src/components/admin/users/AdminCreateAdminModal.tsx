/**
 * AdminCreateAdminModal.tsx — Alta de administrador con motivo (U2).
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
import { useCreateAdminUserMutation } from "@nexia/shared/api/adminUsersApi";
import { parseAdminUsersApiError } from "@nexia/shared/utils/adminUsers/parseAdminUsersApiError";
import { validateAdminReason } from "@nexia/shared/utils/adminUsers/adminUserPermissions";
import { validatePassword } from "@nexia/shared/utils/validations/auth/validation";
import { ADMIN_USERS_COPY, ADMIN_USERS_MODAL_FIELD } from "./adminUsersPresentation";

export interface AdminCreateAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (userId: number) => void;
}

export const AdminCreateAdminModal: React.FC<AdminCreateAdminModalProps> = ({
    isOpen,
    onClose,
    onCreated,
}) => {
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [reason, setReason] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [createAdmin, { isLoading }] = useCreateAdminUserMutation();

    const reset = () => {
        setNombre("");
        setApellidos("");
        setEmail("");
        setPassword("");
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
        if (!nombre.trim()) errors.nombre = "El nombre es obligatorio";
        if (!apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios";
        if (!email.trim()) errors.email = "El email es obligatorio";
        const pwdErr = validatePassword(password);
        if (pwdErr) errors.password = pwdErr;
        const reasonErr = validateAdminReason(reason);
        if (reasonErr) errors.reason = reasonErr;
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            const created = await createAdmin({
                nombre: nombre.trim(),
                apellidos: apellidos.trim(),
                email: email.trim(),
                password,
                reason: reason.trim(),
            }).unwrap();
            reset();
            onCreated(created.id);
        } catch (error: unknown) {
            const parsed = parseAdminUsersApiError(error);
            setFieldErrors({
                email: parsed.email ?? "",
                password: parsed.password ?? "",
                reason: parsed.reason ?? "",
                form: parsed.form ?? "",
            });
        }
    };

    const canSubmit =
        nombre.trim().length > 0 &&
        apellidos.trim().length > 0 &&
        email.trim().length > 0 &&
        validatePassword(password) == null &&
        validateAdminReason(reason) == null;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={handleClose}
            title={ADMIN_USERS_COPY.createAdminTitle}
            maxWidth="lg"
            isLoading={isLoading}
            data-testid="admin-create-admin-modal"
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
                            data-testid="admin-create-admin-submit"
                        >
                            {ADMIN_USERS_COPY.createAdminSubmit}
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
                    label={ADMIN_USERS_COPY.fieldNombre}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    error={fieldErrors.nombre}
                />
                <Input
                    label={ADMIN_USERS_COPY.fieldApellidos}
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    error={fieldErrors.apellidos}
                />
                <Input
                    label={ADMIN_USERS_COPY.fieldEmail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                />
                <Input
                    label={ADMIN_USERS_COPY.fieldPassword}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password}
                />
                <Textarea
                    label={ADMIN_USERS_COPY.reasonLabel}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={ADMIN_USERS_COPY.reasonPlaceholder}
                    rows={3}
                    error={fieldErrors.reason}
                    data-testid="admin-create-admin-reason"
                />
            </div>
        </NexiaPremiumModal>
    );
};

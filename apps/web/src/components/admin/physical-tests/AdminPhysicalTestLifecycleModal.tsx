/**
 * AdminPhysicalTestLifecycleModal.tsx — Desactivar / reactivar test estándar (T2).
 */

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttons";
import {
    NexiaPremiumModal,
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
} from "@/components/ui/modals";
import {
    parseAdminPhysicalTestsApiError,
    useDeactivateAdminPhysicalTestMutation,
    useReactivateAdminPhysicalTestMutation,
    type AdminPhysicalTestOut,
} from "@nexia/shared";
import { ADMIN_PT_COPY } from "./adminPhysicalTestsPresentation";

export interface AdminPhysicalTestLifecycleModalProps {
    isOpen: boolean;
    item: AdminPhysicalTestOut | null;
    mode: "deactivate" | "reactivate";
    onClose: () => void;
    onDone: () => void;
}

export const AdminPhysicalTestLifecycleModal: React.FC<
    AdminPhysicalTestLifecycleModalProps
> = ({ isOpen, item, mode, onClose, onDone }) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [deactivate, { isLoading: deactivating }] =
        useDeactivateAdminPhysicalTestMutation();
    const [reactivate, { isLoading: reactivating }] =
        useReactivateAdminPhysicalTestMutation();
    const isLoading = deactivating || reactivating;

    useEffect(() => {
        if (!isOpen) setFormError(null);
    }, [isOpen]);

    if (!item) return null;

    const title =
        mode === "deactivate" ? ADMIN_PT_COPY.deactivateTitle : ADMIN_PT_COPY.reactivateTitle;
    const body =
        mode === "deactivate" ? ADMIN_PT_COPY.deactivateBody : ADMIN_PT_COPY.reactivateBody;
    const confirmLabel =
        mode === "deactivate"
            ? ADMIN_PT_COPY.deactivateConfirm
            : ADMIN_PT_COPY.reactivateConfirm;

    const handleConfirm = async () => {
        setFormError(null);
        try {
            if (mode === "deactivate") {
                await deactivate(item.id).unwrap();
            } else {
                await reactivate(item.id).unwrap();
            }
            onDone();
        } catch (error: unknown) {
            setFormError(parseAdminPhysicalTestsApiError(error).form ?? "Error");
        }
    };

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={() => {
                if (!isLoading) onClose();
            }}
            title={title}
            description={`${item.name} — ${body}`}
            maxWidth="md"
            isLoading={isLoading}
            data-testid="admin-physical-test-lifecycle-modal"
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {ADMIN_PT_COPY.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant={
                                mode === "deactivate" ? "outline-destructive" : "ghost-primary"
                            }
                            onClick={() => void handleConfirm()}
                            disabled={isLoading}
                            isLoading={isLoading}
                            data-testid="admin-physical-test-lifecycle-confirm"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            }
        >
            {formError ? (
                <p className="text-sm text-destructive" role="alert">
                    {formError}
                </p>
            ) : null}
        </NexiaPremiumModal>
    );
};

/**
 * TrainingSessionDeleteConfirmModal.tsx — Confirmar borrado; 409 enseña el motivo (B-04).
 */

import React, { useEffect, useState } from "react";

import { getMutationErrorMessage } from "@nexia/shared";
import { useToast } from "@/components/ui/feedback";
import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";

import {
    SESSION_DELETE_ACK_LABEL,
    SESSION_DELETE_BLOCKED_TITLE,
    SESSION_DELETE_CONFIRM_LABEL,
    SESSION_DELETE_CONFIRM_TITLE,
    SESSION_DELETE_LOADING_LABEL,
    SESSION_DELETE_MODAL_TEST_ID,
    SESSION_DELETE_SUCCESS_TOAST,
} from "./sessionDeleteDialogPresentation";

export interface TrainingSessionDeleteConfirmModalProps {
    isOpen: boolean;
    sessionName?: string | null;
    confirmTitle?: string;
    confirmDescription?: React.ReactNode;
    isDeleting: boolean;
    onClose: () => void;
    onConfirmDelete: () => Promise<void>;
    onDeleted?: () => void;
}

export const TrainingSessionDeleteConfirmModal: React.FC<
    TrainingSessionDeleteConfirmModalProps
> = ({
    isOpen,
    sessionName,
    confirmTitle = SESSION_DELETE_CONFIRM_TITLE,
    confirmDescription,
    isDeleting,
    onClose,
    onConfirmDelete,
    onDeleted,
}) => {
    const { showSuccess } = useToast();
    const [blockedReason, setBlockedReason] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) setBlockedReason(null);
    }, [isOpen]);

    const handleClose = () => {
        if (isDeleting) return;
        setBlockedReason(null);
        onClose();
    };

    const handleConfirm = async () => {
        if (blockedReason) {
            handleClose();
            return;
        }
        try {
            await onConfirmDelete();
            setBlockedReason(null);
            onClose();
            showSuccess(SESSION_DELETE_SUCCESS_TOAST);
            onDeleted?.();
        } catch (err) {
            setBlockedReason(getMutationErrorMessage(err));
        }
    };

    const name = sessionName?.trim();

    return (
        <NexiaPremiumConfirmModal
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={() => {
                void handleConfirm();
            }}
            isLoading={isDeleting && blockedReason == null}
            loadingConfirmLabel={SESSION_DELETE_LOADING_LABEL}
            data-testid={SESSION_DELETE_MODAL_TEST_ID}
            title={blockedReason ? SESSION_DELETE_BLOCKED_TITLE : confirmTitle}
            description={
                blockedReason
                    ? blockedReason
                    : confirmDescription ??
                      (name ? (
                          <>
                              ¿Seguro que quieres eliminar la sesión{" "}
                              <span className={NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS}>
                                  «{name}»
                              </span>
                              ? Esta acción no se puede deshacer.
                          </>
                      ) : (
                          "¿Seguro que quieres eliminar esta sesión? Esta acción no se puede deshacer."
                      ))
            }
            closeOnBackdrop={!isDeleting}
            closeOnEsc={!isDeleting}
            confirmLabel={
                blockedReason ? SESSION_DELETE_ACK_LABEL : SESSION_DELETE_CONFIRM_LABEL
            }
            confirmVariant={blockedReason ? "primary" : "destructive"}
        />
    );
};

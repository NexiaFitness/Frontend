/**
 * NexiaPremiumConfirmModal — Confirmación premium reutilizable (entrenador/admin).
 *
 * Sustituye BaseModal + botones sueltos en flujos delete / logout / guardar breve.
 */

import React from "react";

import { Button, type ButtonVariant } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

import { NexiaPremiumModal } from "./NexiaPremiumModal";
import type { NexiaPremiumModalMaxWidth } from "./nexiaPremiumModalPresentation";
import {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
} from "./nexiaPremiumConfirmPresentation";

export type NexiaPremiumConfirmVariant = "destructive" | "primary";

const confirmVariantToButton: Record<NexiaPremiumConfirmVariant, ButtonVariant> = {
    destructive: "outline-destructive",
    primary: "primary",
};

export interface NexiaPremiumConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Contenido opcional entre descripción y footer (resumen lesión, aviso extra). */
    bodyContent?: React.ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    confirmVariant?: NexiaPremiumConfirmVariant;
    isLoading?: boolean;
    loadingConfirmLabel?: string;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    maxWidth?: NexiaPremiumModalMaxWidth;
    "data-testid"?: string;
}

export const NexiaPremiumConfirmModal: React.FC<NexiaPremiumConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    bodyContent,
    confirmLabel,
    cancelLabel = "Cancelar",
    confirmVariant = "destructive",
    isLoading = false,
    loadingConfirmLabel,
    closeOnBackdrop = true,
    closeOnEsc = true,
    maxWidth = "lg",
    "data-testid": dataTestId,
}) => {
    const confirmButtonVariant = confirmVariantToButton[confirmVariant];
    const blockClose = isLoading;
    const confirmText =
        isLoading && loadingConfirmLabel ? loadingConfirmLabel : confirmLabel;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            maxWidth={maxWidth}
            data-testid={dataTestId}
            closeOnBackdrop={closeOnBackdrop && !blockClose}
            closeOnEsc={closeOnEsc && !blockClose}
            bodyClassName={bodyContent ? undefined : "hidden"}
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            variant={confirmButtonVariant}
                            onClick={onConfirm}
                            disabled={isLoading}
                            isLoading={isLoading}
                            className={cn(
                                confirmVariant === "primary" &&
                                    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
                            )}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            }
        >
            {bodyContent ?? null}
        </NexiaPremiumModal>
    );
};

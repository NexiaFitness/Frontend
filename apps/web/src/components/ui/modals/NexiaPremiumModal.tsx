/**
 * NexiaPremiumModal.tsx — Modal premium reutilizable (portal, negro intenso, divider glow).
 *
 * Usar en flujos entrenador/admin donde BaseModal resulta genérico o poco premium.
 * Referencia: BlockPatternPickerSheet.
 */

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";

import {
    NEXIA_PREMIUM_MODAL_BACKDROP_CLASS,
    NEXIA_PREMIUM_MODAL_BODY_CLASS,
    NEXIA_PREMIUM_MODAL_CLOSE_BTN_CLASS,
    NEXIA_PREMIUM_MODAL_DESCRIPTION_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_CLASS,
    NEXIA_PREMIUM_MODAL_HEADER_CLASS,
    NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_LINE_CLASS,
    NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_WRAP_CLASS,
    NEXIA_PREMIUM_MODAL_HEADER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_OVERLAY_CLASS,
    NEXIA_PREMIUM_MODAL_TITLE_CLASS,
    nexiaPremiumModalShellClass,
    type NexiaPremiumModalMaxWidth,
} from "./nexiaPremiumModalPresentation";

export interface NexiaPremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: NexiaPremiumModalMaxWidth;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    className?: string;
    bodyClassName?: string;
    descriptionClassName?: string;
    "data-testid"?: string;
}

export const NexiaPremiumModal: React.FC<NexiaPremiumModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "2xl",
    closeOnBackdrop = true,
    closeOnEsc = true,
    showCloseButton = true,
    className,
    bodyClassName,
    descriptionClassName,
    "data-testid": dataTestId,
}) => {
    const shellRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen && closeOnEsc) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
            setTimeout(() => shellRef.current?.focus(), 100);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, closeOnEsc, onClose]);

    if (!isOpen) return null;

    const portalTarget =
        typeof document !== "undefined" ? document.body : null;
    if (!portalTarget) return null;

    const handleBackdropClick = () => {
        if (closeOnBackdrop) {
            onClose();
        }
    };

    return createPortal(
        <div className={NEXIA_PREMIUM_MODAL_OVERLAY_CLASS} data-testid={dataTestId}>
            <div
                className={NEXIA_PREMIUM_MODAL_BACKDROP_CLASS}
                onClick={handleBackdropClick}
                aria-hidden
            />

            <div
                ref={shellRef}
                className={cn(nexiaPremiumModalShellClass(maxWidth), className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
            >
                <NexiaGlassAccentRim />

                <header className={NEXIA_PREMIUM_MODAL_HEADER_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_HEADER_ROW_CLASS}>
                        <div className="min-w-0 flex-1">
                            <h2
                                id={titleId}
                                className={NEXIA_PREMIUM_MODAL_TITLE_CLASS}
                            >
                                {title}
                            </h2>
                            {description ? (
                                <div
                                    id={descriptionId}
                                    className={cn(
                                        NEXIA_PREMIUM_MODAL_DESCRIPTION_CLASS,
                                        descriptionClassName,
                                    )}
                                >
                                    {description}
                                </div>
                            ) : null}
                        </div>
                        {showCloseButton ? (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Cerrar"
                                className={NEXIA_PREMIUM_MODAL_CLOSE_BTN_CLASS}
                            >
                                <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                        ) : null}
                    </div>
                </header>

                <div
                    className={NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_WRAP_CLASS}
                    aria-hidden
                >
                    <div className={NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_LINE_CLASS} />
                </div>

                <div className={cn(NEXIA_PREMIUM_MODAL_BODY_CLASS, bodyClassName)}>
                    {children}
                </div>

                {footer ? (
                    <footer className={NEXIA_PREMIUM_MODAL_FOOTER_CLASS}>
                        {footer}
                    </footer>
                ) : null}
            </div>
        </div>,
        portalTarget,
    );
};

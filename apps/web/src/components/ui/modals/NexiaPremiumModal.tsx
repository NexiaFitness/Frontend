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
    /** Bloquea cierre por backdrop/ESC mientras hay mutación en curso. */
    isLoading?: boolean;
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
    isLoading = false,
    showCloseButton = true,
    className,
    bodyClassName,
    descriptionClassName,
    "data-testid": dataTestId,
}) => {
    const shellRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    const blockClose = isLoading;
    // H10: el último onClose sin repetir el efecto. Antes el efecto dependía de onClose y,
    // con un onClose en línea, cada render del padre volvía a enfocar el marco y le quitaba
    // el foco al campo que se estaba escribiendo.
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEsc && !blockClose) {
                onCloseRef.current();
            }
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => document.removeEventListener("keydown", handleEscapeKey);
    }, [isOpen, closeOnEsc, blockClose]);

    useEffect(() => {
        if (!isOpen) return undefined;
        document.body.style.overflow = "hidden";
        // Foco inicial al abrir, salvo que un hijo ya lo tenga (p. ej. un buscador con autoFocus).
        const timer = setTimeout(() => {
            const shell = shellRef.current;
            if (shell && !shell.contains(document.activeElement)) shell.focus();
        }, 100);
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const portalTarget =
        typeof document !== "undefined" ? document.body : null;
    if (!portalTarget) return null;

    const handleBackdropClick = () => {
        if (closeOnBackdrop && !blockClose) {
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

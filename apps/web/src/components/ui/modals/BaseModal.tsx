/**
 * BaseModal - Modal base responsive y accesible
 *
 * Cambios v4.3.8:
 * - Añadida tipografía centralizada (TYPOGRAPHY.modalTitle / modalDescription).
 * - Todos los modales hijos heredan estilo tipográfico correcto automáticamente.
 *
 * Contexto:
 * - Responsive design (mobile/desktop).
 * - Accessibility (ESC, focus, aria-labels).
 * - Scroll locking y backdrop handling.
 *
 * @author Frontend Team
 * @since v4.2.0 - Base modal unificado
 * @updated v4.3.8 - Integración de Typography system
 */

import React, { useEffect, useRef } from "react";
import { TYPOGRAPHY } from "@/utils/typography";

export type ModalIconType = "warning" | "danger" | "info" | "success";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Content
    title: string;
    description?: string;
    children?: React.ReactNode;

    // Icon
    iconType?: ModalIconType;

    // Accessibility
    titleId?: string;
    descriptionId?: string;

    // Behavior
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    autoFocus?: boolean;
    isLoading?: boolean;
}

const iconConfig: Record<
    ModalIconType,
    { bgColor: string; iconColor: string; svg: React.ReactNode }
> = {
    danger: {
        bgColor: "bg-red-100",
        iconColor: "text-red-600",
        svg: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
            />
        ),
    },
    warning: {
        bgColor: "bg-amber-100",
        iconColor: "text-amber-600",
        svg: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
        ),
    },
    info: {
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        svg: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
    },
    success: {
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        svg: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        ),
    },
};

export const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    iconType,
    titleId = "modal-title",
    descriptionId = "modal-description",
    closeOnBackdrop = true,
    closeOnEsc = true,
    autoFocus = true,
    isLoading = false,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle ESC key and focus management
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen && closeOnEsc && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";

            if (autoFocus) {
                setTimeout(() => {
                    modalRef.current?.focus();
                }, 100);
            }
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, closeOnEsc, isLoading, onClose, autoFocus]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (closeOnBackdrop && !isLoading) {
            onClose();
        }
    };

    const icon = iconType ? iconConfig[iconType] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            <div
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[calc(100vw-2rem)] sm:max-w-md transform transition-all animate-in zoom-in-95 duration-200 focus:outline-none"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
            >
                <div className="p-4 sm:p-8">
                    {/* Icon */}
                    {icon && (
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div
                                className={`w-12 h-12 sm:w-16 sm:h-16 ${icon.bgColor} rounded-full flex items-center justify-center`}
                            >
                                <svg
                                    className={`w-6 h-6 sm:w-8 sm:h-8 ${icon.iconColor}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {icon.svg}
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Title + Description */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h3
                            id={titleId}
                            className={`${TYPOGRAPHY.modalTitle} text-gray-900 mb-2 sm:mb-3`}
                        >
                            {title}
                        </h3>
                        {description && (
                            <p
                                id={descriptionId}
                                className={`${TYPOGRAPHY.modalDescription} text-gray-600`}
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Custom Content */}
                    {children}
                </div>
            </div>
        </div>
    );
};

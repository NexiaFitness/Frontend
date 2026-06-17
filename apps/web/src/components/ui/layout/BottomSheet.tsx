/**
 * BottomSheet.tsx — Panel deslizante desde abajo (portal atleta móvil).
 * Contexto: UX-FE-01, patrón SidePanel (backdrop, ESC, a11y).
 * Contratos: DESIGN_MOBILE §3.5, agent.md
 * @author Frontend Team
 * @since v6.2.0
 */

import React, { useEffect, useId, useRef } from "react";

export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    /** Título visible en cabecera del sheet */
    title: string;
    children: React.ReactNode;
    /** Pie opcional fijo (CTA) */
    footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}) => {
    const titleId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
            sheetRef.current?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 motion-reduce:transition-none"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={sheetRef}
                tabIndex={-1}
                className={[
                    "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col",
                    "rounded-t-2xl border-t border-border bg-card shadow-2xl",
                    "transform transition-transform duration-300 ease-out motion-reduce:transition-none",
                ].join(" ")}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="flex shrink-0 flex-col items-center px-4 pb-2 pt-3">
                    <div
                        className="mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/40"
                        aria-hidden
                    />
                    <h2 id={titleId} className="w-full text-base font-semibold text-foreground">
                        {title}
                    </h2>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>

                {footer && (
                    <div className="shrink-0 border-t border-border px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};

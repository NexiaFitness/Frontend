/**
 * SidePanel.tsx — Panel lateral deslizante (drawer)
 *
 * Contexto:
 * - U4 paso 1.5: panel para detalle de plan desde cliente sin salir de clients/:id
 * - Patrón extraído de DashboardDrawer: backdrop, overlay, transición
 * - Tokens: panel-drawer (ancho desktop), bg-card, border-border, shadow-2xl
 *
 * Responsabilidades:
 * - Backdrop con cierre al hacer clic
 * - Panel deslizante desde la derecha
 * - Cierre con ESC
 * - Responsive: w-full móvil, w-panel-drawer desktop
 *
 * @author Frontend Team
 * @since U4 paso 1.5
 */

import React, { useEffect, useRef } from "react";

export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    /** Título para aria-label (accesibilidad) */
    ariaLabel: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
    isOpen,
    onClose,
    children,
    ariaLabel,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
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
                className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                className={`
                    fixed top-0 right-0 h-full z-50
                    w-full lg:w-panel-drawer
                    bg-card border-l border-border shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    flex flex-col overflow-hidden
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
            >
                {children}
            </div>
        </>
    );
};

/**
 * NavbarMobileTrigger — Botón hamburguesa para abrir/cerrar el drawer en móvil.
 *
 * Contexto: Reutilizable en navbar pública y dashboard. Solo presentación;
 * el estado del drawer lo controla el padre (onClick, isOpen).
 *
 * Notas: Accesible (ARIA, teclado). Icono cambia según isOpen (hamburguesa
 * vs. cruz). No incluye el drawer; solo el trigger.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import clsx from "clsx";

export interface NavbarMobileTriggerProps {
    onClick: () => void;
    isOpen: boolean;
    "aria-label": string;
    className?: string;
}

export const NavbarMobileTrigger: React.FC<NavbarMobileTriggerProps> = ({
    onClick,
    isOpen,
    "aria-label": ariaLabel,
    className,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            className={clsx(
                "flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3",
                "text-sidebar-foreground transition-colors",
                "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                "focus:outline-none focus:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                "-mr-3",
                className
            )}
        >
            <svg
                className="h-8 w-8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
            >
                {isOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                )}
            </svg>
        </button>
    );
};

/**
 * NavbarLogo — Logo NEXIA a la izquierda de la navbar, centrado en su contenedor.
 *
 * Contexto: Pieza reutilizable de la navbar unificada. Enlace a "/" que envuelve
 * NexiaLogoCompact; va en el slot izquierdo. Sin lógica de ruta ni auth.
 *
 * Notas: El logo debe ir "a la izquierda del todo" en su propio div, centrado
 * dentro de ese div. size="large" para dashboard (un poco más grande).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { NexiaLogoCompact } from "@/components/ui/branding/NexiaLogoCompact";

export type NavbarLogoSize = "default" | "large";

export interface NavbarLogoProps {
    size?: NavbarLogoSize;
    className?: string;
    /** Llamado cuando se hace clic en el enlace del logo (p. ej. cerrar drawer móvil). */
    onNavigate?: () => void;
}

const sizeClasses: Record<NavbarLogoSize, string> = {
    default: "w-36 sm:w-44 md:w-52",
    large: "w-40 sm:w-48 md:w-56",
};

export const NavbarLogo: React.FC<NavbarLogoProps> = ({
    size = "default",
    className,
    onNavigate,
}) => {
    return (
        <div
            className={clsx(
                "flex items-center justify-center shrink-0 py-0",
                className
            )}
            data-slot="navbar-logo"
        >
            <Link
                to="/"
                onClick={onNavigate}
                className="flex items-center justify-center hover:opacity-80 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
                aria-label="NEXIA Fitness - Ir al inicio"
            >
                <NexiaLogoCompact className={sizeClasses[size]} />
            </Link>
        </div>
    );
};

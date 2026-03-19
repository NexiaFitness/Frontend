/**
 * NavbarShell — Contenedor de la barra de navegación superior.
 *
 * Contexto: Base reutilizable para la navbar unificada (público y dashboard).
 * Aplica altura y fondo según variant; expone slots izquierdo y derecho para
 * logo, acciones y bloque de usuario.
 *
 * Notas: No contiene lógica de negocio; solo layout y tokens. En Fase 2/3
 * será usado por AppNavbar. No modificar heights sin revisar drawer/sidebar
 * que usan theme(space.navbar-*) en calc().
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import clsx from "clsx";

export type NavbarShellVariant = "public" | "dashboard";

export interface NavbarShellProps {
    variant: NavbarShellVariant;
    children: React.ReactNode;
    className?: string;
}

const heightClasses: Record<NavbarShellVariant, string> = {
    public: "h-navbar-mobile lg:h-navbar-desktop",
    dashboard: "h-navbar-dashboard-mobile lg:h-navbar-dashboard-desktop",
};

const backgroundClasses: Record<NavbarShellVariant, string> = {
    public: "bg-surface",
    dashboard: "bg-sidebar",
};

export const NavbarShell: React.FC<NavbarShellProps> = ({
    variant,
    children,
    className,
}) => {
    return (
        <nav
            className={clsx(
                "sticky top-0 z-50 border-b border-border",
                backgroundClasses[variant],
                heightClasses[variant],
                className
            )}
            role="navigation"
        >
            <div className="px-4 sm:px-6 lg:px-8 w-full h-full flex justify-between items-center py-0">
                {children}
            </div>
        </nav>
    );
};

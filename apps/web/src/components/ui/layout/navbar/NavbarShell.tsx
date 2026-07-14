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
import {
    NAVBAR_SHELL_BOTTOM_DIVIDER,
    NAVBAR_SHELL_INNER,
    navbarShellClass,
} from "./navbarPresentation";

export type NavbarShellVariant = "public" | "dashboard";

export interface NavbarShellProps {
    variant: NavbarShellVariant;
    children: React.ReactNode;
    className?: string;
}

export const NavbarShell: React.FC<NavbarShellProps> = ({
    variant,
    children,
    className,
}) => {
    return (
        <nav
            className={clsx(navbarShellClass(variant), className)}
            role="navigation"
        >
            <div className={NAVBAR_SHELL_INNER}>{children}</div>
            <div className={NAVBAR_SHELL_BOTTOM_DIVIDER} aria-hidden />
        </nav>
    );
};

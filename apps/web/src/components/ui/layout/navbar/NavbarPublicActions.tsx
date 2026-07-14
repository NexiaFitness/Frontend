/**
 * NavbarPublicActions — Enlaces de navegación pública (Iniciar sesión, Registrarse, etc.).
 *
 * Contexto: Pieza reutilizable de la navbar unificada para contexto público.
 * Usa usePublicNavigation con la ruta actual; solo presentación de links.
 *
 * Notas: Visible en desktop (hidden en móvil; el drawer muestra la navegación).
 * No contiene lógica de negocio; el hook en shared es la fuente de verdad.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@nexia/shared/hooks/usePublicNavigation";
import clsx from "clsx";
import { NAVBAR_PUBLIC_LINK } from "./navbarPresentation";

export interface NavbarPublicActionsProps {
    className?: string;
}

export const NavbarPublicActions: React.FC<NavbarPublicActionsProps> = ({
    className,
}) => {
    const location = useLocation();
    const { visibleNavigationItems } = usePublicNavigation({
        currentPath: location.pathname,
    });

    if (visibleNavigationItems.length === 0) {
        return null;
    }

    return (
        <div
            className={clsx("hidden md:flex items-center space-x-8", className)}
            role="navigation"
            aria-label="Navegación pública"
        >
            {visibleNavigationItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={NAVBAR_PUBLIC_LINK}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
};

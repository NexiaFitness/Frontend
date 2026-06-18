/**
 * NexiaSideMenu — Drawer lateral móvil para navegación pública.
 *
 * Contexto: Usado por AppNavbar en contexto público. Muestra ítems de usePublicNavigation
 * (Iniciar sesión, Registrarse, etc.). Sin cabecera con logo; el logo está en la navbar.
 *
 * Notas: Posicionado debajo de la navbar (top-navbar-mobile/desktop). Cierra al hacer clic
 * en overlay o en un enlace.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicNavigation } from "@nexia/shared";
import { SideMenuAccentRim } from "./SideMenuAccentRim";
import { SideMenuFooterBrand } from "./SideMenuFooterBrand";
import { NEXIA_SCROLLBAR } from "@/components/ui/layout/scrollPresentation";
import {
    SIDE_MENU_DIVIDER,
    SIDE_MENU_OVERLAY,
    SIDE_MENU_PANEL,
    SIDE_MENU_SECTION_LABEL,
    sideMenuLinkClass,
} from "./sideMenuPresentation";

interface NexiaSideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NexiaSideMenu: React.FC<NexiaSideMenuProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { visibleNavigationItems } = usePublicNavigation({
        currentPath: location.pathname,
    });

    const isActiveLink = (href: string) => location.pathname === href;

    return (
        <>
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${SIDE_MENU_OVERLAY} ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <div
                className={`
                    fixed
                    top-navbar-mobile lg:top-navbar-desktop
                    right-0
                    z-50
                    h-[calc(100vh-theme(space.navbar-mobile))]
                    w-full
                    transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    lg:h-[calc(100vh-theme(space.navbar-desktop))]
                    ${SIDE_MENU_PANEL}
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
                role="dialog"
                aria-modal="true"
                aria-label="Menú de navegación"
                aria-hidden={!isOpen}
            >
                <SideMenuAccentRim />
                <div className="flex h-full flex-col">
                    <nav className={`flex-1 overflow-y-auto px-6 pt-10 ${NEXIA_SCROLLBAR}`}>
                        <div>
                            <h3 className={`mb-4 ${SIDE_MENU_SECTION_LABEL}`}>Navegación</h3>
                            <div className={`mb-6 w-full ${SIDE_MENU_DIVIDER}`} />
                            <ul className="space-y-2">
                                {visibleNavigationItems.map(({ path, label }) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            onClick={onClose}
                                            className={sideMenuLinkClass(isActiveLink(path))}
                                        >
                                            <span>{label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    <div className="border-t border-border/40 p-6 pt-5">
                        <SideMenuFooterBrand />
                    </div>
                </div>
            </div>
        </>
    );
};

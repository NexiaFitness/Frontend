/**
 * DashboardDrawer — Drawer lateral móvil para el área dashboard.
 *
 * Contexto: Menú de navegación por ítems (menuItems) y bloque inferior con
 * usuario y logout. Sin cabecera con logo; el logo está en la navbar.
 * Usado por AppNavbar en contexto dashboard.
 *
 * Notas: Posicionado debajo de la navbar (top-navbar-dashboard-mobile).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoutButton } from "@/components/ui/buttons";

export interface DashboardDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: Array<{ label: string; path: string }>;
    footerSubtitle?: string;
    user: {
        nombre?: string;
        apellidos?: string;
    } | null;
}

export const DashboardDrawer: React.FC<DashboardDrawerProps> = ({
    isOpen,
    onClose,
    menuItems,
    user,
    footerSubtitle = "Professional Trainer",
}) => {
    const location = useLocation();
    const isActiveLink = (href: string) => location.pathname === href;

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`
                    fixed
                    top-navbar-dashboard-mobile lg:top-navbar-dashboard-desktop
                    right-0
                    w-full
                    h-[calc(100vh-theme(space.navbar-dashboard-mobile))]
                    lg:h-[calc(100vh-theme(space.navbar-dashboard-desktop))]
                    z-50 transform transition-transform duration-500 ease-in-out
                    bg-sidebar
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
                role="dialog"
                aria-modal="true"
                aria-label="Menú de navegación"
            >
                <div className="flex flex-col h-full">
                    <nav className="flex-1 overflow-y-auto pt-8 px-6">
                        <ul className="space-y-2">
                            {menuItems.map(({ path, label }) => (
                                <li key={path}>
                                    <Link
                                        to={path}
                                        onClick={onClose}
                                        className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                                            isActiveLink(path)
                                                ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        }`}
                                    >
                                        <span className="text-lg">{label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="px-6 pb-6">
                        <div className="mb-6 pt-6 border-t border-sidebar-border">
                            <div className="mb-4 text-center">
                                <p className="font-medium text-sidebar-foreground">
                                    {user?.nombre} {user?.apellidos}
                                </p>
                                <p className="text-sm text-sidebar-foreground/70">{footerSubtitle}</p>
                            </div>
                            <LogoutButton
                                variant="secondary"
                                confirmationRequired={true}
                                showUserName={false}
                                className="w-full bg-surface-2 text-sm hover:bg-surface-2/80"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

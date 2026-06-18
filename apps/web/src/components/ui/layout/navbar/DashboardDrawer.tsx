/**
 * DashboardDrawer.tsx — Drawer lateral móvil dashboard (entrenador/admin/atleta desktop shell).
 * Paridad visual con NexiaSideMenu: glass, rim cyan, divisores premium.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoutButton } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { NEXIA_DIVIDER_STRONG } from "@/components/ui/surface/nexiaDividerPresentation";
import { NEXIA_SCROLLBAR } from "@/components/ui/layout/scrollPresentation";
import { cn } from "@/lib/utils";
import {
    SIDE_MENU_OVERLAY,
    SIDE_MENU_PANEL,
    SIDE_MENU_SECTION_LABEL,
    sideMenuLinkClass,
} from "./sideMenuPresentation";

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
    const isActiveLink = (href: string) => {
        if (
            href === "/dashboard/sessions" &&
            (
                location.pathname.startsWith("/dashboard/session-programming") ||
                location.pathname.startsWith("/dashboard/standalone-sessions")
            )
        ) {
            return true;
        }
        if (href === "/dashboard") {
            return location.pathname === "/dashboard";
        }
        return location.pathname === href || location.pathname.startsWith(`${href}/`);
    };

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-40 transition-opacity duration-300",
                    SIDE_MENU_OVERLAY,
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onClose}
                aria-hidden={!isOpen}
            />
            <div
                className={cn(
                    "fixed right-0 z-50 flex h-[calc(100vh-theme(space.navbar-dashboard-mobile))] w-full flex-col",
                    "transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "lg:h-[calc(100vh-theme(space.navbar-dashboard-desktop))]",
                    "top-navbar-dashboard-mobile lg:top-navbar-dashboard-desktop",
                    SIDE_MENU_PANEL,
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Menú de navegación"
                aria-hidden={!isOpen}
            >
                <NexiaGlassAccentRim />
                <nav className={cn("flex-1 overflow-y-auto px-6 pt-10", NEXIA_SCROLLBAR)}>
                    <h3 className={`mb-3 ${SIDE_MENU_SECTION_LABEL}`}>Navegación</h3>
                    <NexiaPremiumDivider className="mb-6 w-full" />
                    <ul className="space-y-2">
                        {menuItems.map(({ path, label }, index) => (
                            <li key={`${path}-${label}-${index}`}>
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
                </nav>

                <div className="relative border-t border-border/40 p-6 pt-5">
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
                        aria-hidden
                    >
                        <div className={cn("mx-6", NEXIA_DIVIDER_STRONG)} />
                    </div>
                    <div className="space-y-4 pt-2 text-center">
                        <div>
                            <p className="font-medium text-foreground">
                                {user?.nombre} {user?.apellidos}
                            </p>
                            <p className="text-sm text-muted-foreground">{footerSubtitle}</p>
                        </div>
                        <LogoutButton
                            variant="secondary"
                            confirmationRequired
                            showUserName={false}
                            className="min-h-touch-athlete w-full text-sm"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

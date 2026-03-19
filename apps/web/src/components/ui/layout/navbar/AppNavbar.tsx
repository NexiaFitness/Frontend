/**
 * AppNavbar — Orquestador de la navbar unificada (público y dashboard).
 *
 * Contexto: Componente de composición/presentación. La variante es siempre explícita
 * y la decide el layout (PublicLayout o DashboardShell). Compone NavbarShell,
 * NavbarLogo, NavbarPublicActions o NavbarUserBlock, NavbarMobileTrigger y el drawer
 * correspondiente (NexiaSideMenu en público, DashboardDrawer en dashboard).
 *
 * Notas: No infiere contexto por ruta ni auth. useSelector solo para obtener user
 * en rama dashboard (datos de presentación para NavbarUserBlock y DashboardDrawer).
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated Consolidación: variante explícita obligatoria (layout decide contexto)
 */

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavbarShell } from "./NavbarShell";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarPublicActions } from "./NavbarPublicActions";
import { NavbarUserBlock } from "./NavbarUserBlock";
import { NavbarMobileTrigger } from "./NavbarMobileTrigger";
import { NexiaSideMenu } from "./NexiaSideMenu";
import { DashboardDrawer } from "./DashboardDrawer";
import type { RootState } from "@nexia/shared/store";

export interface AppNavbarProps {
    /** Variante obligatoria; decidida por el layout que monta AppNavbar. */
    variant: "public" | "dashboard";
    /** Items del menú dashboard (solo en variante dashboard). */
    menuItems?: Array<{ label: string; path: string }>;
    /** Subtítulo del footer del drawer dashboard (solo en variante dashboard). */
    footerSubtitle?: string;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
    variant,
    menuItems = [],
    footerSubtitle,
}) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    if (variant === "dashboard") {
        return (
            <>
                <NavbarShell variant="dashboard">
                    <NavbarLogo size="large" onNavigate={closeMobileMenu} />
                    <div className="flex items-center gap-4">
                        <NavbarUserBlock user={user} />
                        <div className="md:hidden">
                            <NavbarMobileTrigger
                                onClick={toggleMobileMenu}
                                isOpen={isMobileMenuOpen}
                                aria-label="Abrir menú"
                            />
                        </div>
                    </div>
                </NavbarShell>
                <DashboardDrawer
                    isOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                    menuItems={menuItems}
                    user={user}
                    footerSubtitle={footerSubtitle}
                />
            </>
        );
    }

    return (
        <>
            <NavbarShell variant="public">
                <NavbarLogo size="default" onNavigate={closeMobileMenu} />
                <div className="flex items-center">
                    <NavbarPublicActions />
                    <div className="md:hidden">
                        <NavbarMobileTrigger
                            onClick={toggleMobileMenu}
                            isOpen={isMobileMenuOpen}
                            aria-label="Abrir menú"
                        />
                    </div>
                </div>
            </NavbarShell>
            <NexiaSideMenu
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
            />
        </>
    );
};

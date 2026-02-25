/**
 * DashboardSidebar.tsx — Sidebar lateral unificado para el área dashboard
 *
 * Contexto:
 * - Navegación lateral única por rol (trainer, admin, athlete).
 * - Visible solo en desktop (hidden lg:flex).
 * - Recibe menuItems, headerTitle, footerSubtitle desde DashboardShell.
 *
 * Notas de mantenimiento:
 * - Iconos lucide-react h-5 w-5 shrink-0.
 * - Tokens: bg-sidebar, text-sidebar-foreground, border-sidebar-border.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Fase 2a)
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { LogoutButton } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { RootState } from "@nexia/shared/store";
import type { NavigationItem } from "@/config/navigationByRole";

export interface DashboardSidebarProps {
    menuItems: NavigationItem[];
    headerTitle: string;
    footerSubtitle: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    menuItems,
    headerTitle: _headerTitle,
    footerSubtitle,
}) => {
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="hidden lg:flex fixed left-0 top-navbar-dashboard-desktop h-[calc(100vh-theme(space.navbar-dashboard-desktop))] w-80 flex-col z-10 bg-sidebar border-r border-sidebar-border">
            <div className="flex-1 flex flex-col min-h-0">
                <nav className="flex-1 overflow-y-auto p-6 border-b border-sidebar-border space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                                    active
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 pt-6 pb-6 shrink-0">
                    <div className="text-center mb-6">
                        <p className="text-sidebar-foreground font-medium">
                            {user?.nombre} {user?.apellidos}
                        </p>
                        <p className="text-sidebar-foreground/70 text-sm">{footerSubtitle}</p>
                    </div>
                    <div className="px-4">
                        <LogoutButton
                            variant="secondary"
                            confirmationRequired={true}
                            showUserName={false}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

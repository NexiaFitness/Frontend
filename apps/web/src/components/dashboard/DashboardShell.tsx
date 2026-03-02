/**
 * DashboardShell.tsx — Layout raíz del área dashboard
 *
 * Contexto:
 * - Chrome centralizado: sidebar (desktop) + navbar (móvil) + Outlet.
 * - Lee user.role del store; obtiene menuItems y metadatos desde getNavigationForRole.
 * - Incluye overlays de loading y error de auth (reubicados desde DashboardLayout).
 * - Estado sidebarCollapsed controla ancho del sidebar y margen del main (Fase 1).
 * - onToggleClick para toggle en tablet/touch (Fase 3).
 *
 * Notas de mantenimiento:
 * - Main: lg:ml-sidebar-collapsed | lg:ml-sidebar-expanded (tokens), transition-all duration-300, min-w-0.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Sidebar colapsable Fase 4)
 */

import React, { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardSidebar } from "./DashboardSidebar";
import { AppNavbar } from "@/components/ui/layout/navbar/AppNavbar";
import { getNavigationForRole } from "@/config/navigationByRole";
import { cn } from "@/lib/utils";
import type { RootState } from "@nexia/shared/store";

export const DashboardShell: React.FC = () => {
    const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
    const nav = getNavigationForRole(user?.role);
    const menuItems = nav.menuItems.map(({ label, path }) => ({ label, path }));
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    const onHoverExpand = useCallback(() => setSidebarCollapsed(false), []);
    const onHoverCollapse = useCallback(() => setSidebarCollapsed(true), []);
    const onToggleClick = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

    return (
        <div className="min-h-screen w-full bg-background">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
                        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="font-medium text-foreground">Cerrando sesión...</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Procesando logout de forma segura
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed top-4 right-4 z-50 rounded-lg border border-destructive bg-destructive/10 p-4 shadow-lg">
                    <p className="text-sm font-medium text-destructive">Error durante logout</p>
                    <p className="mt-1 text-xs text-destructive/90">{error}</p>
                </div>
            )}

            <AppNavbar
                variant="dashboard"
                menuItems={menuItems}
                footerSubtitle={nav.footerSubtitle}
            />

            <DashboardSidebar
                menuItems={nav.menuItems}
                headerTitle={nav.headerTitle}
                footerSubtitle={nav.footerSubtitle}
                isCollapsed={sidebarCollapsed}
                onHoverExpand={onHoverExpand}
                onHoverCollapse={onHoverCollapse}
                onToggleClick={onToggleClick}
            />

            <main
                className={cn(
                    "min-h-screen min-w-0 overflow-y-auto px-6 pb-8 pt-7 transition-all duration-200 ease-in-out",
                    sidebarCollapsed ? "lg:ml-sidebar-collapsed" : "lg:ml-sidebar-expanded"
                )}
            >
                <Outlet />
            </main>
        </div>
    );
};

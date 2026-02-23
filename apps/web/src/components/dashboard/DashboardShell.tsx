/**
 * DashboardShell.tsx — Layout raíz del área dashboard
 *
 * Contexto:
 * - Chrome centralizado: sidebar (desktop) + navbar (móvil) + Outlet.
 * - Lee user.role del store; obtiene menuItems y metadatos desde getNavigationForRole.
 * - Incluye overlays de loading y error de auth (reubicados desde DashboardLayout).
 *
 * Notas de mantenimiento:
 * - bg-background (tokens Sparkle); no meshGradientInverted.
 * - Overlays con tokens (border-primary, bg-destructive/10).
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Fase 2a)
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";
import { getNavigationForRole } from "@/config/navigationByRole";
import type { RootState } from "@nexia/shared/store";

export const DashboardShell: React.FC = () => {
    const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
    const nav = getNavigationForRole(user?.role);
    const menuItems = nav.menuItems.map(({ label, path }) => ({ label, path }));

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

            <DashboardSidebar
                menuItems={nav.menuItems}
                headerTitle={nav.headerTitle}
                footerSubtitle={nav.footerSubtitle}
            />

            <DashboardNavbar
                menuItems={menuItems}
                footerSubtitle={nav.footerSubtitle}
            />

            <main className="pt-8 pb-16 min-h-screen md:pt-10 lg:ml-80 lg:pt-12">
                <Outlet />
            </main>
        </div>
    );
};

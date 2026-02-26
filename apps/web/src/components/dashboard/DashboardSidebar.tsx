/**
 * DashboardSidebar.tsx — Sidebar lateral colapsable para el área dashboard
 *
 * Contexto:
 * - Navegación lateral única por rol (trainer, admin, athlete).
 * - Visible solo en desktop (hidden lg:flex).
 * - Recibe menuItems, headerTitle, footerSubtitle desde DashboardShell.
 * - Estado colapsado/expandido controlado por prop isCollapsed (Fase 1).
 * - Hover expande, mouse leave colapsa con debounce 200ms (Fase 2).
 * - Toggle para tablet/touch cuando no hay soporte hover (Fase 3).
 * - Prefetch de rutas lazy en hover/focus (BUILD_WARNINGS_ANALYSIS.md Fase 3).
 *
 * Diseño: docs/specs/SIDE_MENU_SPEC.md — colores surface/border/primary/accent,
 * animaciones 200ms, paddings py-4 px-2, ítems px-3 py-2.5, footer p-3.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Sidebar colapsable Fase 4)
 * @updated v5.x - Especificación de diseño unificada
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLogout } from "@nexia/shared";
import { LogoutConfirmationModal } from "@/components/auth/modals/LogoutConfirmationModal";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/utils/routePrefetch";
import type { RootState } from "@nexia/shared/store";
import type { NavigationItem } from "@/config/navigationByRole";

export interface DashboardSidebarProps {
    menuItems: NavigationItem[];
    headerTitle: string;
    footerSubtitle: string;
    isCollapsed: boolean;
    onHoverExpand?: () => void;
    onHoverCollapse?: () => void;
    onToggleClick?: () => void;
}

const COLLAPSE_DELAY_MS = 200;

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    menuItems,
    headerTitle: _headerTitle,
    footerSubtitle,
    isCollapsed,
    onHoverExpand,
    onHoverCollapse,
    onToggleClick,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [hasHover, setHasHover] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const { logout, isLoading, error } = useLogout({
        onSuccess: () => setShowLogoutModal(false),
        onError: () => setShowLogoutModal(false),
        onNavigate: (path) => navigate(path, { replace: true }),
    });

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const mql = window.matchMedia("(hover: hover)");
        setHasHover(mql.matches);

        const handler = (e: MediaQueryListEvent) => setHasHover(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        return () => {
            if (collapseTimeoutRef.current !== null) {
                clearTimeout(collapseTimeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        if (collapseTimeoutRef.current !== null) {
            clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }
        onHoverExpand?.();
    };

    const handleMouseLeave = () => {
        collapseTimeoutRef.current = setTimeout(() => {
            collapseTimeoutRef.current = null;
            onHoverCollapse?.();
        }, COLLAPSE_DELAY_MS);
    };

    const handlePrefetch = useCallback(
        (path: string) => {
            prefetchRoute(path, user?.role);
        },
        [user?.role]
    );

    return (
        <aside
            className={cn(
                "hidden lg:flex fixed left-0 top-navbar-dashboard-desktop h-[calc(100vh-theme(space.navbar-dashboard-desktop))] shrink-0 flex-col z-10 bg-surface border-r border-border overflow-hidden transition-all duration-200 ease-in-out",
                isCollapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
            )}
            onMouseEnter={hasHover ? handleMouseEnter : undefined}
            onMouseLeave={hasHover ? handleMouseLeave : undefined}
        >
            {!hasHover && onToggleClick && (
                <button
                    type="button"
                    onClick={onToggleClick}
                    aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                    className={cn(
                        "shrink-0 flex items-center justify-center w-full h-12 border-b border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                        isCollapsed ? "p-2" : "p-4"
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 shrink-0" />
                    ) : (
                        <ChevronLeft className="h-5 w-5 shrink-0" />
                    )}
                </button>
            )}
            <div className="flex-1 flex flex-col min-h-0">
                <nav
                    className={cn(
                        "flex-1 overflow-y-auto flex flex-col gap-1 py-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        !isCollapsed && "border-b border-border"
                    )}
                >
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                aria-label={isCollapsed ? item.label : undefined}
                                aria-current={active ? "page" : undefined}
                                onMouseEnter={() => handlePrefetch(item.path)}
                                onFocus={() => handlePrefetch(item.path)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm transition-colors duration-150",
                                    isCollapsed ? "justify-center" : "",
                                    active
                                        ? "border-l-primary bg-primary/10 text-primary"
                                        : "border-l-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="shrink-0 border-t border-border p-3 min-h-[3.75rem]">
                    <div className="flex items-start gap-3">
                        <div
                            className="h-8 w-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium"
                            title={user ? `${user.nombre} ${user.apellidos}` : undefined}
                        >
                            {user?.nombre?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 flex flex-col gap-0">
                                <p className="text-sm text-foreground truncate mb-0">
                                    {user?.nombre} {user?.apellidos}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutModal(true)}
                                    className="text-[10px] text-destructive hover:text-destructive/90 underline truncate w-full text-left bg-transparent border-0 p-0 cursor-pointer font-normal"
                                >
                                    Cerrar sesión →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LogoutConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={() => logout()}
                onCancel={() => setShowLogoutModal(false)}
                isLoading={isLoading}
                userName={user ? `${user.nombre} ${user.apellidos}`.trim() : undefined}
            />

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
        </aside>
    );
};

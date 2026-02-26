/**
 * DashboardSidebar.tsx — Sidebar lateral colapsable para el área dashboard
 *
 * Contexto:
 * - Navegación lateral única por rol (trainer, admin, athlete).
 * - Visible solo en desktop (hidden lg:flex).
 * - Recibe menuItems, headerTitle, footerSubtitle desde DashboardShell.
 * - Estado colapsado/expandido controlado por prop isCollapsed (Fase 1).
 * - Hover expande, mouse leave colapsa con debounce 180ms (Fase 2).
 * - Toggle para tablet/touch cuando no hay soporte hover (Fase 3).
 * - Prefetch de rutas lazy en hover/focus (BUILD_WARNINGS_ANALYSIS.md Fase 3).
 *
 * Notas de mantenimiento:
 * - Iconos lucide-react h-5 w-5 shrink-0.
 * - Tokens: sidebar-collapsed (56px), sidebar-expanded (220px).
 * - overflow-hidden en aside evita labels cortados durante transición.
 * - Debounce con useRef; clearTimeout en onMouseEnter antes de expandir.
 * - matchMedia('(hover: hover)') para detectar soporte hover; toggle solo si !hasHover.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Sidebar colapsable Fase 4)
 * @updated v5.x - Fase 3: prefetch route on hover/focus
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LogoutButton } from "@/components/ui/buttons";
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

const COLLAPSE_DELAY_MS = 180;

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
    const { user } = useSelector((state: RootState) => state.auth);
    const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [hasHover, setHasHover] = useState(true);

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
                "hidden lg:flex fixed left-0 top-navbar-dashboard-desktop h-[calc(100vh-theme(space.navbar-dashboard-desktop))] flex-col z-10 bg-sidebar border-r border-sidebar-border overflow-hidden transition-all duration-300",
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
                        "shrink-0 flex items-center justify-center w-full h-12 border-b border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
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
                        "flex-1 overflow-y-auto border-b border-sidebar-border space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        isCollapsed ? "p-2 flex flex-col items-center" : "p-6"
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
                                    "flex items-center rounded-lg transition-colors",
                                    isCollapsed
                                        ? "justify-center p-3 w-full"
                                        : "gap-3 px-4 py-3",
                                    active
                                        ? "bg-primary/20 text-primary font-semibold"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    className={cn(
                        "shrink-0 border-t border-sidebar-border",
                        isCollapsed ? "p-2 flex flex-col items-center" : "p-6 pt-6 pb-6"
                    )}
                >
                    {isCollapsed ? (
                        <div
                            className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm shrink-0"
                            title={user ? `${user.nombre} ${user.apellidos}` : undefined}
                        >
                            {user?.nombre?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};

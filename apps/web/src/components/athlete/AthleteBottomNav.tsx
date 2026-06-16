/**
 * AthleteBottomNav.tsx — Navegación inferior móvil portal atleta.
 * Contexto: portal atleta F0, DESIGN_MOBILE §3.3
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, ClipboardList, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
    { to: "/dashboard/sessions", label: "Sesiones", icon: Calendar, end: false },
    { to: "/dashboard/my-plan", label: "Mi plan", icon: ClipboardList, end: false },
    { to: "/dashboard/account", label: "Cuenta", icon: User, end: false },
] as const;

export const AthleteBottomNav: React.FC = () => {
    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
            aria-label="Navegación principal atleta"
        >
            <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                    <li key={to} className="flex flex-1">
                        <NavLink
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    "flex min-h-touch-athlete flex-1 flex-col items-center justify-center gap-0.5 px-1 text-caption transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )
                            }
                        >
                            <Icon className="size-5 shrink-0" aria-hidden />
                            <span>{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

/**
 * AthleteBottomNav.tsx — Navegación inferior móvil portal atleta (4 tabs).
 * Contexto: portal atleta F0, DESIGN_MOBILE §3.3 — Notas vía campana/sheet, no tab duplicado.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, ClipboardList, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_CHROME_BAR,
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
} from "@/components/athlete/layout/athleteLayoutClasses";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
    { to: "/dashboard/sessions", label: "Sesiones", icon: Calendar, end: false },
    { to: "/dashboard/my-plan", label: "Plan", icon: ClipboardList, end: false },
    { to: "/dashboard/account", label: "Cuenta", icon: User, end: false },
] as const;

export const AthleteBottomNav: React.FC = () => {
    return (
        <nav
            className={cn(
                ATHLETE_CHROME_BAR,
                "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
            )}
            aria-label="Navegación principal atleta"
        >
            <div className={ATHLETE_CHROME_BAR_TOP_DIVIDER} aria-hidden />
            <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
                {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                    <li key={to} className="flex flex-1">
                        <NavLink
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    "flex min-h-touch-athlete flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium leading-tight transition-colors sm:text-caption",
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

/**
 * AthleteBottomNav.tsx — Navegación inferior móvil portal atleta.
 * Contexto: portal atleta F0; alineado con navigationByRole ATHLETE_NAV (AG-2 agenda).
 */

import React from "react";
import { NavLink } from "react-router-dom";
import {
    CalendarDays,
    ClipboardList,
    LayoutDashboard,
    Play,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_CHROME_BAR,
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
} from "@/components/athlete/layout/athleteLayoutClasses";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
    { to: "/dashboard/agenda", label: "Mi agenda", icon: CalendarDays, end: false },
    { to: "/dashboard/sessions", label: "Sesiones", icon: Play, end: false },
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
                    <li key={to} className="flex flex-1 min-w-0">
                        <NavLink
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                cn(
                                    "flex min-h-touch-athlete flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-medium leading-tight transition-colors xs:text-[10px] sm:text-caption",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )
                            }
                        >
                            <Icon className="size-5 shrink-0" aria-hidden />
                            <span className="max-w-full truncate text-center">{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

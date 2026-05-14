/**
 * navigationByRole.ts — Configuración centralizada de navegación por rol
 *
 * Contexto:
 * - Fuente única de verdad para menús del dashboard (sidebar, navbar drawer).
 * - Cada rol tiene menuItems, headerTitle y footerSubtitle.
 * - Iconos lucide-react por item.
 *
 * Notas de mantenimiento:
 * - Solo incluir rutas existentes en App.tsx.
 * - Admin/Athlete: rutas /dashboard/users, /dashboard/my-plan, etc. se añaden
 *   cuando existan en el router.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Fase 2a)
 */

import type { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    Dumbbell,
    User,
    BarChart3,
    Bell,
    Play,
} from "lucide-react";

export interface NavigationItem {
    label: string;
    path: string;
    icon: LucideIcon;
}

export interface RoleNavigation {
    menuItems: NavigationItem[];
    headerTitle: string;
    footerSubtitle: string;
}

const TRAINER_NAV: RoleNavigation = {
    headerTitle: "Trainer Dashboard",
    footerSubtitle: "Professional Trainer",
    menuItems: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Clientes", path: "/dashboard/clients", icon: Users },
        { label: "Planificación", path: "/dashboard/training-plans", icon: ClipboardList },
        { label: "Agenda", path: "/dashboard/scheduling", icon: Calendar },
        { label: "Sesiones", path: "/dashboard/sessions", icon: Play },
        { label: "Ejercicios", path: "/dashboard/exercises", icon: Dumbbell },
        { label: "Analítica", path: "/dashboard/reports/generate", icon: BarChart3 },
        { label: "Alertas", path: "/dashboard", icon: Bell },
        { label: "Mi cuenta", path: "/dashboard/account", icon: User },
    ],
};

const ADMIN_NAV: RoleNavigation = {
    headerTitle: "Admin Panel",
    footerSubtitle: "System Administrator",
    menuItems: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Mi cuenta", path: "/dashboard/account", icon: User },
    ],
};

const ATHLETE_NAV: RoleNavigation = {
    headerTitle: "Mi Entrenamiento",
    footerSubtitle: "Athlete",
    menuItems: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Mi cuenta", path: "/dashboard/account", icon: User },
    ],
};

/**
 * Devuelve la configuración de navegación según el rol del usuario.
 */
export function getNavigationForRole(role: string | undefined): RoleNavigation {
    switch (role) {
        case "admin":
            return ADMIN_NAV;
        case "trainer":
            return TRAINER_NAV;
        case "athlete":
            return ATHLETE_NAV;
        default:
            return TRAINER_NAV;
    }
}

/** Re-export para compatibilidad con trainerNavigation.ts */
export const TRAINER_MENU_ITEMS = TRAINER_NAV.menuItems.map(({ label, path }) => ({ label, path }));

/**
 * useRoleNavigation.ts
 * -----------------------------------------------------
 * Cross-platform navigation hook based on user roles.
 * Works for both web (React Router) and mobile (React Navigation).
 * 
 * @scope Shared navigation logic (cross-platform)
 * @author NEXIA
 * @since v2.3.0
 */

import { useRoleGuard } from "./useRoleGuard";
import { USER_ROLES } from "@nexia/shared/utils/roles";

export const useRoleNavigation = () => {
    const { user, role, isAuthenticated } = useRoleGuard("dashboard");

    const getDefaultRoute = (): string => {
        if (!isAuthenticated || !role) return "/auth/login";
        
        switch (role) {
            case USER_ROLES.ADMIN:
                return "/dashboard";
            case USER_ROLES.TRAINER:
                return "/dashboard";
            case USER_ROLES.ATHLETE:
                return "/dashboard";
            default:
                return "/auth/login";
        }
    };

    const getRoleSpecificRoutes = () => {
        if (!role) return [];

        switch (role) {
            case USER_ROLES.ADMIN:
                return [
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/dashboard/users", label: "Usuarios" },
                    { path: "/dashboard/trainers", label: "Entrenadores" },
                    { path: "/dashboard/system", label: "Sistema" },
                ];
            case USER_ROLES.TRAINER:
                return [
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/dashboard/clients", label: "Clientes" },
                    { path: "/dashboard/plans", label: "Planes" },
                    { path: "/dashboard/complete-profile", label: "Completar Perfil" },
                ];
            case USER_ROLES.ATHLETE:
                return [
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/dashboard/my-plan", label: "Mi Plan" },
                    { path: "/dashboard/sessions", label: "Sesiones" },
                    { path: "/dashboard/progress", label: "Progreso" },
                ];
            default:
                return [];
        }
    };

    const canAccessRoute = (route: string): boolean => {
        if (!role) return false;

        const roleRoutes = getRoleSpecificRoutes();
        return roleRoutes.some(r => r.path === route);
    };

    return {
        user,
        role,
        isAuthenticated,
        getDefaultRoute,
        getRoleSpecificRoutes,
        canAccessRoute,
    };
};

/**
 * useRoleGuard.ts
 * -----------------------------------------------------
 * Shared React hook for role-based access logic.
 * Used by both web and mobile apps.
 *
 * @scope Shared logic (Redux + role guard integration)
 * @author NEXIA
 * @since v2.3.0
 */

import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { canAccess, USER_ROLES } from "@nexia/shared/utils/roles";

export const useRoleGuard = (feature: string) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);

    // Durante la hidratación, no considerar como no autenticado
    const isAuthenticated = Boolean(user) || isLoading;
    const role = user?.role;

    const hasAccess = canAccess(role, feature);
    const isAdmin = role === USER_ROLES.ADMIN;
    const isTrainer = role === USER_ROLES.TRAINER;
    const isAthlete = role === USER_ROLES.ATHLETE;

    return {
        user,
        role,
        isAuthenticated,
        hasAccess,
        isAdmin,
        isTrainer,
        isAthlete,
    };
};

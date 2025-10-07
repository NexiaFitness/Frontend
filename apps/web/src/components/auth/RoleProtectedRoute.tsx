/**
 * RoleProtectedRoute.tsx
 * -----------------------------------------------------
 * Web-specific role-based route protection component.
 * Uses React Router for web navigation.
 * 
 * @scope Web-specific UI logic (React Router)
 * @author NEXIA
 * @since v2.3.0
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useRoleGuard } from "shared";

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

/**
 * RoleProtectedRoute - Web-specific role-based protection
 * 
 * Usage:
 * <RoleProtectedRoute allowedRoles={['trainer']}>
 *   <CompleteProfile />
 * </RoleProtectedRoute>
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
    children,
    allowedRoles,
    redirectTo = "/dashboard"
}) => {
    const { role, isAuthenticated } = useRoleGuard("dashboard");

    // Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check if user role is in allowed roles
    const hasRoleAccess = role && allowedRoles.includes(role);

    if (!hasRoleAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

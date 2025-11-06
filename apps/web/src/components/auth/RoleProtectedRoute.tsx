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
import { useSelector } from "react-redux";
import { useRoleGuard } from "@nexia/shared/hooks/useRoleGuard";
import type { RootState } from "@nexia/shared/store";

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
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);


    // Durante la hidratación, mostrar loading o esperar
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

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

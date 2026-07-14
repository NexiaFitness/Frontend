/**
 * SessionsRouteSwitcher.tsx — /dashboard/sessions por rol.
 * Atleta → AthleteSessionsPage; entrenador/admin → SessionsPage.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { AthleteSessionsPage } from "@/pages/dashboard/athlete/AthleteSessionsPage";
import { SessionsPage } from "@/pages/sessions/SessionsPage";
import type { RootState } from "@nexia/shared/store";
import { USER_ROLES } from "@nexia/shared/utils/roles";

export const SessionsRouteSwitcher: React.FC = () => {
    const role = useSelector((state: RootState) => state.auth.user?.role);

    if (role === USER_ROLES.ATHLETE) {
        return <AthleteSessionsPage />;
    }

    if (role === USER_ROLES.TRAINER || role === USER_ROLES.ADMIN) {
        return (
            <RoleProtectedRoute
                allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}
                redirectTo="/dashboard"
            >
                <SessionsPage />
            </RoleProtectedRoute>
        );
    }

    return <Navigate to="/dashboard" replace />;
};

/**
 * SessionOrPublicLayout.tsx — Shell de Créditos según haya sesión.
 *
 * Sin sesión, el layout público. Con sesión, el mismo shell del rol
 * (DashboardShell), para no sacar al usuario del dashboard.
 */

import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { PublicLayout } from "@/components/ui/layout/PublicLayout";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AthleteOnboardingGate } from "@/components/auth/AthleteOnboardingGate";

export const SessionOrPublicLayout: React.FC = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    if (!isAuthenticated) return <PublicLayout />;

    return (
        <ProtectedRoute>
            <AthleteOnboardingGate>
                <DashboardShell />
            </AthleteOnboardingGate>
        </ProtectedRoute>
    );
};

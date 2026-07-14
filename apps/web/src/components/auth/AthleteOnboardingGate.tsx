/**
 * AthleteOnboardingGate — redirige atletas sin onboarding completado.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCurrentClientProfileQuery } from "@nexia/shared/api/clientsApi";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import type { RootState } from "@nexia/shared/store";
import { LoadingSpinner } from "@/components/ui/feedback";

interface AthleteOnboardingGateProps {
    children: React.ReactNode;
}

export const AthleteOnboardingGate: React.FC<AthleteOnboardingGateProps> = ({ children }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const isAthlete = user?.role === USER_ROLES.ATHLETE;
    const onOnboardingRoute = location.pathname.startsWith("/onboarding/athlete");

    const { data: profile, isLoading, isFetching } = useGetCurrentClientProfileQuery(undefined, {
        skip: !isAthlete,
    });

    if (!isAthlete) {
        return <>{children}</>;
    }

    if (isLoading || isFetching) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center" role="status">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const onboardingComplete = Boolean(profile?.onboarding_completed_at);

    if (!onboardingComplete && !onOnboardingRoute) {
        return <Navigate to="/onboarding/athlete" replace />;
    }

    if (onboardingComplete && onOnboardingRoute) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

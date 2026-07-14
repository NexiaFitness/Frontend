/**
 * AthleteMobileSuspenseFallback.tsx — Fallback Suspense móvil atleta (UX-FE-05).
 * Evita LoadingSpinner full-page al cargar chunks lazy en rutas atleta `< lg`.
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { athleteSkeletonVariantFromPath } from "@/components/athlete/athleteSkeletonRoutes";
import { AthletePageSkeleton } from "@/components/athlete/AthletePageSkeleton";
import { LoadingSpinner } from "@/components/ui/feedback";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import type { RootState } from "@nexia/shared/store";
import { USER_ROLES } from "@nexia/shared/utils/roles";

function centeredSpinner() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
            <LoadingSpinner size="lg" />
        </div>
    );
}

export const AthleteMobileSuspenseFallback: React.FC = () => {
    const { pathname } = useLocation();
    const isDesktop = useIsAthleteDesktopLayout();
    const role = useSelector((state: RootState) => state.auth.user?.role);

    if (role === USER_ROLES.ATHLETE && !isDesktop) {
        const variant = athleteSkeletonVariantFromPath(pathname);
        return <AthletePageSkeleton variant={variant} />;
    }

    return centeredSpinner();
};

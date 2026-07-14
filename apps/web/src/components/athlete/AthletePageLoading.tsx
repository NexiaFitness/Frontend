/**
 * AthletePageLoading.tsx — Carga full-page atleta: skeleton móvil, spinner desktop.
 * Contexto: UX-FE-05 ampliado — todas las vistas full-page `< lg`.
 * Contratos: agent.md §5, DESIGN_MOBILE §3.2
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import { LoadingSpinner } from "@/components/ui/feedback";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import {
    AthletePageSkeleton,
    type AthletePageSkeletonVariant,
} from "./AthletePageSkeleton";

export interface AthletePageLoadingProps {
    variant: AthletePageSkeletonVariant;
}

export const AthletePageLoading: React.FC<AthletePageLoadingProps> = ({ variant }) => {
    const isDesktop = useIsAthleteDesktopLayout();

    if (!isDesktop) {
        return <AthletePageSkeleton variant={variant} />;
    }

    return (
        <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24 lg:px-8">
            <LoadingSpinner size="lg" />
        </div>
    );
};

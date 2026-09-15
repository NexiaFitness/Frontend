/**
 * useClientDetailHomeNavigation — Volver al resumen canónico del cliente (tab overview).
 *
 * Limpia query params de planificación / bloque / analytics en la URL actual.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { scrollDashboardMainToTop } from "@/lib/dashboardScroll";
import {
    applyClientDetailHomeSearchParams,
    isClientDetailHomeSearchParams,
} from "@/lib/trainingPlanNavigation";

export function useClientDetailHomeNavigation() {
    const [searchParams, setSearchParams] = useSearchParams();

    const isAtClientHome = useMemo(
        () => isClientDetailHomeSearchParams(searchParams),
        [searchParams],
    );

    const goToClientHome = useCallback(() => {
        if (isClientDetailHomeSearchParams(searchParams)) {
            scrollDashboardMainToTop("smooth");
            return;
        }
        setSearchParams((prev) => applyClientDetailHomeSearchParams(prev), {
            replace: true,
        });
    }, [searchParams, setSearchParams]);

    return { goToClientHome, isAtClientHome };
}

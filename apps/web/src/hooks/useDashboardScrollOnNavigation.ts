/**
 * Restablece el scroll del main del dashboard al cambiar de ruta o query (tabs en URL, etc.).
 */

import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    scrollDashboardMainToTopAfterPaint,
    shouldResetDashboardScrollOnNavigation,
} from "@/lib/dashboardScroll";

export function useDashboardScrollOnNavigation(): void {
    const location = useLocation();
    const prevLocationRef = useRef<{
        pathname: string;
        search: string;
    } | null>(null);

    useLayoutEffect(() => {
        const next = {
            pathname: location.pathname,
            search: location.search,
        };
        const prev = prevLocationRef.current;
        prevLocationRef.current = next;

        if (!shouldResetDashboardScrollOnNavigation(prev, next)) {
            return;
        }
        scrollDashboardMainToTopAfterPaint();
    }, [location.pathname, location.search, location.key]);
}

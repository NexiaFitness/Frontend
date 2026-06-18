/**
 * Restablece el scroll del main del dashboard al cambiar de ruta o query (tabs en URL, etc.).
 */

import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    dashboardRouteDefersScrollReset,
    scrollDashboardMainToTopAfterPaint,
} from "@/lib/dashboardScroll";

export function useDashboardScrollOnNavigation(): void {
    const location = useLocation();
    const scrollKey = `${location.pathname}${location.search}${location.key ?? ""}`;
    const deferScrollReset = dashboardRouteDefersScrollReset(location.search);

    useLayoutEffect(() => {
        if (deferScrollReset) return;
        scrollDashboardMainToTopAfterPaint();
    }, [scrollKey, deferScrollReset]);

    useEffect(() => {
        if (deferScrollReset) return;
        scrollDashboardMainToTopAfterPaint();
    }, [scrollKey, deferScrollReset]);
}

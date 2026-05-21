/**
 * Restablece el scroll del main del dashboard al cambiar de ruta o query (tabs en URL, etc.).
 */

import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollDashboardMainToTopAfterPaint } from "@/lib/dashboardScroll";

export function useDashboardScrollOnNavigation(): void {
    const location = useLocation();
    const scrollKey = `${location.pathname}${location.search}${location.key ?? ""}`;

    useLayoutEffect(() => {
        scrollDashboardMainToTopAfterPaint();
    }, [scrollKey]);

    useEffect(() => {
        scrollDashboardMainToTopAfterPaint();
    }, [scrollKey]);
}

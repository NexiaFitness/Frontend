/**
 * Scroll al inicio cuando el contenido de la vista termina de cargar (datos lazy, RTK, etc.).
 */

import { useEffect, useLayoutEffect } from "react";
import { scrollDashboardMainToTopAfterPaint } from "@/lib/dashboardScroll";

export function useScrollDashboardWhenReady(isReady: boolean): void {
    useLayoutEffect(() => {
        if (isReady) {
            scrollDashboardMainToTopAfterPaint();
        }
    }, [isReady]);

    useEffect(() => {
        if (!isReady) return;
        scrollDashboardMainToTopAfterPaint();
    }, [isReady]);
}

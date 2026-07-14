/**
 * Scroll al inicio cuando la vista termina de cargar (datos lazy, RTK, etc.).
 *
 * Una sola vez por montaje: los reintentos de scrollDashboardMainToTopAfterPaint
 * no deben ejecutarse tras interacción del usuario (p. ej. scroll al constructor).
 */

import { useLayoutEffect, useRef } from "react";
import { scrollDashboardMainToTopAfterPaint } from "@/lib/dashboardScroll";

export function useScrollDashboardWhenReady(isReady: boolean): void {
    const hasScrolledRef = useRef(false);

    useLayoutEffect(() => {
        if (!isReady || hasScrolledRef.current) return;
        hasScrolledRef.current = true;
        scrollDashboardMainToTopAfterPaint();
    }, [isReady]);
}

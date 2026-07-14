/**
 * Mantiene la card activa del constructor en la misma posición de viewport cuando
 * SessionConstructor reestructura el DOM al abrir/cerrar el picker inline (flex).
 */

import { useCallback, useLayoutEffect, useRef } from "react";
import {
    captureConstructorRowViewportTop,
    compensateDashboardScrollForRowViewportShift,
} from "@/lib/dashboardScroll";

export function usePreserveDashboardScrollOnConstructorPicker(
    showPicker: boolean,
    activeRowId: string | null,
): {
    captureBeforePickerChange: (rowId: string) => void;
} {
    const rowIdRef = useRef<string | null>(null);
    /** Posición en viewport antes de abrir el picker; se restaura al abrir, cerrar y tras focus. */
    const targetViewportTopRef = useRef<number | null>(null);

    const captureBeforePickerChange = useCallback((rowId: string) => {
        rowIdRef.current = rowId;
        targetViewportTopRef.current = captureConstructorRowViewportTop(rowId);
    }, []);

    useLayoutEffect(() => {
        const rowId = activeRowId ?? rowIdRef.current;
        const targetTop = targetViewportTopRef.current;
        if (!rowId || targetTop == null) return;

        const stabilize = () => {
            compensateDashboardScrollForRowViewportShift(rowId, targetTop);
        };

        stabilize();
        requestAnimationFrame(() => {
            stabilize();
            if (!showPicker) {
                targetViewportTopRef.current = null;
                rowIdRef.current = null;
            }
        });
    }, [showPicker, activeRowId]);

    return { captureBeforePickerChange };
}

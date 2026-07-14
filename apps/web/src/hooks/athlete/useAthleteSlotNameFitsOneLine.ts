/**
 * useAthleteSlotNameFitsOneLine.ts — Detecta si el nombre cabe en una línea (móvil run).
 */

import { useLayoutEffect, useState, type RefObject } from "react";

const PROBE_CLASS =
    "pointer-events-none absolute left-0 top-0 opacity-0 whitespace-nowrap text-sm font-medium";

export function useAthleteSlotNameFitsOneLine(
    exerciseName: string,
    containerRef: RefObject<HTMLElement | null>,
    enabled: boolean
): boolean {
    const [fitsOneLine, setFitsOneLine] = useState(true);

    useLayoutEffect(() => {
        if (!enabled) {
            setFitsOneLine(true);
            return;
        }

        const measure = () => {
            const container = containerRef.current;
            if (!container || container.clientWidth <= 0) return;

            const probe = document.createElement("span");
            probe.className = PROBE_CLASS;
            probe.setAttribute("aria-hidden", "true");
            probe.textContent = exerciseName;
            container.appendChild(probe);

            const overflow = probe.offsetWidth > container.clientWidth;
            container.removeChild(probe);
            setFitsOneLine(!overflow);
        };

        measure();

        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(measure);
        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef, enabled, exerciseName]);

    return fitsOneLine;
}

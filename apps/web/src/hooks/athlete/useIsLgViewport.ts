/**
 * useIsLgViewport.ts — Detecta breakpoint lg (≥1024px).
 * Contexto: shell atleta vs dashboard desktop.
 * @author Frontend Team
 * @since v6.1.0
 */

import { useEffect, useState } from "react";

const LG_QUERY = "(min-width: 1024px)";

export function useIsLgViewport(): boolean {
    const [isLg, setIsLg] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(LG_QUERY).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(LG_QUERY);
        const onChange = () => setIsLg(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return isLg;
}

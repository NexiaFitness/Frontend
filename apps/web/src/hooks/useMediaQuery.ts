/**
 * useMediaQuery.ts — Suscripción a media queries (portal atleta UX móvil).
 * Contexto: dual superficie sheet vs ruta según DESIGN_MOBILE §6.5.4
 * @author Frontend Team
 * @since v6.2.0
 */

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
        setMatches(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return matches;
}

/** Desktop plataforma — sheets no obligatorios en atleta (DESIGN_MOBILE §6.5.4). */
export function useIsAthleteDesktopLayout(): boolean {
    return useMediaQuery("(min-width: 1024px)");
}

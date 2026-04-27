/**
 * sessionDetailNavigation.ts — Volver al listado u origen desde el detalle de sesión
 * Contexto: SessionDetail / StandaloneSessionDetail; el “from” se envía con navigate state.
 * Notas: validar ruta interna (evita open redirect).
 */

import type { Location } from "react-router-dom";
import type { LocationStateReturnTo } from "@nexia/shared";

/** Estado a pasar al abrir el detalle desde otra ruta bajo /dashboard. */
export function returnToStateFromView(location: Location): LocationStateReturnTo {
    return { from: `${location.pathname}${location.search}${location.hash}` };
}

/** Ruta de retorno segura, o null. */
export function readSafeReturnTo(state: unknown): string | null {
    const from = (state as LocationStateReturnTo | null)?.from;
    if (typeof from !== "string" || from.length === 0) {
        return null;
    }
    if (!from.startsWith("/dashboard/") || from.includes("://") || from.includes("..")) {
        return null;
    }
    return from;
}

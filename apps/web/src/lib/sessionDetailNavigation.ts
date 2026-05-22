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

function isSafeDashboardPath(path: string): boolean {
    return (
        path.length > 0 &&
        path.startsWith("/dashboard/") &&
        !path.includes("://") &&
        !path.includes("..")
    );
}

/** Ruta de retorno segura, o null. */
export function readSafeReturnTo(state: unknown): string | null {
    const from = (state as LocationStateReturnTo | null)?.from;
    if (typeof from !== "string" || !isSafeDashboardPath(from)) {
        return null;
    }
    return from;
}

/**
 * Destino de «Volver» desde la revisión de sesión.
 * Acepta `from` (detalle, etc.) y `returnTo` legacy (tras crear/editar).
 */
export function readReviewBackTarget(state: unknown): string | null {
    const fromTarget = readSafeReturnTo(state);
    if (fromTarget) return fromTarget;

    const returnTo = (state as { returnTo?: string } | null)?.returnTo;
    if (typeof returnTo !== "string" || !isSafeDashboardPath(returnTo)) {
        return null;
    }
    return returnTo;
}

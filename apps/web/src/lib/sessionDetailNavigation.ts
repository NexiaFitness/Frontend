/**
 * sessionDetailNavigation.ts — Volver al listado u origen desde el detalle de sesión
 * Contexto: SessionDetail / StandaloneSessionDetail; el “from” se envía con navigate state.
 * Notas: validar ruta interna (evita open redirect). Tras DELETE, no volver a create/edit
 * ni a la sesión borrada (B-05).
 */

import type { Location, NavigateFunction } from "react-router-dom";
import type { LocationStateReturnTo, SessionReviewLocationState } from "@nexia/shared";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";

/** Estado a pasar al abrir el detalle desde otra ruta bajo /dashboard. */
export function returnToStateFromView(location: Location): LocationStateReturnTo {
    return { from: `${location.pathname}${location.search}${location.hash}` };
}

/** Estado de navegacion post-guardado hacia review (from + coherence opcional). */
export function buildReviewNavigationState(
    location: Location,
    coherence?: SessionCoherence | null,
): SessionReviewLocationState {
    return {
        ...returnToStateFromView(location),
        ...(coherence !== undefined ? { coherence } : {}),
    };
}

function isSessionCoherence(value: unknown): value is SessionCoherence {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as SessionCoherence).session_id === "number" &&
        Array.isArray((value as SessionCoherence).coherence_warnings)
    );
}

/** Coherencia sembrada en location.state tras create/update; undefined si no viene. */
export function readReviewCoherenceFromState(state: unknown): SessionCoherence | undefined {
    const coherence = (state as SessionReviewLocationState | null)?.coherence;
    if (coherence == null) return undefined;
    return isSessionCoherence(coherence) ? coherence : undefined;
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
 * Volver al origen: `state.from` (navigate con returnToStateFromView), historial del
 * navegador, o ruta por defecto. Evita mandar siempre al listado de sesiones.
 */
export function navigateDashboardBack(
    navigate: NavigateFunction,
    state: unknown,
    fallbackPath: string,
): void {
    const from = readSafeReturnTo(state);
    if (from) {
        navigate(from);
        return;
    }
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
        navigate(-1);
        return;
    }
    navigate(fallbackPath);
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

function pathnameOf(path: string): string {
    const queryIndex = path.search(/[?#]/);
    return queryIndex === -1 ? path : path.slice(0, queryIndex);
}

function pathIsOrUnder(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Pestaña Sesiones del cliente; null si no hay id. */
export function clientSessionsTabPath(
    clientId: number | string | null | undefined,
): string | null {
    if (clientId == null || clientId === "") return null;
    return `/dashboard/clients/${clientId}?tab=sessions`;
}

/**
 * Rutas que no sirven tras DELETE 200: el alta, la edición o la propia sesión
 * borrada (detalle, revisión o suelta).
 */
export function isUnusableAfterSessionDelete(
    path: string,
    deletedSessionId: number,
): boolean {
    const pathname = pathnameOf(path);
    if (pathIsOrUnder(pathname, "/dashboard/session-programming/create-session")) {
        return true;
    }
    if (pathIsOrUnder(pathname, "/dashboard/session-programming/edit-session")) {
        return true;
    }
    if (
        pathIsOrUnder(
            pathname,
            `/dashboard/session-programming/sessions/${deletedSessionId}`,
        )
    ) {
        return true;
    }
    if (
        pathIsOrUnder(
            pathname,
            `/dashboard/standalone-sessions/${deletedSessionId}`,
        )
    ) {
        return true;
    }
    return false;
}

const DEFAULT_AFTER_SESSION_DELETE = "/dashboard/sessions";

/**
 * Destino tras borrar: origen seguro, pestaña del cliente, o listado.
 * Nunca create-session / edit-session / la sesión ya borrada (B-05).
 */
export function readSessionDeleteBackTarget(
    locationState: unknown,
    deletedSessionId: number,
    clientId?: number | string | null,
    fallback: string = DEFAULT_AFTER_SESSION_DELETE,
): string {
    const candidate = readReviewBackTarget(locationState);
    if (candidate && !isUnusableAfterSessionDelete(candidate, deletedSessionId)) {
        return candidate;
    }
    return clientSessionsTabPath(clientId) ?? fallback;
}

export function navigateAfterSessionDelete(
    navigate: NavigateFunction,
    locationState: unknown,
    deletedSessionId: number,
    options?: { clientId?: number | string | null; fallback?: string },
): void {
    navigate(
        readSessionDeleteBackTarget(
            locationState,
            deletedSessionId,
            options?.clientId,
            options?.fallback ?? DEFAULT_AFTER_SESSION_DELETE,
        ),
        { replace: true },
    );
}

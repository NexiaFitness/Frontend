/**
 * athleteSkeletonRoutes.ts — Mapa ruta → variante skeleton atleta (UX-FE-05).
 * Usado por Suspense fallback y documentación de cobertura.
 */

import type { AthletePageSkeletonVariant } from "./AthletePageSkeleton";

/** Resuelve variante skeleton desde pathname (más específico primero). */
export function athleteSkeletonVariantFromPath(pathname: string): AthletePageSkeletonVariant {
    if (/^\/dashboard\/progress\/exercise\/\d+/.test(pathname)) {
        return "exercise-detail";
    }
    if (pathname.startsWith("/dashboard/progress")) {
        return "progress";
    }
    if (/^\/dashboard\/sessions\/\d+\/run/.test(pathname)) {
        return "session-run";
    }
    if (/^\/dashboard\/sessions\/\d+\/summary/.test(pathname)) {
        return "session-summary";
    }
    if (/^\/dashboard\/sessions\/\d+\/feedback/.test(pathname)) {
        return "session-feedback";
    }
    if (/^\/dashboard\/sessions\/\d+/.test(pathname)) {
        return "session-preview";
    }
    if (pathname.startsWith("/dashboard/sessions")) {
        return "sessions-list";
    }
    if (pathname.startsWith("/dashboard/feedback")) {
        return "feedback-history";
    }
    if (pathname.startsWith("/dashboard/my-plan")) {
        return "plan";
    }
    if (pathname.startsWith("/dashboard/account")) {
        return "account";
    }
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
        return "dashboard";
    }
    return "default";
}

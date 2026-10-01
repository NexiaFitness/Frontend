/**
 * DashboardRouteErrorBoundary.tsx — ErrorBoundary por ruta dentro del dashboard (B9).
 *
 * Contexto: Envuelve el Outlet del shell para que un fallo de render no desmonte sidebar/nav.
 * Reinicia al cambiar de pathname (resetKey).
 *
 * Notas de mantenimiento: usar solo bajo `/dashboard/*`, no en la raíz de App.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";

export function DashboardRouteErrorBoundary({ children }: { children: ReactNode }): JSX.Element {
    const location = useLocation();
    return (
        <ErrorBoundary resetKey={location.pathname} variant="route">
            {children}
        </ErrorBoundary>
    );
}

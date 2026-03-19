/**
 * ProtectedRoute.tsx — Guard de rutas protegidas por autenticación.
 *
 * Responsabilidades:
 * - Esperar a que termine la hidratación de auth (hydrateAuth) antes de decidir.
 * - Si no hay sesión válida tras la hidratación, redirigir a /auth/login.
 * - Si hay token y usuario en Redux, renderizar children.
 *
 * Contexto:
 * - En recarga (o page.goto en E2E), Redux arranca con token null; hydrateAuth
 *   restaura desde localStorage de forma asíncrona. El guard no debe redirigir
 *   hasta que isLoading sea false (ver frontend/docs/DIAGNOSTICO_E2E.md, Error 1).
 * - Web con React Router v6. En móvil (React Native) se usará implementación específica.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated E2E: espera hidratación y muestra LoadingSpinner en bootstrap
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { LoadingSpinner } from "@/components/ui/feedback";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token, isLoading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Comprobando sesión">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated || !token) {
        return (
            <Navigate
                to="/auth/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    return <>{children}</>;
};

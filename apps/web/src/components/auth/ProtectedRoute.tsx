/**
 * ProtectedRoute.tsx — Componente de ruta protegida para autenticación.
 *
 * Verifica que el usuario esté autenticado:
 * - Si no hay token válido en Redux → redirige a /auth/login
 * - Si hay token válido → renderiza children
 *
 * Contexto:
 * - Web con React Router (v6).
 * - En móvil (React Native) habrá implementación específica.
 *
 * @autor Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    // Verificar si usuario está autenticado
    if (!isAuthenticated || !token) {
        // Guardar la ruta actual para redirigir después del login
        return (
            <Navigate
                to="/auth/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    // Usuario autenticado → renderizar contenido protegido
    return <>{children}</>;
};

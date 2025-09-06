/**
 * Componente de ruta protegida para autenticación
 * Verifica token válido en Redux state y redirige a login si no autenticado
 * Específico para web con React Router - móvil tendrá su propia implementación
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@shared/store";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    // Verificar si usuario está autenticado
    if (!isAuthenticated || !token) {
        // Guardar la ruta actual para redireccionar después del login
        return (
            <Navigate 
                to="/auth/login" 
                state={{ from: location.pathname }} 
                replace 
            />
        );
    }

    // Usuario autenticado - renderizar contenido protegido
    return <>{children}</>;
};
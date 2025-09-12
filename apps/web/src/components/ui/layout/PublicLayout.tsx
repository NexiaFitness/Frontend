/**
 * Layout público de NEXIA
 * 
 * Envuelve todas las páginas accesibles sin autenticación
 * Incluye la PublicNavbar en la parte superior
 * y un <Outlet /> para renderizar el contenido específico de cada ruta.
 *
 * Ventajas:
 * - Evita duplicar código de Navbar en Login, Register, ForgotPassword, etc.
 * - Mantiene consistencia visual entre Home y las páginas de autenticación.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./navbar/PublicNavbar";

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-sidebar-header">
            {/* Navbar pública */}
            <PublicNavbar />

            {/* Contenido principal de cada página */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

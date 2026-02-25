/**
 * Layout público de NEXIA
 *
 * Envuelve todas las páginas accesibles sin autenticación.
 * Incluye la navbar unificada (AppNavbar) en la parte superior
 * y un <Outlet /> para renderizar el contenido específico de cada ruta.
 *
 * Ajuste:
 * - La navbar permanece fija con sticky.
 * - El main gestiona el scroll sin empujar la navbar.
 *
 * @autor Frontend Team
 * @since v1.0.0
 * @updated v2.2.0 - Fix scroll en móviles/tablets para no ocultar navbar
 * @updated Fase 2 - navbar unificada (AppNavbar)
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { AppNavbar } from "./navbar/AppNavbar";

export const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navbar unificada (variante explícita decidida por layout) */}
            <AppNavbar variant="public" />

            {/* Contenido principal, con scroll controlado */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

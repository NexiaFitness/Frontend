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
import { NEXIA_SCROLLBAR } from "./scrollPresentation";
import { cn } from "@/lib/utils";

export const PublicLayout: React.FC = () => {
    return (
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-background">
            {/* Navbar unificada (variante explícita decidida por layout) */}
            <AppNavbar variant="public" />

            {/* Contenido principal, con scroll controlado */}
            <main className={cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto", NEXIA_SCROLLBAR)}>
                <Outlet />
            </main>
        </div>
    );
};

/**
 * AthleteSideMenu - Navegación lateral específica para atletas/clientes.
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop (lg+): VISIBLE como sidebar fijo
 * - Mobile/Tablet (< lg): HIDDEN (DashboardNavbar se usa en su lugar)
 * 
 * SCROLL ARCHITECTURE:
 * - Header: Fixed top
 * - Content container: Single scrolleable area (nav + footer together)
 * - Scrollbar: Hidden but functional
 * 
 * Muestra navegación lateral con secciones principales para athletes:
 * - Dashboard (overview personal del atleta)
 * - Mi Plan (plan de entrenamiento asignado)
 * - Mis Sesiones (sesiones programadas y completadas)
 * - Progreso (métricas y evolución personal)
 * - Mi cuenta (configuración personal)
 * 
 * @author Frontend Team
 * @since v4.1.0 - Unified responsive behavior
 * @updated v4.2.0 - Scroll profesional: header fijo + contenedor único scrolleable
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { LogoutButton } from "@/components/ui/buttons";
import { NexiaLogo } from "../../auth/NexiaLogo";
import type { RootState } from "@shared/store";

export const AthleteSideMenu: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Mi Plan", path: "/dashboard/my-plan" },
        { label: "Mis Sesiones", path: "/dashboard/sessions" },
        { label: "Progreso", path: "/dashboard/progress" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-80 flex-col z-10">
            {/* Header - Logo y título fijos en top */}
            <div className="p-8 bg-sidebar-header border-b-2 border-white/60 text-center shrink-0">
                <div className="w-[120px] h-auto mx-auto">
                    <NexiaLogo />
                </div>
                <p className="text-slate-300 text-sm mt-2">Mi Entrenamiento</p>
            </div>

            {/* Contenedor scrolleable: Nav + Footer juntos - Scrollbar oculto pero funcional */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Navegación */}
                <nav className="p-8 px-8 bg-sidebar-nav border-b-2 border-white/60 space-y-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            className={clsx(
                                "rounded-lg px-6 py-4 cursor-pointer transition",
                                isActive(item.path)
                                    ? "bg-slate-800 text-white font-semibold"
                                    : "text-slate-200 hover:text-white hover:bg-slate-800"
                            )}
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </div>
                    ))}
                </nav>

                {/* User info + logout - Parte del flujo scrolleable */}
                <div className="p-6 bg-sidebar-nav pt-8 pb-8">
                    <div className="text-center mb-6">
                        <p className="text-white font-medium">
                            {user?.nombre} {user?.apellidos}
                        </p>
                        <p className="text-slate-200 text-sm">Athlete</p>
                    </div>

                    <div className="px-4 mb-6">
                        <LogoutButton
                            variant="secondary"
                            confirmationRequired={true}
                            showUserName={false}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};
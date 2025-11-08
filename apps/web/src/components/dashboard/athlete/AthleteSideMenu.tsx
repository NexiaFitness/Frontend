/**
 * AthleteSideMenu - Navegación lateral específica para atletas/clientes.
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop (lg+): VISIBLE como sidebar fijo
 * - Mobile/Tablet (< lg): HIDDEN (DashboardNavbar se usa en su lugar)
 * 
 * SCROLL ARCHITECTURE:
 * - Header: Fixed top (shrink-0)
 * - Nav: Scrolleable (flex-1 + overflow-y-auto)
 * - Footer: ALWAYS visible at bottom (shrink-0, no scroll)
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
 * @updated v4.2.2 - Footer always visible at bottom (no scroll)
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { LogoutButton } from "@/components/ui/buttons";
import { NexiaLogoCompact } from "@/components/ui/branding/NexiaLogoCompact";
import type { RootState } from "@nexia/shared/store";

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
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-80 flex-col z-10 bg-sidebar-nav">
            {/* Header - Logo y título fijos en top */}
            <div className="p-8 bg-sidebar-header border-b-2 border-white/60 text-center shrink-0">
                <div className="w-24 sm:w-32 md:w-40 h-auto mx-auto">
                    <NexiaLogoCompact className="w-24 sm:w-32 md:w-40" />
                </div>
                <p className="text-slate-300 text-sm mt-2">Mi Entrenamiento</p>
            </div>

            {/* Content Wrapper - Flexbox para separar nav (scrolleable) de footer (fijo) */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Navegación - SOLO ESTA PARTE SCROLLEA */}
                <nav className="flex-1 overflow-y-auto p-8 px-8 border-b-2 border-white/60 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            className={clsx(
                                "rounded-lg px-6 py-4 cursor-pointer transition",
                                isActive(item.path)
                                    ? "text-white font-semibold"
                                    : "text-white/80 hover:text-white"
                            )}
                            style={isActive(item.path) ? { backgroundColor: '#3a5db3' } : {}}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'rgba(74, 103, 179, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </div>
                    ))}
                </nav>

                {/* Footer - SIEMPRE VISIBLE AL BOTTOM */}
                <div className="p-6 pt-8 pb-8 shrink-0">
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
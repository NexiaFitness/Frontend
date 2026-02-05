/**
 * TrainerSideMenu - Navegación lateral específica para entrenadores
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
 * @author Frontend Team
 * @since v3.1.0 - Especializado desde SideMenu genérico   
 * @updated v4.2.0 - Scroll profesional: header fijo + contenedor único scrolleable
 * @updated v4.2.2 - Footer always visible at bottom (no scroll)
 */

import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { LogoutButton } from "@/components/ui/buttons";
import { NexiaLogoCompact } from "@/components/ui/branding/NexiaLogoCompact";
import type { RootState } from "@nexia/shared/store";

export const TrainerSideMenu: React.FC = () => {
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const isActive = (path: string) => location.pathname === path;

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-80 flex-col z-10 bg-sidebar-nav" style={{ height: '100vh' }}>
            {/* Header - Logo y título fijos en top */}
            <div className="p-8 bg-sidebar-header border-b-2 border-white/60 text-center shrink-0">
                <div className="w-24 sm:w-32 md:w-40 h-auto mx-auto">
                    <NexiaLogoCompact className="w-24 sm:w-32 md:w-40" />
                </div>
                <p className="text-slate-300 text-sm mt-2">Trainer Dashboard</p>
            </div>

            {/* Content Wrapper - Flexbox para separar nav (scrolleable) de footer (fijo) */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Navegación - SOLO ESTA PARTE SCROLLEA */}
                <nav className="flex-1 overflow-y-auto p-8 px-8 border-b-2 border-white/60 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "block rounded-lg px-6 py-4 cursor-pointer transition",
                                isActive(item.path)
                                    ? "text-white font-semibold bg-[rgba(4,21,32,1)]"
                                    : "text-white/80 hover:text-white hover:bg-[rgba(74,103,179,0.3)]"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer - SIEMPRE VISIBLE AL BOTTOM */}
                <div className="p-6 pt-8 pb-8 shrink-0">
                    <div className="text-center mb-6">
                        <p className="text-white font-medium">
                            {user?.nombre} {user?.apellidos}
                        </p>
                        <p className="text-slate-200 text-sm">Professional Trainer</p>
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
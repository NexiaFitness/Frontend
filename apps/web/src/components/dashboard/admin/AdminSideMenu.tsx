/**
 * AdminSideMenu - Navegación lateral específica para administradores.
 * 
 * Muestra navegación lateral con secciones principales para admins:
 * - Dashboard (overview del sistema)
 * - Usuarios (gestión de todos los usuarios)
 * - Entrenadores (gestión específica de trainers)
 * - Sistema (configuración y monitoreo)
 * - Mi cuenta (configuración personal)
 * 
 * Incluye:
 * - Logo NEXIA en cabecera con título "Admin Panel"
 * - Nombre del usuario autenticado con rol "System Administrator"
 * - Botón de logout profesional con confirmación
 * 
 * Características técnicas:
 * - Fixed positioning para que permanezca fijo mientras main content scrollea
 * - Routing activo con useNavigate y useLocation
 * - Estado visual activo para la ruta actual
 * - Preparado para reutilización como drawer en móvil
 * 
 * @author Frontend Team
 * @since v3.1.0 - Especializado para administradores
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { LogoutButton } from "@/components/ui/buttons";
import { NexiaLogo } from "../../auth/NexiaLogo";
import type { RootState } from "@shared/store";

export const AdminSideMenu: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const isActive = (path: string) => location.pathname === path;

    // Menu items específicos para administradores
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Usuarios", path: "/dashboard/users" },
        { label: "Entrenadores", path: "/dashboard/trainers" },
        { label: "Sistema", path: "/dashboard/system" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-80 flex flex-col z-10">
            {/* Header - Logo y título fijos en top */}
            <div className="p-8 bg-sidebar-header border-b-2 border-white/60 text-center shrink-0">
                <div className="w-[120px] h-auto mx-auto">
                    <NexiaLogo />
                </div>
                <p className="text-slate-300 text-sm mt-2">Admin Panel</p>
            </div>

            {/* Navegación - Scrolleable si crece el contenido */}
            <nav className="flex-1 p-8 px-8 bg-sidebar-nav border-b-2 border-white/60 space-y-4 overflow-y-auto">
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

            {/* User info + logout - Fijo en bottom */}
            <div className="p-6 bg-sidebar-nav pt-8 pb-8 shrink-0">
                <div className="text-center mb-6">
                    <p className="text-white font-medium">
                        {user?.nombre} {user?.apellidos}
                    </p>
                    <p className="text-slate-200 text-sm">System Administrator</p>
                </div>

                <div className="px-4 mb-6">
                    <LogoutButton
                        variant="secondary"
                        confirmationRequired={true}
                        showUserName={false}
                    />
                </div>
            </div>
        </aside>
    );
};
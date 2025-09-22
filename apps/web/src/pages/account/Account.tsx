/**
 * Página "Mi cuenta" dentro del dashboard.
 * Envuelve el formulario ProfileForm con el layout apropiado según rol de usuario.
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: SideMenu visible por rol + DashboardLayout offset
 * - Mobile/Tablet: DashboardNavbar + SideMenu hidden
 * 
 * @author Frontend Team
 * @since v4.2.0 - Unified responsive behavior with DashboardNavbar
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer";
import { AdminSideMenu } from "@/components/dashboard/admin";
import { AthleteSideMenu } from "@/components/dashboard/athlete";
import { ProfileForm } from "@/components/account/ProfileForm";
import type { RootState } from "@shared/store";

export const Account: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Menu items específicos por rol para mobile navbar
    const getMenuItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Usuarios", path: "/dashboard/users" },
                    { label: "Entrenadores", path: "/dashboard/trainers" },
                    { label: "Sistema", path: "/dashboard/system" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
            case 'trainer':
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Clientes", path: "/dashboard/clients" },
                    { label: "Planes de entrenamiento", path: "/dashboard/plans" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
            case 'athlete':
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Mi Plan", path: "/dashboard/my-plan" },
                    { label: "Mis Sesiones", path: "/dashboard/sessions" },
                    { label: "Progreso", path: "/dashboard/progress" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
            default:
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
        }
    };

    // Renderizar SideMenu apropiado según rol
    const renderSideMenu = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminSideMenu />;
            case 'trainer':
                return <TrainerSideMenu />;
            case 'athlete':
                return <AthleteSideMenu />;
            default:
                return <TrainerSideMenu />; // Fallback
        }
    };

    return (
        <>
            {/* Mobile/Tablet Navbar - visible cuando sidebar desaparece */}
            <DashboardNavbar menuItems={getMenuItems()} />

            {/* Desktop Sidebar - oculto en mobile/tablet */}
            {renderSideMenu()}

            {/* Layout + contenido */}
            <DashboardLayout>
                <ProfileForm />
            </DashboardLayout>
        </>
    );
};

export default Account;
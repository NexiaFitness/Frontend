/**
 * Account.tsx — Página "Mi cuenta" dentro del dashboard.
 *
 * Contexto:
 * - Usa DashboardLayout, Navbar y SideMenu responsive igual que otros dashboards.
 * - Encabezado principal con tipografía igual a dashboards (dashboardHero).
 * - Contenido central: ProfileForm (secciones de perfil, seguridad, peligro).
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop: SideMenu visible según rol + DashboardLayout offset
 * - Mobile/Tablet: DashboardNavbar visible + SideMenu oculto
 *
 * @since v4.3.8 - Unificado encabezado con dashboards usando dashboardHero
 * @updated v4.3.9 - Ajustado ancho a max-w-6xl para grid de 2 columnas
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer";
import { AdminSideMenu } from "@/components/dashboard/admin";
import { AthleteSideMenu } from "@/components/dashboard/athlete";
import { ProfileForm } from "@/components/account/ProfileForm";
import { TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import type { RootState } from "@nexia/shared/store";

export const Account: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    const getMenuItems = () => {
        switch (user?.role) {
            case "admin":
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Usuarios", path: "/dashboard/users" },
                    { label: "Entrenadores", path: "/dashboard/trainers" },
                    { label: "Sistema", path: "/dashboard/system" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
            case "trainer":
                return [
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Clientes", path: "/dashboard/clients" },
                    { label: "Planes de entrenamiento", path: "/dashboard/plans" },
                    { label: "Mi cuenta", path: "/dashboard/account" },
                ];
            case "athlete":
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

    const renderSideMenu = () => {
        switch (user?.role) {
            case "admin":
                return <AdminSideMenu />;
            case "trainer":
                return <TrainerSideMenu />;
            case "athlete":
                return <AthleteSideMenu />;
            default:
                return <TrainerSideMenu />;
        }
    };

    return (
        <>
            <DashboardNavbar menuItems={getMenuItems()} />
            {renderSideMenu()}

            <DashboardLayout>
                {/* Encabezado responsive igual a dashboards */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className={TYPOGRAPHY_COMBINATIONS.dashboardHeroTitle}>Mi Cuenta</h2>
                    <p className={TYPOGRAPHY_COMBINATIONS.dashboardHeroSubtitle}>
                        Gestiona tu información personal y configuración de seguridad
                    </p>
                </div>

                {/* Contenido principal con ancho extendido */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20 max-w-6xl mx-auto">
                    <ProfileForm />
                </div>
            </DashboardLayout>
        </>
    );
};

export default Account;

/**
 * Página "Mi cuenta" dentro del dashboard.
 * Envuelve el formulario ProfileForm con el layout apropiado según rol de usuario.
 *
 * Reglas:
 * - Detecta rol del usuario y renderiza SideMenu apropiado
 * - Trainer y Athlete: pueden editar datos, cambiar contraseña y eliminar su cuenta
 * - Admin: puede editar datos, pero no eliminar su cuenta (restricción)
 *
 * Notas:
 * - Mantiene arquitectura limpia: detecta rol y aplica layout + navegación correcta
 * - Parte de las rutas privadas: /dashboard/account
 * - Compatible con la nueva arquitectura de SideMenus por rol
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Role-based SideMenu integration
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer";
import { AdminSideMenu } from "@/components/dashboard/admin";
import { AthleteSideMenu } from "@/components/dashboard/athlete";
import { ProfileForm } from "@/components/account/ProfileForm";
import type { RootState } from "@shared/store";

export const Account: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

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
            {/* SideMenu específico del rol */}
            {renderSideMenu()}
            
            {/* Layout + contenido */}
            <DashboardLayout>
                <ProfileForm />
            </DashboardLayout>
        </>
    );
};

export default Account;
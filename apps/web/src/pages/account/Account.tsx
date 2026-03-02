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
 * - Mobile/Tablet: navbar (AppNavbar) visible + SideMenu oculto
 *
 * @since v4.3.8 - Unificado encabezado con dashboards usando dashboardHero
 * @updated v4.3.9 - Ajustado ancho a max-w-6xl para grid de 2 columnas
 */

import React from "react";
import { PageTitle } from "@/components/dashboard/shared";
import { ProfileForm } from "@/components/account/ProfileForm";

export const Account: React.FC = () => {
    return (
        <>
            <PageTitle
                title="Mi Cuenta"
                subtitle="Gestiona tu información personal y configuración de seguridad"
                className="mb-6"
            />

                {/* Contenido principal con ancho completo */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <ProfileForm />
                </div>
        </>
    );
};

export default Account;

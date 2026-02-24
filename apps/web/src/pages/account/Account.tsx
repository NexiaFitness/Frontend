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
import { ProfileForm } from "@/components/account/ProfileForm";

export const Account: React.FC = () => {
    return (
        <>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Mi Cuenta
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Gestiona tu información personal y configuración de seguridad
                    </p>
                </div>

                {/* Contenido principal con ancho completo */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <ProfileForm />
                </div>
        </>
    );
};

export default Account;

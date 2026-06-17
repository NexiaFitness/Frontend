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
import { useSelector } from "react-redux";
import { PageTitle } from "@/components/dashboard/shared";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AthleteNotificationPrefsCard } from "@/components/athlete/AthleteNotificationPrefsCard";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { selectUser } from "@nexia/shared";

export const Account: React.FC = () => {
    const user = useSelector(selectUser);
    const isAthlete = user?.role === USER_ROLES.ATHLETE;

    return (
        <>
            <PageTitle
                title="Mi Cuenta"
                subtitle="Gestiona tu información personal y configuración de seguridad"
                className="mb-6"
            />

            <div className="space-y-6 px-4 lg:px-8 pb-12 lg:pb-20">
                {isAthlete && <AthleteNotificationPrefsCard />}
                <ProfileForm />
            </div>
        </>
    );
};

export default Account;

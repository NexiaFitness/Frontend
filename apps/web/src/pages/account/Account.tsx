/**
 * Página "Mi cuenta" dentro del dashboard.
 * Envuelve el formulario ProfileForm con DashboardLayout.
 *
 * Reglas:
 * - Trainer y Athlete: pueden editar datos, cambiar contraseña y eliminar su cuenta.
 * - Admin: puede editar datos, pero no eliminar su cuenta (restricción).
 *
 * Notas:
 * - Esta vista mantiene la arquitectura limpia: la página aplica layout,
 *   mientras que la lógica está en ProfileForm y sus subcomponentes.
 * - Forma parte de las rutas privadas: /dashboard/account.
 *
 * @author Nelson
 * @since v1.0.0
 */

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileForm } from "@/components/account/ProfileForm";

export const Account: React.FC = () => {
    return (
        <DashboardLayout>
            <ProfileForm />
        </DashboardLayout>
    );
};

export default Account;

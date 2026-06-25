/**
 * AdminDashboard.tsx — Inicio admin premium (experimento F3b / DESIGN_MOBILE §6.7).
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Settings, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardActivityPanel } from "@/components/admin/dashboard/AdminDashboardActivityPanel";
import { AdminDashboardHeader } from "@/components/admin/dashboard/AdminDashboardHeader";
import { AdminDashboardKpiCard } from "@/components/admin/dashboard/AdminDashboardKpiCard";
import {
    ADMIN_DASHBOARD_GLOW,
    ADMIN_DASHBOARD_ACTIONS_COL,
    ADMIN_DASHBOARD_ACTIVITY_COL,
    ADMIN_DASHBOARD_KPI_GRID,
    ADMIN_DASHBOARD_LOWER_COL,
    ADMIN_DASHBOARD_LOWER_GRID,
    ADMIN_DASHBOARD_PAGE,
    ADMIN_DASHBOARD_SECTION_LABEL,
    ADMIN_DASHBOARD_STACK,
} from "@/components/admin/dashboard/adminDashboardPresentation";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import {
    getAthleteDisplayFirstName,
} from "@nexia/shared/utils/athlete/athleteProfileDisplay";
import type { RootState } from "@nexia/shared/store";

const KPIS = [
    { value: "156", label: "Usuarios totales", hint: "Activos en la plataforma" },
    { value: "23", label: "Entrenadores activos", hint: "Cuentas profesionales" },
    { value: "98.2%", label: "Uptime del sistema", hint: "Últimos 30 días" },
] as const;

const ACTIVITY_METRICS = [
    { value: "12", label: "Usuarios nuevos hoy" },
    { value: "89", label: "Sesiones activas" },
    { value: "245", label: "Logins diarios" },
] as const;

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const firstName = getAthleteDisplayFirstName(user?.nombre ?? "Admin");

    return (
        <div className={ADMIN_DASHBOARD_PAGE}>
            <div className={ADMIN_DASHBOARD_GLOW} aria-hidden />

            <div className={ADMIN_DASHBOARD_STACK}>
                <AdminDashboardHeader
                    firstName={firstName}
                    subtitle="Gestiona usuarios, entrenadores y el sistema desde tu panel de control"
                />

                <section className="space-y-3" aria-label="Resumen">
                    <p className={ADMIN_DASHBOARD_SECTION_LABEL}>Resumen</p>
                    <div className={ADMIN_DASHBOARD_KPI_GRID}>
                        {KPIS.map((kpi) => (
                            <AdminDashboardKpiCard
                                key={kpi.label}
                                value={kpi.value}
                                label={kpi.label}
                                hint={kpi.hint}
                            />
                        ))}
                    </div>
                </section>

                <div className={ADMIN_DASHBOARD_LOWER_GRID}>
                    <div className={cn(ADMIN_DASHBOARD_ACTIONS_COL, ADMIN_DASHBOARD_LOWER_COL)}>
                        <AthleteSettingsSection title="Acciones rápidas" stretch>
                            <AthleteSettingsRow
                                icon={Users}
                                label="Gestionar usuarios"
                                hint="Altas, roles y acceso a la plataforma"
                                onClick={() => navigate("/dashboard/users")}
                            />
                            <AthleteSettingsRow
                                icon={Settings}
                                label="Configuración del sistema"
                                hint="Parámetros globales y monitorización"
                                onClick={() => navigate("/dashboard/system")}
                            />
                            <AthleteSettingsRow
                                icon={User}
                                label="Mi cuenta"
                                hint="Perfil, contraseña y sesión"
                                onClick={() => navigate("/dashboard/account")}
                                isLast
                            />
                        </AthleteSettingsSection>
                    </div>

                    <div className={cn(ADMIN_DASHBOARD_ACTIVITY_COL, ADMIN_DASHBOARD_LOWER_COL)}>
                        <AdminDashboardActivityPanel
                            title="Actividad del sistema"
                            description="Monitoriza uso de la plataforma y métricas de rendimiento"
                            metrics={[...ACTIVITY_METRICS]}
                            onClick={() => navigate("/dashboard/system")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * AdminDashboard.tsx — Inicio admin premium (experimento F3b / DESIGN_MOBILE §6.7).
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Dumbbell, Settings, User, Users } from "lucide-react";
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
import { useGetCatalogHealthQuery } from "@nexia/shared/api/adminApi";
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
    const { data: catalogHealth } = useGetCatalogHealthQuery();
    const mappingGaps = catalogHealth?.missing_muscle_mapping_count ?? 0;

    return (
        <div className={ADMIN_DASHBOARD_PAGE}>
            <div className={ADMIN_DASHBOARD_GLOW} aria-hidden />

            <div className={ADMIN_DASHBOARD_STACK}>
                <AdminDashboardHeader
                    firstName={firstName}
                    subtitle="Gestiona usuarios, entrenadores y el sistema desde tu panel de control"
                />

                {mappingGaps > 0 ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-2.5">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                                <div className="min-w-0 space-y-1">
                                    <p className="text-sm font-semibold text-destructive">
                                        Catálogo: {mappingGaps}{" "}
                                        {mappingGaps === 1
                                            ? "ejercicio sin mapeo muscular"
                                            : "ejercicios sin mapeo muscular"}
                                    </p>
                                    <p className="text-xs leading-relaxed text-destructive/90">
                                        Los entrenadores verán avisos al programar sesiones. Revisa y corrige
                                        el catálogo.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/exercises")}
                                className="shrink-0 rounded-md border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                            >
                                Ir al catálogo
                            </button>
                        </div>
                    </div>
                ) : null}

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
                                icon={Dumbbell}
                                label="Catálogo de ejercicios"
                                hint={
                                    mappingGaps > 0
                                        ? `${mappingGaps} ejercicio(s) sin mapeo muscular — requiere revisión`
                                        : "Mapeos musculares al día"
                                }
                                onClick={() => navigate("/dashboard/exercises")}
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

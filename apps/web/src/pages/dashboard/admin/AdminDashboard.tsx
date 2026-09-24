/**
 * AdminDashboard.tsx — Inicio admin premium (experimento F3b / DESIGN_MOBILE §6.7).
 *
 * M5: sin KPIs inventados; aviso catálogo con Alert + enlace /dashboard/admin/catalog.
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ScrollText, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardHeader } from "@/components/admin/dashboard/AdminDashboardHeader";
import {
    ADMIN_DASHBOARD_ACTIONS_COL,
    ADMIN_DASHBOARD_ACTIVITY_COL,
    ADMIN_DASHBOARD_GLOW,
    ADMIN_DASHBOARD_LOWER_COL,
    ADMIN_DASHBOARD_LOWER_GRID,
    ADMIN_DASHBOARD_PAGE,
    ADMIN_DASHBOARD_SECTION_LABEL,
    ADMIN_DASHBOARD_STACK,
} from "@/components/admin/dashboard/adminDashboardPresentation";
import { ADMIN_DASHBOARD_CATALOG_ALERT } from "@/components/admin/catalog/adminCatalogPresentation";
import { ADMIN_USERS_COPY } from "@/components/admin/users/adminUsersPresentation";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import {
    getAthleteDisplayFirstName,
} from "@nexia/shared/utils/athlete/athleteProfileDisplay";
import { useGetCatalogHealthQuery } from "@nexia/shared/api/adminApi";
import type { RootState } from "@nexia/shared/store";

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
                    subtitle="Usuarios, catálogo, auditoría y tu cuenta de administrador"
                />

                {mappingGaps > 0 ? (
                    <Alert
                        variant="error"
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => navigate("/dashboard/admin/catalog")}
                            >
                                {ADMIN_DASHBOARD_CATALOG_ALERT.cta}
                            </Button>
                        }
                    >
                        <span className="font-semibold">
                            {mappingGaps === 1
                                ? ADMIN_DASHBOARD_CATALOG_ALERT.titleSingular(mappingGaps)
                                : ADMIN_DASHBOARD_CATALOG_ALERT.titlePlural(mappingGaps)}
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {ADMIN_DASHBOARD_CATALOG_ALERT.body}
                        </p>
                    </Alert>
                ) : null}

                <div className={ADMIN_DASHBOARD_LOWER_GRID}>
                    <div className={cn(ADMIN_DASHBOARD_ACTIONS_COL, ADMIN_DASHBOARD_LOWER_COL)}>
                        <AthleteSettingsSection title="Acciones rápidas" stretch>
                            <AthleteSettingsRow
                                icon={Users}
                                label={ADMIN_USERS_COPY.dashboardUsers}
                                hint={ADMIN_USERS_COPY.dashboardUsersHint}
                                onClick={() => navigate("/dashboard/admin/users")}
                            />
                            <AthleteSettingsRow
                                icon={ScrollText}
                                label={ADMIN_USERS_COPY.dashboardAudit}
                                hint={ADMIN_USERS_COPY.dashboardAuditHint}
                                onClick={() => navigate("/dashboard/admin/operations/audit")}
                            />
                            <AthleteSettingsRow
                                icon={Dumbbell}
                                label={ADMIN_DASHBOARD_CATALOG_ALERT.catalogLabel}
                                hint={
                                    mappingGaps > 0
                                        ? ADMIN_DASHBOARD_CATALOG_ALERT.catalogHintGaps(mappingGaps)
                                        : ADMIN_DASHBOARD_CATALOG_ALERT.catalogHintOk
                                }
                                onClick={() => navigate("/dashboard/admin/catalog")}
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
                        <section className="space-y-3" aria-label="Resumen">
                            <p className={ADMIN_DASHBOARD_SECTION_LABEL}>Resumen</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Los indicadores globales de usuarios, entrenadores y uptime se
                                mostrarán cuando existan endpoints de producto. El estado del
                                catálogo usa{" "}
                                <code className="text-xs">GET /admin/catalog-health</code>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * AdminDashboard.tsx — Inicio admin con KPIs reales (Portal Admin D1).
 */

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ScrollText, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDashboardHeader } from "@/components/admin/dashboard/AdminDashboardHeader";
import { AdminDashboardKpiCard } from "@/components/admin/dashboard/AdminDashboardKpiCard";
import { AdminDashboardWidget } from "@/components/admin/dashboard/AdminDashboardWidget";
import { useAdminDashboard } from "@/components/admin/dashboard/useAdminDashboard";
import {
    ADMIN_DASHBOARD_ACTIONS_COL,
    ADMIN_DASHBOARD_ACTIVITY_COL,
    ADMIN_DASHBOARD_COPY,
    ADMIN_DASHBOARD_GLOW,
    ADMIN_DASHBOARD_KPI_GRID,
    ADMIN_DASHBOARD_LOWER_COL,
    ADMIN_DASHBOARD_LOWER_GRID,
    ADMIN_DASHBOARD_PAGE,
    ADMIN_DASHBOARD_SECTION_LABEL,
    ADMIN_DASHBOARD_STACK,
    ADMIN_DASHBOARD_WIDGET_GRID,
} from "@/components/admin/dashboard/adminDashboardPresentation";
import { ADMIN_DASHBOARD_CATALOG_ALERT } from "@/components/admin/catalog/adminCatalogPresentation";
import { ADMIN_USERS_COPY } from "@/components/admin/users/adminUsersPresentation";
import { formatAdminDateTime } from "@/components/admin/users/adminUsersPresentation";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { getAthleteDisplayFirstName } from "@nexia/shared/utils/athlete/athleteProfileDisplay";
import type { RootState } from "@nexia/shared/store";

function roleLabel(role: string): string {
    switch (role) {
        case "admin":
            return "Admins";
        case "trainer":
            return "Entrenadores";
        case "athlete":
            return "Atletas";
        default:
            return role;
    }
}

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const firstName = getAthleteDisplayFirstName(user?.nombre ?? "Admin");
    const dash = useAdminDashboard();

    const mappingGaps = dash.catalog.data?.missing_muscle_mapping_count ?? 0;

    const roleEntries = useMemo(() => {
        const usersByRole = dash.summary.data?.users_by_role ?? {};
        const order = ["admin", "trainer", "athlete"] as const;
        const known = order.filter((role) => usersByRole[role] != null);
        const extras = Object.keys(usersByRole).filter(
            (role) => !order.includes(role as (typeof order)[number])
        );
        return { usersByRole, roles: [...known, ...extras] };
    }, [dash.summary.data?.users_by_role]);

    const orgEntries = useMemo(() => {
        const orgsByTier = dash.summary.data?.orgs_by_tier ?? {};
        return Object.entries(orgsByTier).sort(([a], [b]) => a.localeCompare(b));
    }, [dash.summary.data?.orgs_by_tier]);

    return (
        <div className={ADMIN_DASHBOARD_PAGE} data-testid="admin-dashboard-d1">
            <div className={ADMIN_DASHBOARD_GLOW} aria-hidden />

            <div className={ADMIN_DASHBOARD_STACK}>
                <AdminDashboardHeader
                    firstName={firstName}
                    subtitle={ADMIN_DASHBOARD_COPY.subtitle}
                />

                {!dash.catalog.isError && mappingGaps > 0 ? (
                    <Alert
                        variant="error"
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => navigate(dash.links.catalog)}
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

                <div className={ADMIN_DASHBOARD_WIDGET_GRID}>
                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.usersTitle}
                        isLoading={dash.summary.isLoading}
                        isError={dash.summary.isError}
                        onRetry={dash.summary.refetch}
                        data-testid="admin-dash-users"
                    >
                        <div className={ADMIN_DASHBOARD_KPI_GRID}>
                            {roleEntries.roles.map((role) => {
                                const counts = roleEntries.usersByRole[role] ?? {
                                    active: 0,
                                    suspended: 0,
                                };
                                const typedRole =
                                    role === "admin" || role === "trainer" || role === "athlete"
                                        ? role
                                        : null;
                                return (
                                    <AdminDashboardKpiCard
                                        key={role}
                                        value={String(counts.active + counts.suspended)}
                                        label={roleLabel(role)}
                                        hint={`${counts.active} activos · ${counts.suspended} suspendidos`}
                                        onClick={
                                            typedRole
                                                ? () => dash.go(dash.links.usersRole(typedRole))
                                                : undefined
                                        }
                                    />
                                );
                            })}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => dash.go(dash.links.usersStatus("active"))}
                            >
                                Activos
                            </Button>
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => dash.go(dash.links.usersStatus("suspended"))}
                            >
                                Suspendidos
                            </Button>
                        </div>
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.signupsTitle}
                        isLoading={dash.summary.isLoading}
                        isError={dash.summary.isError}
                        onRetry={dash.summary.refetch}
                        data-testid="admin-dash-signups"
                    >
                        <p className="mb-3 text-xs text-muted-foreground">
                            {ADMIN_DASHBOARD_COPY.signupsHint}
                        </p>
                        <div className="space-y-3 text-sm">
                            {(
                                [
                                    ["admin", "Admins"],
                                    ["trainer", "Entrenadores"],
                                    ["athlete", "Atletas"],
                                ] as const
                            ).map(([role, label]) => (
                                <button
                                    key={role}
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-surface-2/50"
                                    onClick={() => dash.go(dash.links.usersRole(role))}
                                >
                                    <span className="font-medium">{label}</span>
                                    <span className="text-muted-foreground">
                                        7d: {dash.summary.data?.signups_7d[role] ?? 0} · 30d:{" "}
                                        {dash.summary.data?.signups_30d[role] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.trainersClientsTitle}
                        isLoading={dash.summary.isLoading}
                        isError={dash.summary.isError}
                        onRetry={dash.summary.refetch}
                        data-testid="admin-dash-trainers-clients"
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <AdminDashboardKpiCard
                                value={String(dash.summary.data?.trainers_with_clients ?? 0)}
                                label={ADMIN_DASHBOARD_COPY.trainersWithClients}
                                hint={ADMIN_DASHBOARD_COPY.usersHint}
                                onClick={() => dash.go(dash.links.usersRole("trainer"))}
                            />
                            <AdminDashboardKpiCard
                                value={String(dash.summary.data?.active_clients ?? 0)}
                                label={ADMIN_DASHBOARD_COPY.activeClients}
                                hint="client_profiles.is_active"
                                onClick={() =>
                                    dash.go(dash.links.usersRoleStatus("athlete", "active"))
                                }
                            />
                        </div>
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.sessionsTitle}
                        isLoading={dash.summary.isLoading}
                        isError={dash.summary.isError}
                        onRetry={dash.summary.refetch}
                        data-testid="admin-dash-sessions"
                    >
                        <AdminDashboardKpiCard
                            value={String(dash.summary.data?.sessions_completed_7d ?? 0)}
                            label="Sesiones completadas (7d)"
                            hint={ADMIN_DASHBOARD_COPY.sessionsHint}
                        />
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.orgsTitle}
                        isLoading={dash.summary.isLoading}
                        isError={dash.summary.isError}
                        onRetry={dash.summary.refetch}
                        data-testid="admin-dash-orgs"
                    >
                        <p className="mb-3 text-xs text-muted-foreground">
                            {ADMIN_DASHBOARD_COPY.orgsHint}
                        </p>
                        {orgEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin organizaciones.</p>
                        ) : (
                            <ul className="space-y-2">
                                {orgEntries.map(([tier, count]) => (
                                    <li key={tier}>
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-2/50"
                                            onClick={() => dash.go(dash.links.orgsPlan(tier))}
                                        >
                                            <span className="font-medium">{tier}</span>
                                            <span className="text-muted-foreground">{count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className="mt-3"
                            onClick={() => dash.go(dash.links.orgs)}
                        >
                            {ADMIN_DASHBOARD_COPY.openOrgs}
                        </Button>
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.catalogTitle}
                        isLoading={dash.catalog.isLoading}
                        isError={dash.catalog.isError}
                        onRetry={dash.catalog.refetch}
                        data-testid="admin-dash-catalog"
                    >
                        <AdminDashboardKpiCard
                            value={String(mappingGaps)}
                            label="Gaps de mapeo muscular"
                            hint={
                                mappingGaps > 0
                                    ? ADMIN_DASHBOARD_CATALOG_ALERT.catalogHintGaps(mappingGaps)
                                    : ADMIN_DASHBOARD_COPY.catalogOk
                            }
                            onClick={() => dash.go(dash.links.catalog)}
                        />
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className="mt-3"
                            onClick={() => dash.go(dash.links.catalog)}
                        >
                            {ADMIN_DASHBOARD_COPY.openCatalog}
                        </Button>
                    </AdminDashboardWidget>

                    <AdminDashboardWidget
                        title={ADMIN_DASHBOARD_COPY.auditTitle}
                        isLoading={dash.audit.isLoading}
                        isError={dash.audit.isError}
                        onRetry={dash.audit.refetch}
                        data-testid="admin-dash-audit"
                    >
                        {dash.audit.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {ADMIN_DASHBOARD_COPY.auditEmpty}
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {dash.audit.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="rounded-xl border border-border/40 px-3 py-2"
                                    >
                                        <p className="font-medium">{item.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatAdminDateTime(item.created_at)}
                                            {item.target_user_id
                                                ? ` · user #${item.target_user_id}`
                                                : ""}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className="mt-3"
                            onClick={() => dash.go(dash.links.audit)}
                        >
                            {ADMIN_DASHBOARD_COPY.openAudit}
                        </Button>
                    </AdminDashboardWidget>
                </div>

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
                                    dash.catalog.isError
                                        ? "No se pudo cargar la salud del catálogo"
                                        : mappingGaps > 0
                                          ? ADMIN_DASHBOARD_CATALOG_ALERT.catalogHintGaps(
                                                mappingGaps
                                            )
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
                            <p className={ADMIN_DASHBOARD_SECTION_LABEL}>Cómo se miden</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Activo/suspendido en usuarios sigue{" "}
                                <code className="text-xs">users.is_active</code>. Clientes activos
                                usan <code className="text-xs">client_profiles.is_active</code>.
                                Sesiones completadas filtran{" "}
                                <code className="text-xs">status=completed</code> en 7 días. El
                                plan de organización se consulta en solo lectura (decisión 9).
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * AdminUserDetailPage.tsx — Ficha de soporte de usuario Admin (U2).
 */

import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    useGetAdminUserQuery,
    useListAdminAuditLogQuery,
    useListAdminUsersQuery,
} from "@nexia/shared/api/adminUsersApi";
import type { RootState } from "@nexia/shared/store";
import { useToast } from "@/components/ui/feedback";
import { AdminUserReasonModal } from "@/components/admin/users/AdminUserReasonModal";
import { AdminSetPasswordModal } from "@/components/admin/users/AdminSetPasswordModal";
import { useAdminUserActions } from "@/components/admin/users/useAdminUserActions";
import {
    ADMIN_USERS_ALERT_SPACING,
    ADMIN_USERS_AUDIT_LIST,
    ADMIN_USERS_AUDIT_ROW,
    ADMIN_USERS_BACK_BUTTON,
    ADMIN_USERS_COPY,
    ADMIN_USERS_DETAIL_ACTIONS,
    ADMIN_USERS_DETAIL_CARD,
    ADMIN_USERS_DETAIL_CARD_TITLE,
    ADMIN_USERS_DETAIL_GRID,
    ADMIN_USERS_DETAIL_HINT,
    ADMIN_USERS_GLOW,
    ADMIN_USERS_HEADER_ACTIONS,
    ADMIN_USERS_LOADING_ROW,
    ADMIN_USERS_PAGE_HEADER,
    ADMIN_USERS_STACK,
    ADMIN_USERS_TABLE_CARD,
    ADMIN_USERS_TITLE_WRAP,
    formatAdminAuditAction,
    formatAdminDateTime,
    formatAdminUserRole,
} from "@/components/admin/users/adminUsersPresentation";

export const AdminUserDetailPage: React.FC = () => {
    const { userId: userIdParam } = useParams<{ userId: string }>();
    const userId = Number(userIdParam);
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const skip = !Number.isFinite(userId) || userId <= 0;

    const { data: user, isLoading, isError, refetch } = useGetAdminUserQuery(userId, { skip });

    const { data: adminCountPage } = useListAdminUsersQuery(
        { page: 1, page_size: 1, role: "admin", status: "active" },
        { skip: skip || user?.role !== "admin" }
    );

    const { data: auditPage } = useListAdminAuditLogQuery(
        { page: 1, page_size: 10, target_user_id: userId },
        { skip }
    );

    const actions = useAdminUserActions({
        userId,
        currentUserId: currentUser?.id,
        userDetail: user,
        activeAdminTotal: adminCountPage?.total,
        onSuccess: (msg) => showSuccess(msg),
        onError: () => showError("No se pudo completar la acción."),
    });

    const title = useMemo(() => user?.full_name ?? user?.email ?? ADMIN_USERS_COPY.detailTitle, [user]);

    if (skip) {
        return (
            <Alert variant="error" className={ADMIN_USERS_ALERT_SPACING}>
                Identificador de usuario no válido.
            </Alert>
        );
    }

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-user-detail">
            <div className={ADMIN_USERS_GLOW} aria-hidden />
            <div className={ADMIN_USERS_STACK}>
                <div className={ADMIN_USERS_PAGE_HEADER}>
                    <div className={ADMIN_USERS_TITLE_WRAP}>
                        <PageTitle title={title} />
                        {user ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {user.email} · {formatAdminUserRole(user.role)}
                            </p>
                        ) : null}
                    </div>
                    <div className={ADMIN_USERS_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_USERS_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin/users")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_USERS_COPY.backToUsers}
                        </Button>
                    </div>
                </div>

                {isLoading ? <p className={ADMIN_USERS_LOADING_ROW}>Cargando…</p> : null}

                {isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_USERS_ALERT_SPACING}
                        action={
                            <Button type="button" variant="outline-destructive" size="sm" onClick={() => refetch()}>
                                {ADMIN_USERS_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_USERS_COPY.detailLoadError}
                    </Alert>
                ) : null}

                {user ? (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {user.is_active ? (
                                <Badge variant="subtle-success">{ADMIN_USERS_COPY.statusActive}</Badge>
                            ) : (
                                <Badge variant="subtle-destructive">{ADMIN_USERS_COPY.statusSuspended}</Badge>
                            )}
                            {user.locked ? (
                                <Badge variant="subtle-warning">{ADMIN_USERS_COPY.statusLocked}</Badge>
                            ) : null}
                            {user.is_verified ? (
                                <Badge variant="subtle-success">{ADMIN_USERS_COPY.verifiedYes}</Badge>
                            ) : (
                                <Badge variant="subtle-warning">{ADMIN_USERS_COPY.verifiedNo}</Badge>
                            )}
                        </div>

                        <div className={ADMIN_USERS_DETAIL_GRID}>
                            <section className={ADMIN_USERS_DETAIL_CARD}>
                                <NexiaGlassAccentRim />
                                <h2 className={ADMIN_USERS_DETAIL_CARD_TITLE}>{ADMIN_USERS_COPY.sectionAccount}</h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelEmail}</dt>
                                        <dd>{user.email ?? "—"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelSessions}</dt>
                                        <dd>{user.active_refresh_sessions}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelFailedLogins}</dt>
                                        <dd>{user.failed_login_attempts}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelLockout}</dt>
                                        <dd>{formatAdminDateTime(user.lockout_until)}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className={ADMIN_USERS_DETAIL_CARD}>
                                <NexiaGlassAccentRim />
                                <h2 className={ADMIN_USERS_DETAIL_CARD_TITLE}>{ADMIN_USERS_COPY.sectionRelation}</h2>
                                <dl className="space-y-2 text-sm">
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelClients}</dt>
                                        <dd>{user.clients_count ?? "—"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelTrainers}</dt>
                                        <dd>{user.trainers_count ?? "—"}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">{ADMIN_USERS_COPY.labelMemberships}</dt>
                                        <dd>
                                            {user.memberships.length === 0
                                                ? "—"
                                                : user.memberships
                                                      .map(
                                                          (m) =>
                                                              `${m.organization_name} (${m.role}${m.is_active ? "" : ", inactivo"})`
                                                      )
                                                      .join("; ")}
                                        </dd>
                                    </div>
                                </dl>
                            </section>

                            <section className={ADMIN_USERS_DETAIL_CARD}>
                                <NexiaGlassAccentRim />
                                <h2 className={ADMIN_USERS_DETAIL_CARD_TITLE}>{ADMIN_USERS_COPY.sectionSupport}</h2>
                                {actions.suspendBlockReason ? (
                                    <p className={ADMIN_USERS_DETAIL_HINT}>{actions.suspendBlockReason}</p>
                                ) : null}
                                <div className={ADMIN_USERS_DETAIL_ACTIONS}>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() => actions.openAction("force-logout")}
                                    >
                                        {ADMIN_USERS_COPY.actionForceLogout}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setPasswordOpen(true)}
                                    >
                                        {ADMIN_USERS_COPY.actionSetPassword}
                                    </Button>
                                    {user.is_active ? (
                                        <Button
                                            type="button"
                                            variant="outline-destructive"
                                            size="sm"
                                            disabled={Boolean(actions.suspendBlockReason)}
                                            onClick={() => actions.openAction("suspend")}
                                        >
                                            {ADMIN_USERS_COPY.actionSuspend}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => actions.openAction("activate")}
                                        >
                                            {ADMIN_USERS_COPY.actionActivate}
                                        </Button>
                                    )}
                                </div>
                            </section>
                        </div>

                        <section className={ADMIN_USERS_TABLE_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className="border-b border-border/60 px-4 py-3 text-sm font-semibold">
                                {ADMIN_USERS_COPY.sectionAudit}
                            </h2>
                            {auditPage && auditPage.items.length > 0 ? (
                                <div className={ADMIN_USERS_AUDIT_LIST}>
                                    {auditPage.items.map((entry) => (
                                        <div key={entry.id} className={ADMIN_USERS_AUDIT_ROW}>
                                            <div>
                                                <p className="font-medium">{formatAdminAuditAction(entry.action)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatAdminDateTime(entry.created_at)}
                                                    {entry.reason ? ` · ${entry.reason}` : ""}
                                                </p>
                                            </div>
                                            {entry.actor_user_id ? (
                                                <Link
                                                    className="text-xs text-primary hover:underline"
                                                    to={`/dashboard/admin/users/${entry.actor_user_id}`}
                                                >
                                                    Actor #{entry.actor_user_id}
                                                </Link>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="px-4 py-6 text-sm text-muted-foreground">{ADMIN_USERS_COPY.auditEmpty}</p>
                            )}
                            <div className="border-t border-border/60 px-4 py-3">
                                <Button
                                    type="button"
                                    variant="ghost-primary"
                                    size="sm"
                                    onClick={() =>
                                        navigate(`/dashboard/admin/operations/audit?target=${userId}`)
                                    }
                                >
                                    Ver auditoría completa
                                </Button>
                            </div>
                        </section>
                    </>
                ) : null}
            </div>

            <AdminUserReasonModal
                isOpen={actions.pendingAction != null}
                action={actions.pendingAction}
                reason={actions.reason}
                onReasonChange={actions.setReason}
                reasonError={actions.reasonError}
                canSubmit={actions.canSubmitReason}
                isLoading={actions.isMutating}
                onClose={actions.closeAction}
                onConfirm={() => void actions.submitReasonAction()}
            />

            <AdminSetPasswordModal
                isOpen={passwordOpen}
                userId={userId}
                onClose={() => setPasswordOpen(false)}
                onSuccess={() => {
                    setPasswordOpen(false);
                    showSuccess(ADMIN_USERS_COPY.actionSuccess);
                }}
            />
        </div>
    );
};

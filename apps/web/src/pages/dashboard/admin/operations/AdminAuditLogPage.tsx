/**
 * AdminAuditLogPage.tsx — Listado auditoría admin (solo lectura, U2).
 */

import React, { useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { useListAdminAuditLogQuery } from "@nexia/shared/api/adminUsersApi";
import {
    ADMIN_USERS_ALERT_SPACING,
    ADMIN_USERS_AUDIT_LIST,
    ADMIN_USERS_AUDIT_ROW,
    ADMIN_USERS_BACK_BUTTON,
    ADMIN_USERS_COPY,
    ADMIN_USERS_FILTER_ROW,
    ADMIN_USERS_GLOW,
    ADMIN_USERS_HEADER_ACTIONS,
    ADMIN_USERS_PAGE_HEADER,
    ADMIN_USERS_PAGINATION,
    ADMIN_USERS_SKELETON_LIST,
    ADMIN_USERS_SKELETON_ROW,
    ADMIN_USERS_STACK,
    ADMIN_USERS_TABLE_CARD,
    ADMIN_USERS_TITLE_WRAP,
    ADMIN_USERS_TOOLBAR,
    adminUsersFilterClass,
    formatAdminAuditAction,
    formatAdminDateTime,
} from "@/components/admin/users/adminUsersPresentation";
import { ADMIN_SUP_COPY } from "@/components/admin/supervision/adminSupervisionPresentation";

const PAGE_SIZE = 20;
const AUDIT_ACTIONS = [
    "user_view",
    "admin_create",
    "user_suspend",
    "user_activate",
    "user_force_logout",
    "user_set_password",
    "catalog_review",
    "catalog_import_confirm",
    "admin_write",
    "intervention",
    "supervision_read",
] as const;

const SKELETON_ROWS = [0, 1, 2, 3];

export const AdminAuditLogPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const action = searchParams.get("action") ?? "";
    const actorRaw = searchParams.get("actor") ?? "";
    const targetRaw = searchParams.get("target") ?? searchParams.get("target_user_id") ?? "";
    const desde = searchParams.get("desde") ?? "";
    const hasta = searchParams.get("hasta") ?? "";
    const includeSupervision = searchParams.get("include_supervision") === "1";

    const queryParams = useMemo(() => {
        const params: {
            page: number;
            page_size: number;
            action?: string;
            actor_user_id?: number;
            target_user_id?: number;
            desde?: string;
            hasta?: string;
            include_supervision?: boolean;
        } = { page, page_size: PAGE_SIZE };
        if (action) params.action = action;
        const actorId = Number(actorRaw);
        if (actorRaw && Number.isFinite(actorId)) params.actor_user_id = actorId;
        const targetId = Number(targetRaw);
        if (targetRaw && Number.isFinite(targetId)) params.target_user_id = targetId;
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        if (includeSupervision) params.include_supervision = true;
        return params;
    }, [action, actorRaw, targetRaw, desde, hasta, page, includeSupervision]);

    const { data, isLoading, isError, refetch } = useListAdminAuditLogQuery(queryParams);

    const patch = useCallback(
        (updates: Record<string, string | null>, resetPage = false) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (resetPage) next.delete("page");
                    for (const [key, value] of Object.entries(updates)) {
                        if (value == null || value === "") next.delete(key);
                        else next.set(key, value);
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-audit-log">
            <div className={ADMIN_USERS_GLOW} aria-hidden />
            <div className={ADMIN_USERS_STACK}>
                <div className={ADMIN_USERS_PAGE_HEADER}>
                    <div className={ADMIN_USERS_TITLE_WRAP}>
                        <PageTitle title={ADMIN_USERS_COPY.auditTitle} />
                        <p className="mt-1 text-sm text-muted-foreground">{ADMIN_USERS_COPY.auditSubtitle}</p>
                    </div>
                    <div className={ADMIN_USERS_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_USERS_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_USERS_COPY.backToAdmin}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_USERS_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_USERS_FILTER_ROW}>
                        <button
                            type="button"
                            className={adminUsersFilterClass(!action)}
                            aria-pressed={!action}
                            onClick={() => patch({ action: null }, true)}
                        >
                            {ADMIN_USERS_COPY.auditActionAll}
                        </button>
                        {AUDIT_ACTIONS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={adminUsersFilterClass(action === value)}
                                aria-pressed={action === value}
                                onClick={() => patch({ action: value }, true)}
                            >
                                {formatAdminAuditAction(value)}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Input
                            label={ADMIN_USERS_COPY.auditFilterActor}
                            value={actorRaw}
                            onChange={(e) => patch({ actor: e.target.value || null }, true)}
                        />
                        <Input
                            label={ADMIN_USERS_COPY.auditFilterTarget}
                            value={targetRaw}
                            onChange={(e) => patch({ target: e.target.value || null }, true)}
                        />
                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="text-muted-foreground">
                                {ADMIN_USERS_COPY.auditFilterFrom}
                            </span>
                            <input
                                type="datetime-local"
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                value={desde}
                                onChange={(e) =>
                                    patch({ desde: e.target.value || null }, true)
                                }
                            />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="text-muted-foreground">
                                {ADMIN_USERS_COPY.auditFilterTo}
                            </span>
                            <input
                                type="datetime-local"
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                value={hasta}
                                onChange={(e) =>
                                    patch({ hasta: e.target.value || null }, true)
                                }
                            />
                        </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            checked={includeSupervision}
                            onChange={(e) =>
                                patch(
                                    {
                                        include_supervision: e.target.checked ? "1" : null,
                                    },
                                    true
                                )
                            }
                        />
                        {ADMIN_SUP_COPY.auditIncludeSupervision}
                    </label>
                </div>

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
                        {ADMIN_USERS_COPY.listError}
                    </Alert>
                ) : null}

                {!isError ? (
                    <section className={ADMIN_USERS_TABLE_CARD}>
                        <NexiaGlassAccentRim />
                        {isLoading ? (
                            <div className={ADMIN_USERS_SKELETON_LIST}>
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_USERS_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && (data?.items.length ?? 0) === 0 ? (
                            <EmptyState title={ADMIN_USERS_COPY.auditEmpty} description="" />
                        ) : null}

                        {!isLoading && data && data.items.length > 0 ? (
                            <>
                                <div className={ADMIN_USERS_AUDIT_LIST}>
                                    {data.items.map((entry) => (
                                        <div key={entry.id} className={ADMIN_USERS_AUDIT_ROW}>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">{formatAdminAuditAction(entry.action)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatAdminDateTime(entry.created_at)}
                                                </p>
                                                {entry.reason ? (
                                                    <p className="mt-1 text-sm text-foreground">{entry.reason}</p>
                                                ) : null}
                                                {entry.request_path ? (
                                                    <p className="text-xs text-muted-foreground">{entry.request_path}</p>
                                                ) : null}
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                                                {entry.target_user_id ? (
                                                    <Link
                                                        to={`/dashboard/admin/users/${entry.target_user_id}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        Usuario #{entry.target_user_id}
                                                    </Link>
                                                ) : null}
                                                {entry.actor_user_id ? (
                                                    <Link
                                                        to={`/dashboard/admin/users/${entry.actor_user_id}`}
                                                        className="text-muted-foreground hover:text-primary hover:underline"
                                                    >
                                                        Actor #{entry.actor_user_id}
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={ADMIN_USERS_PAGINATION}>
                                    <PaginationBar
                                        currentPage={page}
                                        totalPages={totalPages}
                                        totalItems={data?.total ?? 0}
                                        pageSize={PAGE_SIZE}
                                        onPageChange={(p) =>
                                            patch({ page: p <= 1 ? null : String(p) })
                                        }
                                    />
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}
            </div>
        </div>
    );
};

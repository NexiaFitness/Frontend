/**
 * AdminAuditLogPage.tsx — Auditoría admin rediseñada (UX_AUDITORIA.md · Opción A).
 */

import React, { useMemo } from "react";
import { ScrollText } from "lucide-react";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { useGetAdminUserQuery } from "@nexia/shared/api/adminUsersApi";
import { AdminAuditFilters } from "@/components/admin/audit/AdminAuditFilters";
import { AdminAuditLogRow } from "@/components/admin/audit/AdminAuditLogRow";
import {
    ADMIN_AUDIT_ALERT_SPACING,
    ADMIN_AUDIT_BACK_BUTTON,
    ADMIN_AUDIT_CARD_LIST,
    ADMIN_AUDIT_COPY,
    ADMIN_AUDIT_GLOW,
    ADMIN_AUDIT_HEADER_ACTIONS,
    ADMIN_AUDIT_LIST,
    ADMIN_AUDIT_PAGE_HEADER,
    ADMIN_AUDIT_PAGINATION,
    ADMIN_AUDIT_SKELETON_LIST,
    ADMIN_AUDIT_SKELETON_ROW,
    ADMIN_AUDIT_STACK,
    ADMIN_AUDIT_TABLE_CARD,
    ADMIN_AUDIT_TITLE_WRAP,
    formatAdminAuditUserDisplayName,
} from "@/components/admin/audit/adminAuditPresentation";
import {
    AUDIT_PAGE_SIZE,
    useAdminAuditLogPage,
    type AuditPeriodPreset,
} from "@/components/admin/audit/useAdminAuditLogPage";
import type { AdminAuditVisibility } from "@nexia/shared/types/adminUsers";
const SKELETON_ROWS = [0, 1, 2, 3];

export const AdminAuditLogPage: React.FC = () => {
    const { goBack } = useReturnToOrigin({ fallbackPath: "/dashboard/admin" });
    const audit = useAdminAuditLogPage();

    const { data: targetUser } = useGetAdminUserQuery(audit.targetUserId ?? 0, {
        skip: audit.targetUserId == null,
    });
    const { data: actorUser } = useGetAdminUserQuery(audit.actorUserId ?? 0, {
        skip: audit.actorUserId == null,
    });

    const displayChips = useMemo(() => {
        return audit.activeChips.map((chip) => {
            if (chip.key === "target" && targetUser) {
                return {
                    ...chip,
                    label: ADMIN_AUDIT_COPY.chipTarget(
                        formatAdminAuditUserDisplayName(targetUser, targetUser.id),
                        targetUser.role
                    ),
                };
            }
            if (chip.key === "actor" && actorUser) {
                return {
                    ...chip,
                    label: ADMIN_AUDIT_COPY.chipActor(
                        formatAdminAuditUserDisplayName(actorUser, actorUser.id)
                    ),
                };
            }
            return chip;
        });
    }, [audit.activeChips, targetUser, actorUser]);

    const emptyState = useMemo(() => {
        if (audit.hasActiveFilters) {
            return {
                title: ADMIN_AUDIT_COPY.emptyFiltersTitle,
                description: audit.visibility === "actions"
                    ? `${ADMIN_AUDIT_COPY.emptyFiltersBody} ${ADMIN_AUDIT_COPY.emptyReadsHint}`
                    : ADMIN_AUDIT_COPY.emptyFiltersBody,
                action: (
                    <Button type="button" variant="ghost-primary" size="sm" onClick={audit.clearFilters}>
                        {ADMIN_AUDIT_COPY.clearFilters}
                    </Button>
                ),
            };
        }
        return {
            title: ADMIN_AUDIT_COPY.emptyGlobalTitle,
            description: ADMIN_AUDIT_COPY.emptyGlobalBody,
            action: undefined,
        };
    }, [audit.hasActiveFilters, audit.visibility, audit.clearFilters]);

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-audit-log">
            <div className={ADMIN_AUDIT_GLOW} aria-hidden />
            <div className={ADMIN_AUDIT_STACK}>
                <div className={ADMIN_AUDIT_PAGE_HEADER}>
                    <div className={ADMIN_AUDIT_TITLE_WRAP}>
                        <PageTitle title={ADMIN_AUDIT_COPY.title} />
                        <p className="mt-1 text-sm text-muted-foreground">{ADMIN_AUDIT_COPY.subtitle}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{ADMIN_AUDIT_COPY.hint}</p>
                    </div>
                    <div className={ADMIN_AUDIT_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_AUDIT_BACK_BUTTON}
                            onClick={() => goBack()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_AUDIT_COPY.backToAdmin}
                        </Button>
                    </div>
                </div>

                <AdminAuditFilters
                    targetUserId={audit.targetUserId}
                    actorUserId={audit.actorUserId}
                    action={audit.action}
                    visibility={audit.visibility}
                    period={audit.period}
                    desde={audit.desde ?? ""}
                    hasta={audit.hasta ?? ""}
                    hasActiveFilters={audit.hasActiveFilters}
                    activeChips={displayChips}
                    onTargetChange={(id) =>
                        audit.patch(
                            { target: id != null ? String(id) : null, target_user_id: null },
                            true
                        )
                    }
                    onActorChange={(id) =>
                        audit.patch({ actor: id != null ? String(id) : null }, true)
                    }
                    onActionChange={(a) => audit.patch({ action: a }, true)}
                    onVisibilityChange={(v: AdminAuditVisibility) =>
                        audit.patch({ visibility: v === "actions" ? null : v }, true)
                    }
                    onPeriodChange={(p: AuditPeriodPreset) =>
                        audit.patch(
                            {
                                period: p === "all" ? null : p,
                                desde: p === "custom" ? audit.desde || null : null,
                                hasta: p === "custom" ? audit.hasta || null : null,
                            },
                            true
                        )
                    }
                    onDesdeChange={(v) => audit.patch({ desde: v, period: "custom" }, true)}
                    onHastaChange={(v) => audit.patch({ hasta: v, period: "custom" }, true)}
                    onClearAll={audit.clearFilters}
                />

                {audit.isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_AUDIT_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => audit.refetch()}
                            >
                                {ADMIN_AUDIT_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_AUDIT_COPY.listError}
                    </Alert>
                ) : null}

                {!audit.isError ? (
                    <section className={ADMIN_AUDIT_TABLE_CARD}>
                        <NexiaGlassAccentRim />
                        {audit.isLoading ? (
                            <div className={ADMIN_AUDIT_SKELETON_LIST}>
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_AUDIT_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!audit.isLoading && (audit.data?.items.length ?? 0) === 0 ? (
                            <EmptyState
                                icon={<ScrollText aria-hidden />}
                                title={emptyState.title}
                                description={emptyState.description}
                                action={emptyState.action}
                            />
                        ) : null}

                        {!audit.isLoading && audit.data && audit.data.items.length > 0 ? (
                            <>
                                <div className={`hidden md:block ${ADMIN_AUDIT_LIST}`}>
                                    {audit.data.items.map((entry) => (
                                        <AdminAuditLogRow key={entry.id} entry={entry} variant="row" />
                                    ))}
                                </div>
                                <div className={ADMIN_AUDIT_CARD_LIST}>
                                    {audit.data.items.map((entry) => (
                                        <AdminAuditLogRow key={entry.id} entry={entry} variant="card" />
                                    ))}
                                </div>
                                <div className={ADMIN_AUDIT_PAGINATION}>
                                    <PaginationBar
                                        currentPage={audit.page}
                                        totalPages={audit.totalPages}
                                        totalItems={audit.data.total}
                                        pageSize={AUDIT_PAGE_SIZE}
                                        onPageChange={(p) =>
                                            audit.patch({ page: p <= 1 ? null : String(p) })
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

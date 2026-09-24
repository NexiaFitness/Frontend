/**
 * AdminUsersListPage.tsx — Listado de usuarios Admin (U2).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SearchBar } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { useAdminUsersList } from "@/components/admin/users/useAdminUsersList";
import { AdminCreateAdminModal } from "@/components/admin/users/AdminCreateAdminModal";
import {
    adminUsersFilterClass,
    ADMIN_USERS_ALERT_SPACING,
    ADMIN_USERS_BACK_BUTTON,
    ADMIN_USERS_CARD_ITEM,
    ADMIN_USERS_CARD_LIST,
    ADMIN_USERS_CARD_META,
    ADMIN_USERS_CARD_TITLE_ROW,
    ADMIN_USERS_COPY,
    ADMIN_USERS_FILTER_ROW,
    ADMIN_USERS_GLOW,
    ADMIN_USERS_HEADER_ACTIONS,
    ADMIN_USERS_PAGE_HEADER,
    ADMIN_USERS_PAGINATION,
    ADMIN_USERS_SKELETON_LIST,
    ADMIN_USERS_SKELETON_ROW,
    ADMIN_USERS_STACK,
    ADMIN_USERS_TABLE,
    ADMIN_USERS_TABLE_CARD,
    ADMIN_USERS_TABLE_SCROLL,
    ADMIN_USERS_TD,
    ADMIN_USERS_TD_MUTED,
    ADMIN_USERS_TD_NAME,
    ADMIN_USERS_TH,
    ADMIN_USERS_TITLE_WRAP,
    ADMIN_USERS_TOOLBAR,
    ADMIN_USERS_TOOLBAR_SEARCH,
    ADMIN_USERS_TR,
    ADMIN_USERS_TR_INACTIVE,
    formatAdminDateTime,
    formatAdminUserRole,
} from "@/components/admin/users/adminUsersPresentation";

const SKELETON_ROWS = [0, 1, 2, 3, 4];

function UserStatusBadges({
    isActive,
    locked,
    role,
}: {
    isActive: boolean;
    locked: boolean;
    role: string;
}) {
    return (
        <div className="flex flex-wrap gap-1">
            {role === "admin" ? <Badge variant="default">{ADMIN_USERS_COPY.roleAdmin}</Badge> : null}
            {locked ? (
                <Badge variant="subtle-warning">{ADMIN_USERS_COPY.statusLocked}</Badge>
            ) : isActive ? (
                <Badge variant="subtle-success">{ADMIN_USERS_COPY.statusActive}</Badge>
            ) : (
                <Badge variant="subtle-destructive">{ADMIN_USERS_COPY.statusSuspended}</Badge>
            )}
        </div>
    );
}

export const AdminUsersListPage: React.FC = () => {
    const navigate = useNavigate();
    const [createOpen, setCreateOpen] = useState(false);
    const {
        searchInput,
        setSearchInput,
        roleSegment,
        setRoleSegment,
        statusSegment,
        setStatusSegment,
        verifiedSegment,
        setVerifiedSegment,
        hasActiveFilters,
        clearFilters,
        items,
        total,
        isLoading,
        isError,
        refetch,
        page,
        setPage,
        totalPages,
        pageSize,
        openUser,
    } = useAdminUsersList();

    const renderVerified = (isVerified: boolean) =>
        isVerified ? (
            <Badge variant="subtle-success">{ADMIN_USERS_COPY.verifiedYes}</Badge>
        ) : (
            <Badge variant="subtle-warning">{ADMIN_USERS_COPY.verifiedNo}</Badge>
        );

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-users-list">
            <div className={ADMIN_USERS_GLOW} aria-hidden />
            <div className={ADMIN_USERS_STACK}>
                <div className={ADMIN_USERS_PAGE_HEADER}>
                    <div className={ADMIN_USERS_TITLE_WRAP}>
                        <PageTitle title={ADMIN_USERS_COPY.listTitle} />
                        <p className="mt-1 text-sm text-muted-foreground">
                            {ADMIN_USERS_COPY.listSubtitle(total)}
                        </p>
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
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_USERS_COPY.listNewAdmin}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_USERS_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_USERS_TOOLBAR_SEARCH}>
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder={ADMIN_USERS_COPY.searchPlaceholder}
                            ariaLabel={ADMIN_USERS_COPY.searchLabel}
                        />
                    </div>
                    <div className={ADMIN_USERS_FILTER_ROW}>
                        {(
                            [
                                ["all", ADMIN_USERS_COPY.filterRoleAll],
                                ["trainer", ADMIN_USERS_COPY.filterRoleTrainer],
                                ["athlete", ADMIN_USERS_COPY.filterRoleAthlete],
                                ["admin", ADMIN_USERS_COPY.filterRoleAdmin],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={roleSegment === value}
                                className={adminUsersFilterClass(roleSegment === value)}
                                onClick={() => setRoleSegment(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className={ADMIN_USERS_FILTER_ROW}>
                        {(
                            [
                                ["all", ADMIN_USERS_COPY.filterStatusAll],
                                ["active", ADMIN_USERS_COPY.filterStatusActive],
                                ["suspended", ADMIN_USERS_COPY.filterStatusSuspended],
                                ["locked", ADMIN_USERS_COPY.filterStatusLocked],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={statusSegment === value}
                                className={adminUsersFilterClass(statusSegment === value)}
                                onClick={() => setStatusSegment(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className={ADMIN_USERS_FILTER_ROW}>
                        {(
                            [
                                ["all", ADMIN_USERS_COPY.filterVerifiedAll],
                                ["yes", ADMIN_USERS_COPY.filterVerifiedYes],
                                ["no", ADMIN_USERS_COPY.filterVerifiedNo],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={verifiedSegment === value}
                                className={adminUsersFilterClass(verifiedSegment === value)}
                                onClick={() => setVerifiedSegment(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
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
                            <div className={ADMIN_USERS_SKELETON_LIST} aria-busy="true">
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_USERS_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && items.length === 0 ? (
                            <EmptyState
                                title={ADMIN_USERS_COPY.listEmptyTitle}
                                description={ADMIN_USERS_COPY.listEmptyBody}
                                action={
                                    hasActiveFilters ? (
                                        <Button type="button" variant="ghost-primary" size="sm" onClick={clearFilters}>
                                            {ADMIN_USERS_COPY.listClearFilters}
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : null}

                        {!isLoading && items.length > 0 ? (
                            <>
                                <div className={ADMIN_USERS_TABLE_SCROLL}>
                                    <table className={ADMIN_USERS_TABLE}>
                                        <thead>
                                            <tr>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colName}</th>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colRole}</th>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colStatus}</th>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colVerified}</th>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colOrg}</th>
                                                <th className={ADMIN_USERS_TH}>{ADMIN_USERS_COPY.colCreated}</th>
                                                <th className={ADMIN_USERS_TH}>
                                                    <span className="sr-only">{ADMIN_USERS_COPY.colOpen}</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    data-testid={`admin-users-row-${item.id}`}
                                                    className={
                                                        item.is_active ? ADMIN_USERS_TR : ADMIN_USERS_TR_INACTIVE
                                                    }
                                                    tabIndex={0}
                                                    onClick={() => openUser(item.id)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter" || event.key === " ") {
                                                            event.preventDefault();
                                                            openUser(item.id);
                                                        }
                                                    }}
                                                >
                                                    <td className={ADMIN_USERS_TD_NAME}>
                                                        <div>{item.full_name ?? "—"}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.email ?? "—"}
                                                        </div>
                                                    </td>
                                                    <td className={ADMIN_USERS_TD}>{formatAdminUserRole(item.role)}</td>
                                                    <td className={ADMIN_USERS_TD}>
                                                        <UserStatusBadges
                                                            isActive={item.is_active}
                                                            locked={item.locked}
                                                            role={item.role}
                                                        />
                                                    </td>
                                                    <td className={ADMIN_USERS_TD}>{renderVerified(item.is_verified)}</td>
                                                    <td className={ADMIN_USERS_TD_MUTED}>
                                                        {item.organization?.name ?? "—"}
                                                    </td>
                                                    <td className={ADMIN_USERS_TD_MUTED}>
                                                        {formatAdminDateTime(item.created_at)}
                                                    </td>
                                                    <td className={ADMIN_USERS_TD_MUTED}>
                                                        <ChevronRight className="h-4 w-4" aria-hidden />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={ADMIN_USERS_CARD_LIST}>
                                    {items.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            data-testid={`admin-users-card-${item.id}`}
                                            className={ADMIN_USERS_CARD_ITEM}
                                            onClick={() => openUser(item.id)}
                                        >
                                            <div className={ADMIN_USERS_CARD_TITLE_ROW}>
                                                <span>{item.full_name ?? item.email ?? `#${item.id}`}</span>
                                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            </div>
                                            <p className={ADMIN_USERS_CARD_META}>{item.email}</p>
                                            <UserStatusBadges
                                                isActive={item.is_active}
                                                locked={item.locked}
                                                role={item.role}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div className={ADMIN_USERS_PAGINATION}>
                                    <PaginationBar
                                        currentPage={page}
                                        totalPages={totalPages}
                                        totalItems={total}
                                        pageSize={pageSize}
                                        onPageChange={setPage}
                                    />
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}
            </div>

            <AdminCreateAdminModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={(userId) => {
                    setCreateOpen(false);
                    navigate(`/dashboard/admin/users/${userId}`);
                }}
            />
        </div>
    );
};

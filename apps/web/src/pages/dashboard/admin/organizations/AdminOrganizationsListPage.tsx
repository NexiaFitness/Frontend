/**
 * AdminOrganizationsListPage.tsx — Listado organizaciones (G1, solo lectura).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { useAdminOrganizationsList } from "@/components/admin/organizations/useAdminOrganizationsList";
import {
    ADMIN_ORGS_ALERT_SPACING,
    ADMIN_ORGS_BACK_BUTTON,
    ADMIN_ORGS_CARD_ITEM,
    ADMIN_ORGS_CARD_LIST,
    ADMIN_ORGS_CARD_META,
    ADMIN_ORGS_CARD_TITLE_ROW,
    ADMIN_ORGS_COPY,
    ADMIN_ORGS_FILTER_ROW,
    ADMIN_ORGS_GLOW,
    ADMIN_ORGS_HEADER_ACTIONS,
    ADMIN_ORGS_PAGE_HEADER,
    ADMIN_ORGS_PAGINATION,
    ADMIN_ORGS_SKELETON_LIST,
    ADMIN_ORGS_SKELETON_ROW,
    ADMIN_ORGS_STACK,
    ADMIN_ORGS_TABLE,
    ADMIN_ORGS_TABLE_CARD,
    ADMIN_ORGS_TABLE_SCROLL,
    ADMIN_ORGS_TD,
    ADMIN_ORGS_TD_MUTED,
    ADMIN_ORGS_TD_NAME,
    ADMIN_ORGS_TH,
    ADMIN_ORGS_TITLE_WRAP,
    ADMIN_ORGS_TOOLBAR,
    ADMIN_ORGS_TOOLBAR_SEARCH,
    ADMIN_ORGS_TR,
    billingBadgeVariant,
    billingLabel,
} from "@/components/admin/organizations/adminOrganizationsPresentation";
import { adminUsersFilterClass } from "@/components/admin/users/adminUsersPresentation";

const SKELETON = [0, 1, 2, 3, 4];

export const AdminOrganizationsListPage: React.FC = () => {
    const navigate = useNavigate();
    const list = useAdminOrganizationsList();

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-organizations-list">
            <div className={ADMIN_ORGS_GLOW} aria-hidden />
            <div className={ADMIN_ORGS_STACK}>
                <div className={ADMIN_ORGS_PAGE_HEADER}>
                    <div className={ADMIN_ORGS_TITLE_WRAP}>
                        <PageTitle title={ADMIN_ORGS_COPY.listTitle} />
                        <p className="mt-1 text-sm text-muted-foreground">
                            {ADMIN_ORGS_COPY.listSubtitle}
                            {list.total > 0 ? ` · ${list.total} en total` : null}
                        </p>
                    </div>
                    <div className={ADMIN_ORGS_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_ORGS_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_ORGS_COPY.backToAdmin}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_ORGS_TABLE_CARD}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_ORGS_TOOLBAR}>
                        <div className={ADMIN_ORGS_TOOLBAR_SEARCH}>
                            <Input
                                label={ADMIN_ORGS_COPY.searchLabel}
                                placeholder={ADMIN_ORGS_COPY.searchPlaceholder}
                                value={list.search}
                                onChange={(e) => list.setSearch(e.target.value)}
                            />
                        </div>
                        <div className={ADMIN_ORGS_FILTER_ROW} role="group" aria-label="Estado">
                            {(
                                [
                                    ["all", ADMIN_ORGS_COPY.filterAll],
                                    ["active", ADMIN_ORGS_COPY.filterActive],
                                    ["inactive", ADMIN_ORGS_COPY.filterInactive],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={adminUsersFilterClass(list.status === value)}
                                    aria-pressed={list.status === value}
                                    onClick={() => list.setStatus(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className={ADMIN_ORGS_FILTER_ROW} role="group" aria-label="Plan">
                            <Input
                                label="Plan"
                                placeholder={ADMIN_ORGS_COPY.filterPlanAll}
                                value={list.plan}
                                onChange={(e) => list.setPlan(e.target.value)}
                            />
                        </div>
                    </div>

                    {list.isError ? (
                        <Alert
                            variant="error"
                            className={ADMIN_ORGS_ALERT_SPACING}
                            action={
                                <Button
                                    type="button"
                                    variant="outline-destructive"
                                    size="sm"
                                    onClick={() => list.refetch()}
                                >
                                    {ADMIN_ORGS_COPY.retry}
                                </Button>
                            }
                        >
                            {ADMIN_ORGS_COPY.loadError}
                        </Alert>
                    ) : null}

                    {!list.isError && list.isLoading ? (
                        <div className={ADMIN_ORGS_SKELETON_LIST}>
                            {SKELETON.map((row) => (
                                <div key={row} className={ADMIN_ORGS_SKELETON_ROW} />
                            ))}
                        </div>
                    ) : null}

                    {!list.isError && !list.isLoading && list.items.length === 0 ? (
                        <EmptyState
                            title={ADMIN_ORGS_COPY.emptyTitle}
                            description={ADMIN_ORGS_COPY.emptyBody}
                        />
                    ) : null}

                    {!list.isError && !list.isLoading && list.items.length > 0 ? (
                        <>
                            <div className={ADMIN_ORGS_TABLE_SCROLL}>
                                <table className={ADMIN_ORGS_TABLE}>
                                    <thead>
                                        <tr>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colName}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colPlan}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colBilling}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colTrainers}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colClients}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                {ADMIN_ORGS_COPY.colGyms}
                                            </th>
                                            <th className={ADMIN_ORGS_TH}>
                                                <span className="sr-only">Abrir</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={ADMIN_ORGS_TR}
                                                onClick={() => list.openOrg(item.id)}
                                            >
                                                <td className={ADMIN_ORGS_TD_NAME}>
                                                    {item.name}
                                                    {item.is_personal ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-2"
                                                        >
                                                            {ADMIN_ORGS_COPY.personalBadge}
                                                        </Badge>
                                                    ) : null}
                                                    {!item.is_active ? (
                                                        <Badge
                                                            variant="subtle-warning"
                                                            className="ml-2"
                                                        >
                                                            {ADMIN_ORGS_COPY.inactiveBadge}
                                                        </Badge>
                                                    ) : null}
                                                </td>
                                                <td className={ADMIN_ORGS_TD}>
                                                    {item.subscription_tier}
                                                </td>
                                                <td className={ADMIN_ORGS_TD}>
                                                    <Badge
                                                        variant={billingBadgeVariant(
                                                            item.billing_status
                                                        )}
                                                    >
                                                        {billingLabel(item.billing_status)}
                                                    </Badge>
                                                </td>
                                                <td className={ADMIN_ORGS_TD_MUTED}>
                                                    {item.trainers_count}
                                                </td>
                                                <td className={ADMIN_ORGS_TD_MUTED}>
                                                    {item.clients_count}
                                                </td>
                                                <td className={ADMIN_ORGS_TD_MUTED}>
                                                    {item.gyms_count}
                                                </td>
                                                <td className={ADMIN_ORGS_TD}>
                                                    <ChevronRight
                                                        className="h-4 w-4 text-muted-foreground"
                                                        aria-hidden
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <ul className={ADMIN_ORGS_CARD_LIST}>
                                {list.items.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            className={ADMIN_ORGS_CARD_ITEM}
                                            onClick={() => list.openOrg(item.id)}
                                        >
                                            <div className={ADMIN_ORGS_CARD_TITLE_ROW}>
                                                <span className="font-medium">{item.name}</span>
                                                <Badge
                                                    variant={billingBadgeVariant(
                                                        item.billing_status
                                                    )}
                                                >
                                                    {billingLabel(item.billing_status)}
                                                </Badge>
                                            </div>
                                            <p className={ADMIN_ORGS_CARD_META}>
                                                {item.subscription_tier} ·{" "}
                                                {item.trainers_count} entr. ·{" "}
                                                {item.clients_count} cli. · {item.gyms_count}{" "}
                                                gyms
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className={ADMIN_ORGS_PAGINATION}>
                                <PaginationBar
                                    currentPage={list.page}
                                    totalPages={list.totalPages}
                                    totalItems={list.total}
                                    pageSize={20}
                                    onPageChange={list.setPage}
                                />
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

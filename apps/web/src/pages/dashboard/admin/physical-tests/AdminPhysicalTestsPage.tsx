/**
 * AdminPhysicalTestsPage.tsx — Listado Admin tests físicos (T2).
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Input, SearchBar } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    useGetAdminPhysicalTestQuery,
    type AdminPhysicalTestOut,
} from "@nexia/shared";
import { useAdminPhysicalTestsList } from "@/components/admin/physical-tests/useAdminPhysicalTestsList";
import { AdminPhysicalTestFormModal } from "@/components/admin/physical-tests/AdminPhysicalTestFormModal";
import { AdminPhysicalTestLifecycleModal } from "@/components/admin/physical-tests/AdminPhysicalTestLifecycleModal";
import {
    ADMIN_PT_ALERT_SPACING,
    ADMIN_PT_BACK_BUTTON,
    ADMIN_PT_CARD_ACTIONS,
    ADMIN_PT_CARD_ITEM,
    ADMIN_PT_CARD_LIST,
    ADMIN_PT_CARD_META,
    ADMIN_PT_CARD_TITLE_ROW,
    ADMIN_PT_COPY,
    ADMIN_PT_FILTER_ROW,
    ADMIN_PT_GLOW,
    ADMIN_PT_HEADER_ACTIONS,
    ADMIN_PT_PAGE_HEADER,
    ADMIN_PT_PAGINATION,
    ADMIN_PT_ROW_ACTIONS,
    ADMIN_PT_SKELETON_LIST,
    ADMIN_PT_SKELETON_ROW,
    ADMIN_PT_STACK,
    ADMIN_PT_TABLE,
    ADMIN_PT_TABLE_CARD,
    ADMIN_PT_TABLE_SCROLL,
    ADMIN_PT_TD,
    ADMIN_PT_TD_MUTED,
    ADMIN_PT_TD_NAME,
    ADMIN_PT_TH,
    ADMIN_PT_TITLE_WRAP,
    ADMIN_PT_TOOLBAR,
    ADMIN_PT_TOOLBAR_SEARCH,
    ADMIN_PT_TR,
    ADMIN_PT_TR_INACTIVE,
    adminPtFilterClass,
    formatPhysicalTestCategory,
} from "@/components/admin/physical-tests/adminPhysicalTestsPresentation";

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export const AdminPhysicalTestsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: idParam } = useParams<{ id?: string }>();
    const deepLinkId = idParam != null ? Number(idParam) : NaN;
    const hasDeepLink = Number.isFinite(deepLinkId) && deepLinkId > 0;

    const {
        searchInput,
        setSearchInput,
        trainerInput,
        setTrainerInput,
        scope,
        setScope,
        includeInactive,
        setIncludeInactive,
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
    } = useAdminPhysicalTestsList();

    const isStandard = scope === "standard";
    const scopeLabel = isStandard
        ? ADMIN_PT_COPY.scopeStandard
        : ADMIN_PT_COPY.scopeTrainer;

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminPhysicalTestOut | null>(null);
    const [lifecycle, setLifecycle] = useState<{
        item: AdminPhysicalTestOut;
        mode: "deactivate" | "reactivate";
    } | null>(null);

    const { data: deepLinkItem } = useGetAdminPhysicalTestQuery(deepLinkId, {
        skip: !hasDeepLink,
    });

    useEffect(() => {
        if (!hasDeepLink || !deepLinkItem) return;
        if (!deepLinkItem.is_standard) {
            setScope("trainer");
            return;
        }
        setEditing(deepLinkItem);
        setFormOpen(true);
    }, [hasDeepLink, deepLinkItem, setScope]);

    const subtitle = useMemo(
        () => ADMIN_PT_COPY.pageSubtitle(total, scopeLabel),
        [total, scopeLabel]
    );

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (item: AdminPhysicalTestOut) => {
        if (!item.is_standard) return;
        setEditing(item);
        setFormOpen(true);
        navigate(`/dashboard/admin/physical-tests/${item.id}`, { replace: true });
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        if (hasDeepLink) {
            navigate("/dashboard/admin/physical-tests", { replace: true });
        }
    };

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-physical-tests-list">
            <div className={ADMIN_PT_GLOW} aria-hidden />
            <div className={ADMIN_PT_STACK}>
                <div className={ADMIN_PT_PAGE_HEADER}>
                    <div className={ADMIN_PT_TITLE_WRAP}>
                        <PageTitle title={ADMIN_PT_COPY.pageTitle} />
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <div className={ADMIN_PT_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_PT_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_PT_COPY.backToAdmin}
                        </Button>
                        {isStandard ? (
                            <Button type="button" variant="primary" size="sm" onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" aria-hidden />
                                {ADMIN_PT_COPY.newStandard}
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className={ADMIN_PT_FILTER_ROW} role="tablist" aria-label={ADMIN_PT_COPY.pageTitle}>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isStandard}
                        className={adminPtFilterClass(isStandard)}
                        onClick={() => setScope("standard")}
                    >
                        {ADMIN_PT_COPY.scopeStandard}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isStandard}
                        className={adminPtFilterClass(!isStandard)}
                        onClick={() => setScope("trainer")}
                    >
                        {ADMIN_PT_COPY.scopeTrainer}
                    </button>
                </div>

                {!isStandard ? (
                    <p className="text-sm text-muted-foreground">{ADMIN_PT_COPY.readOnlyTrainer}</p>
                ) : null}

                <div className={ADMIN_PT_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_PT_TOOLBAR_SEARCH}>
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder={ADMIN_PT_COPY.searchPlaceholder}
                            ariaLabel={ADMIN_PT_COPY.searchLabel}
                        />
                    </div>
                    <div className={ADMIN_PT_FILTER_ROW}>
                        <button
                            type="button"
                            aria-pressed={includeInactive}
                            className={adminPtFilterClass(includeInactive)}
                            onClick={() => setIncludeInactive(!includeInactive)}
                        >
                            {ADMIN_PT_COPY.includeInactive}
                        </button>
                        {!isStandard ? (
                            <Input
                                value={trainerInput}
                                onChange={(e) => setTrainerInput(e.target.value)}
                                placeholder={ADMIN_PT_COPY.trainerIdPlaceholder}
                                aria-label={ADMIN_PT_COPY.trainerIdLabel}
                                className="w-36"
                            />
                        ) : null}
                    </div>
                </div>

                {isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_PT_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                {ADMIN_PT_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_PT_COPY.listError}
                    </Alert>
                ) : null}

                {!isError ? (
                    <section className={ADMIN_PT_TABLE_CARD}>
                        <NexiaGlassAccentRim />
                        {isLoading ? (
                            <div className={ADMIN_PT_SKELETON_LIST} aria-busy="true">
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_PT_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && items.length === 0 ? (
                            <EmptyState
                                title={ADMIN_PT_COPY.listEmptyTitle}
                                description={ADMIN_PT_COPY.listEmptyBody}
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            type="button"
                                            variant="ghost-primary"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            {ADMIN_PT_COPY.clearFilters}
                                        </Button>
                                    ) : isStandard ? (
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={openCreate}
                                        >
                                            {ADMIN_PT_COPY.newStandard}
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : null}

                        {!isLoading && items.length > 0 ? (
                            <>
                                <div className={ADMIN_PT_TABLE_SCROLL}>
                                    <table className={ADMIN_PT_TABLE}>
                                        <thead>
                                            <tr>
                                                <th className={ADMIN_PT_TH}>{ADMIN_PT_COPY.colName}</th>
                                                <th className={ADMIN_PT_TH}>
                                                    {ADMIN_PT_COPY.colCategory}
                                                </th>
                                                <th className={ADMIN_PT_TH}>{ADMIN_PT_COPY.colUnit}</th>
                                                <th className={ADMIN_PT_TH}>
                                                    {ADMIN_PT_COPY.colExercise}
                                                </th>
                                                <th className={ADMIN_PT_TH}>
                                                    {ADMIN_PT_COPY.colFrequency}
                                                </th>
                                                {!isStandard ? (
                                                    <th className={ADMIN_PT_TH}>
                                                        {ADMIN_PT_COPY.colTrainer}
                                                    </th>
                                                ) : null}
                                                <th className={ADMIN_PT_TH}>
                                                    {ADMIN_PT_COPY.colResults}
                                                </th>
                                                <th className={ADMIN_PT_TH}>
                                                    {ADMIN_PT_COPY.colStatus}
                                                </th>
                                                {isStandard ? (
                                                    <th className={ADMIN_PT_TH}>
                                                        {ADMIN_PT_COPY.colActions}
                                                    </th>
                                                ) : null}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    data-testid={`admin-pt-row-${item.id}`}
                                                    className={
                                                        item.is_active
                                                            ? ADMIN_PT_TR
                                                            : `${ADMIN_PT_TR} ${ADMIN_PT_TR_INACTIVE}`
                                                    }
                                                >
                                                    <td className={ADMIN_PT_TD_NAME}>{item.name}</td>
                                                    <td className={ADMIN_PT_TD_MUTED}>
                                                        {formatPhysicalTestCategory(item.category)}
                                                    </td>
                                                    <td className={ADMIN_PT_TD_MUTED}>{item.unit}</td>
                                                    <td className={ADMIN_PT_TD_MUTED}>
                                                        {item.primary_exercise_name ??
                                                            ADMIN_PT_COPY.none}
                                                    </td>
                                                    <td className={ADMIN_PT_TD_MUTED}>
                                                        {item.default_frequency_weeks ??
                                                            ADMIN_PT_COPY.none}
                                                    </td>
                                                    {!isStandard ? (
                                                        <td className={ADMIN_PT_TD_MUTED}>
                                                            {item.trainer_label ??
                                                                (item.created_by_trainer_id != null
                                                                    ? `#${item.created_by_trainer_id}`
                                                                    : ADMIN_PT_COPY.none)}
                                                        </td>
                                                    ) : null}
                                                    <td className={ADMIN_PT_TD}>{item.results_count}</td>
                                                    <td className={ADMIN_PT_TD}>
                                                        {item.is_active ? (
                                                            <Badge variant="subtle-success">
                                                                {ADMIN_PT_COPY.statusActive}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="subtle-destructive">
                                                                {ADMIN_PT_COPY.statusInactive}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    {isStandard ? (
                                                        <td className={ADMIN_PT_TD}>
                                                            <div className={ADMIN_PT_ROW_ACTIONS}>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost-primary"
                                                                    size="sm"
                                                                    onClick={() => openEdit(item)}
                                                                >
                                                                    {ADMIN_PT_COPY.edit}
                                                                </Button>
                                                                {item.is_active ? (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline-destructive"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setLifecycle({
                                                                                item,
                                                                                mode: "deactivate",
                                                                            })
                                                                        }
                                                                    >
                                                                        {ADMIN_PT_COPY.deactivate}
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost-primary"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setLifecycle({
                                                                                item,
                                                                                mode: "reactivate",
                                                                            })
                                                                        }
                                                                    >
                                                                        {ADMIN_PT_COPY.reactivate}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    ) : null}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={ADMIN_PT_CARD_LIST}>
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            data-testid={`admin-pt-card-${item.id}`}
                                            className={ADMIN_PT_CARD_ITEM}
                                        >
                                            <div className={ADMIN_PT_CARD_TITLE_ROW}>
                                                <span>{item.name}</span>
                                                {item.is_active ? (
                                                    <Badge variant="subtle-success">
                                                        {ADMIN_PT_COPY.statusActive}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="subtle-destructive">
                                                        {ADMIN_PT_COPY.statusInactive}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className={ADMIN_PT_CARD_META}>
                                                {formatPhysicalTestCategory(item.category)} ·{" "}
                                                {item.unit} · {ADMIN_PT_COPY.colResults}:{" "}
                                                {item.results_count}
                                            </p>
                                            {isStandard ? (
                                                <div className={ADMIN_PT_CARD_ACTIONS}>
                                                    <Button
                                                        type="button"
                                                        variant="ghost-primary"
                                                        size="sm"
                                                        onClick={() => openEdit(item)}
                                                    >
                                                        {ADMIN_PT_COPY.edit}
                                                    </Button>
                                                    {item.is_active ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline-destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                setLifecycle({
                                                                    item,
                                                                    mode: "deactivate",
                                                                })
                                                            }
                                                        >
                                                            {ADMIN_PT_COPY.deactivate}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="ghost-primary"
                                                            size="sm"
                                                            onClick={() =>
                                                                setLifecycle({
                                                                    item,
                                                                    mode: "reactivate",
                                                                })
                                                            }
                                                        >
                                                            {ADMIN_PT_COPY.reactivate}
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>

                                <div className={ADMIN_PT_PAGINATION}>
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

            <AdminPhysicalTestFormModal
                isOpen={formOpen && isStandard}
                item={editing}
                onClose={closeForm}
                onSaved={() => {
                    closeForm();
                }}
            />

            <AdminPhysicalTestLifecycleModal
                isOpen={lifecycle != null}
                item={lifecycle?.item ?? null}
                mode={lifecycle?.mode ?? "deactivate"}
                onClose={() => setLifecycle(null)}
                onDone={() => setLifecycle(null)}
            />
        </div>
    );
};

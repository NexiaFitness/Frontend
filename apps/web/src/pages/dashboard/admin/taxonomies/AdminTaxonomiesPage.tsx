/**
 * AdminTaxonomiesPage.tsx — Listado Admin taxonomías por kind (T2).
 */

import React, { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SearchBar } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    isTaxonomyKind,
    type TaxonomyItemOut,
    type TaxonomyKind,
} from "@nexia/shared/types/adminTaxonomies";
import { useAdminTaxonomiesList } from "@/components/admin/taxonomies/useAdminTaxonomiesList";
import { AdminTaxonomyFormModal } from "@/components/admin/taxonomies/AdminTaxonomyFormModal";
import { AdminTaxonomyDeactivateModal } from "@/components/admin/taxonomies/AdminTaxonomyDeactivateModal";
import {
    AdminTaxonomyImpactModal,
    type AdminTaxonomyImpactPayload,
} from "@/components/admin/taxonomies/AdminTaxonomyImpactModal";
import {
    ADMIN_TAX_ALERT_SPACING,
    ADMIN_TAX_BACK_BUTTON,
    ADMIN_TAX_CARD_ACTIONS,
    ADMIN_TAX_CARD_ITEM,
    ADMIN_TAX_CARD_LIST,
    ADMIN_TAX_CARD_META,
    ADMIN_TAX_CARD_TITLE_ROW,
    ADMIN_TAX_COPY,
    ADMIN_TAX_FILTER_ROW,
    ADMIN_TAX_GLOW,
    ADMIN_TAX_HEADER_ACTIONS,
    ADMIN_TAX_PAGE_HEADER,
    ADMIN_TAX_PAGINATION,
    ADMIN_TAX_ROW_ACTIONS,
    ADMIN_TAX_SKELETON_LIST,
    ADMIN_TAX_SKELETON_ROW,
    ADMIN_TAX_STACK,
    ADMIN_TAX_TABLE,
    ADMIN_TAX_TABLE_CARD,
    ADMIN_TAX_TABLE_SCROLL,
    ADMIN_TAX_TABS,
    ADMIN_TAX_TD,
    ADMIN_TAX_TD_MUTED,
    ADMIN_TAX_TD_NAME,
    ADMIN_TAX_TH,
    ADMIN_TAX_TITLE_WRAP,
    ADMIN_TAX_TOOLBAR,
    ADMIN_TAX_TOOLBAR_SEARCH,
    ADMIN_TAX_TR,
    ADMIN_TAX_TR_INACTIVE,
    TAXONOMY_KIND_LABELS,
    TAXONOMY_KIND_TABS,
    adminTaxFilterClass,
    taxonomyDisplayName,
} from "@/components/admin/taxonomies/adminTaxonomiesPresentation";

const SKELETON_ROWS = [0, 1, 2, 3, 4];
const FALLBACK_KIND: TaxonomyKind = "patterns";

function extraDetail(kind: TaxonomyKind, item: TaxonomyItemOut): string {
    if (kind === "patterns" && item.ui_bucket) return item.ui_bucket;
    if (kind === "muscle-groups") {
        const bits = [
            item.parent_id != null ? `padre #${item.parent_id}` : null,
            item.level != null ? `nivel ${item.level}` : null,
        ].filter(Boolean);
        return bits.join(" · ") || "—";
    }
    if (kind === "muscles" && item.muscle_group_id != null) {
        return `grupo #${item.muscle_group_id}`;
    }
    if (kind === "joints" && item.region) return item.region;
    if (kind === "tags" && item.category) return item.category;
    return "—";
}

export const AdminTaxonomiesPage: React.FC = () => {
    const navigate = useNavigate();
    const { kind: kindParam } = useParams<{ kind: string }>();
    const kindValid = kindParam != null && isTaxonomyKind(kindParam);
    const kind: TaxonomyKind = kindValid ? kindParam : FALLBACK_KIND;
    const kindLabel = TAXONOMY_KIND_LABELS[kind];

    const {
        searchInput,
        setSearchInput,
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
    } = useAdminTaxonomiesList(kind);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<TaxonomyItemOut | null>(null);
    const [lifecycle, setLifecycle] = useState<{
        item: TaxonomyItemOut;
        mode: "deactivate" | "reactivate";
    } | null>(null);
    const [impact, setImpact] = useState<AdminTaxonomyImpactPayload | null>(null);

    const subtitle = useMemo(
        () => ADMIN_TAX_COPY.pageSubtitle(kindLabel, total),
        [kindLabel, total]
    );

    if (!kindValid) {
        return <Navigate to="/dashboard/admin/taxonomies/patterns" replace />;
    }

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (item: TaxonomyItemOut) => {
        setEditing(item);
        setFormOpen(true);
    };

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-taxonomies-list">
            <div className={ADMIN_TAX_GLOW} aria-hidden />
            <div className={ADMIN_TAX_STACK}>
                <div className={ADMIN_TAX_PAGE_HEADER}>
                    <div className={ADMIN_TAX_TITLE_WRAP}>
                        <PageTitle title={ADMIN_TAX_COPY.pageTitle} />
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    </div>
                    <div className={ADMIN_TAX_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_TAX_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_TAX_COPY.backToAdmin}
                        </Button>
                        <Button type="button" variant="primary" size="sm" onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_TAX_COPY.newItem}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_TAX_TABS} role="tablist" aria-label={ADMIN_TAX_COPY.pageTitle}>
                    {TAXONOMY_KIND_TABS.map((tab) => (
                        <button
                            key={tab.kind}
                            type="button"
                            role="tab"
                            aria-selected={tab.kind === kind}
                            className={adminTaxFilterClass(tab.kind === kind)}
                            onClick={() => navigate(`/dashboard/admin/taxonomies/${tab.kind}`)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={ADMIN_TAX_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_TAX_TOOLBAR_SEARCH}>
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder={ADMIN_TAX_COPY.searchPlaceholder}
                            ariaLabel={ADMIN_TAX_COPY.searchLabel}
                        />
                    </div>
                    <div className={ADMIN_TAX_FILTER_ROW}>
                        <button
                            type="button"
                            aria-pressed={includeInactive}
                            className={adminTaxFilterClass(includeInactive)}
                            onClick={() => setIncludeInactive(!includeInactive)}
                        >
                            {ADMIN_TAX_COPY.includeInactive}
                        </button>
                    </div>
                </div>

                {isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_TAX_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                {ADMIN_TAX_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_TAX_COPY.listError}
                    </Alert>
                ) : null}

                {!isError ? (
                    <section className={ADMIN_TAX_TABLE_CARD}>
                        <NexiaGlassAccentRim />
                        {isLoading ? (
                            <div className={ADMIN_TAX_SKELETON_LIST} aria-busy="true">
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_TAX_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && items.length === 0 ? (
                            <EmptyState
                                title={ADMIN_TAX_COPY.listEmptyTitle}
                                description={ADMIN_TAX_COPY.listEmptyBody}
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            type="button"
                                            variant="ghost-primary"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            Quitar filtros
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={openCreate}
                                        >
                                            {ADMIN_TAX_COPY.newItem}
                                        </Button>
                                    )
                                }
                            />
                        ) : null}

                        {!isLoading && items.length > 0 ? (
                            <>
                                <div className={ADMIN_TAX_TABLE_SCROLL}>
                                    <table className={ADMIN_TAX_TABLE}>
                                        <thead>
                                            <tr>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colName}</th>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colNameEn}</th>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colExtra}</th>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colUsage}</th>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colStatus}</th>
                                                <th className={ADMIN_TAX_TH}>{ADMIN_TAX_COPY.colActions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    data-testid={`admin-tax-row-${item.id}`}
                                                    className={
                                                        item.is_active
                                                            ? ADMIN_TAX_TR
                                                            : `${ADMIN_TAX_TR} ${ADMIN_TAX_TR_INACTIVE}`
                                                    }
                                                >
                                                    <td className={ADMIN_TAX_TD_NAME}>
                                                        {taxonomyDisplayName(item)}
                                                    </td>
                                                    <td className={ADMIN_TAX_TD_MUTED}>
                                                        {item.name_en ?? "—"}
                                                    </td>
                                                    <td className={ADMIN_TAX_TD_MUTED}>
                                                        {extraDetail(kind, item)}
                                                    </td>
                                                    <td className={ADMIN_TAX_TD}>{item.usage_count}</td>
                                                    <td className={ADMIN_TAX_TD}>
                                                        {item.is_active ? (
                                                            <Badge variant="subtle-success">
                                                                {ADMIN_TAX_COPY.statusActive}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="subtle-destructive">
                                                                {ADMIN_TAX_COPY.statusInactive}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className={ADMIN_TAX_TD}>
                                                        <div className={ADMIN_TAX_ROW_ACTIONS}>
                                                            <Button
                                                                type="button"
                                                                variant="ghost-primary"
                                                                size="sm"
                                                                onClick={() => openEdit(item)}
                                                            >
                                                                {ADMIN_TAX_COPY.edit}
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
                                                                    {ADMIN_TAX_COPY.deactivate}
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
                                                                    {ADMIN_TAX_COPY.reactivate}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={ADMIN_TAX_CARD_LIST}>
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            data-testid={`admin-tax-card-${item.id}`}
                                            className={ADMIN_TAX_CARD_ITEM}
                                        >
                                            <div className={ADMIN_TAX_CARD_TITLE_ROW}>
                                                <span>{taxonomyDisplayName(item)}</span>
                                                {item.is_active ? (
                                                    <Badge variant="subtle-success">
                                                        {ADMIN_TAX_COPY.statusActive}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="subtle-destructive">
                                                        {ADMIN_TAX_COPY.statusInactive}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className={ADMIN_TAX_CARD_META}>
                                                {item.name_en ?? "—"} · {ADMIN_TAX_COPY.colUsage}:{" "}
                                                {item.usage_count}
                                            </p>
                                            <div className={ADMIN_TAX_CARD_ACTIONS}>
                                                <Button
                                                    type="button"
                                                    variant="ghost-primary"
                                                    size="sm"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    {ADMIN_TAX_COPY.edit}
                                                </Button>
                                                {item.is_active ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline-destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            setLifecycle({ item, mode: "deactivate" })
                                                        }
                                                    >
                                                        {ADMIN_TAX_COPY.deactivate}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="ghost-primary"
                                                        size="sm"
                                                        onClick={() =>
                                                            setLifecycle({ item, mode: "reactivate" })
                                                        }
                                                    >
                                                        {ADMIN_TAX_COPY.reactivate}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={ADMIN_TAX_PAGINATION}>
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

            <AdminTaxonomyFormModal
                isOpen={formOpen}
                kind={kind}
                item={editing}
                onClose={() => setFormOpen(false)}
                onSaved={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                onImpactRequired={(payload) => {
                    setFormOpen(false);
                    setImpact(payload);
                }}
            />

            <AdminTaxonomyDeactivateModal
                isOpen={lifecycle != null}
                kind={kind}
                item={lifecycle?.item ?? null}
                mode={lifecycle?.mode ?? "deactivate"}
                onClose={() => setLifecycle(null)}
                onDone={() => setLifecycle(null)}
            />

            <AdminTaxonomyImpactModal
                payload={impact}
                onClose={() => setImpact(null)}
                onDone={() => {
                    setImpact(null);
                    setEditing(null);
                }}
            />
        </div>
    );
};

export const AdminTaxonomiesRedirect: React.FC = () => (
    <Navigate to="/dashboard/admin/taxonomies/patterns" replace />
);

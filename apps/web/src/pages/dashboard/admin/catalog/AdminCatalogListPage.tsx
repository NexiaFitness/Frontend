/**
 * AdminCatalogListPage.tsx — Cola de trabajo del catálogo Admin (13 §3.1).
 *
 * Contexto: listado con búsqueda, filtros de revisión/calidad, progreso F9 y
 * apertura de ficha guardando la cola «Revisado y siguiente».
 *
 * Notas de mantenimiento: la lógica vive en `useAdminCatalogList`; aquí solo se
 * ensambla JSX con tokens de `adminCatalogPresentation.ts`.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { SearchBar } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AdminCatalogQualityFlags } from "@/components/admin/catalog/AdminCatalogQualityFlags";
import { useAdminCatalogList } from "@/components/admin/catalog/useAdminCatalogList";
import {
    adminCatalogFilterClass,
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_BACK_BUTTON,
    ADMIN_CATALOG_CARD_ITEM,
    ADMIN_CATALOG_CARD_LIST,
    ADMIN_CATALOG_CARD_META,
    ADMIN_CATALOG_CARD_TITLE_ROW,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FILTER_ROW,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_HEADER_ACTIONS,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_PAGINATION,
    ADMIN_CATALOG_PROGRESS_ROW,
    ADMIN_CATALOG_PROGRESS_VALUE,
    ADMIN_CATALOG_SKELETON_LIST,
    ADMIN_CATALOG_SKELETON_ROW,
    ADMIN_CATALOG_STACK,
    ADMIN_CATALOG_TABLE,
    ADMIN_CATALOG_TABLE_CARD,
    ADMIN_CATALOG_TABLE_SCROLL,
    ADMIN_CATALOG_TD,
    ADMIN_CATALOG_TD_MUTED,
    ADMIN_CATALOG_TD_NAME,
    ADMIN_CATALOG_TH,
    ADMIN_CATALOG_TITLE_WRAP,
    ADMIN_CATALOG_TOOLBAR,
    ADMIN_CATALOG_TOOLBAR_SEARCH,
    ADMIN_CATALOG_TR,
    ADMIN_CATALOG_TR_INACTIVE,
} from "@/components/admin/catalog/adminCatalogPresentation";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";

const SKELETON_ROWS = [0, 1, 2, 3, 4, 5];

export const AdminCatalogListPage: React.FC = () => {
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);
    const {
        search,
        setSearch,
        pendingOnly,
        setPendingOnly,
        includeInactive,
        setIncludeInactive,
        qualityIssuesOnly,
        setQualityIssuesOnly,
        hasActiveFilters,
        clearFilters,
        items,
        total,
        reviewProgress,
        issuesCount,
        isLoading,
        isError,
        refetch,
        page,
        setPage,
        totalPages,
        pageSize,
        openExercise,
    } = useAdminCatalogList();

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const isSearchShortcut =
                event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key === "k");
            if (!isSearchShortcut) return;
            const input = searchRef.current?.querySelector("input");
            if (!input || document.activeElement === input) return;
            event.preventDefault();
            input.focus();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const renderReview = (reviewStatus: string) =>
        reviewStatus === "reviewed" ? (
            <Badge variant="subtle-success">{ADMIN_CATALOG_COPY.reviewDone}</Badge>
        ) : (
            <Badge variant="subtle-warning">{ADMIN_CATALOG_COPY.reviewPending}</Badge>
        );

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-catalog-list">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={ADMIN_CATALOG_COPY.listTitle} />
                        <p className={ADMIN_CATALOG_PROGRESS_ROW}>
                            <span className={ADMIN_CATALOG_PROGRESS_VALUE}>
                                {ADMIN_CATALOG_COPY.progressLabel(
                                    reviewProgress?.reviewed_count ?? 0,
                                    reviewProgress?.active_count ?? 0
                                )}
                            </span>
                            <span>{ADMIN_CATALOG_COPY.issuesLabel(issuesCount)}</span>
                        </p>
                    </div>
                    <div className={ADMIN_CATALOG_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_CATALOG_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.backToAdmin}
                        </Button>
                        <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate("/dashboard/admin/catalog/import")}
                        >
                            <Upload className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.listImport}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/dashboard/admin/catalog/new")}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.listNew}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_CATALOG_TOOLBAR}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_CATALOG_TOOLBAR_SEARCH} ref={searchRef}>
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder={ADMIN_CATALOG_COPY.searchPlaceholderList}
                            ariaLabel={ADMIN_CATALOG_COPY.searchLabel}
                        />
                    </div>
                    <div className={ADMIN_CATALOG_FILTER_ROW}>
                        <button
                            type="button"
                            aria-pressed={pendingOnly}
                            className={adminCatalogFilterClass(pendingOnly)}
                            onClick={() => setPendingOnly(!pendingOnly)}
                        >
                            {ADMIN_CATALOG_COPY.filterPending}
                        </button>
                        <button
                            type="button"
                            aria-pressed={includeInactive}
                            className={adminCatalogFilterClass(includeInactive)}
                            onClick={() => setIncludeInactive(!includeInactive)}
                        >
                            {ADMIN_CATALOG_COPY.filterIncludeInactive}
                        </button>
                        <button
                            type="button"
                            aria-pressed={qualityIssuesOnly}
                            className={adminCatalogFilterClass(qualityIssuesOnly)}
                            onClick={() => setQualityIssuesOnly(!qualityIssuesOnly)}
                        >
                            {ADMIN_CATALOG_COPY.filterQualityIssues}
                        </button>
                    </div>
                </div>

                {isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_CATALOG_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => refetch()}
                            >
                                {ADMIN_CATALOG_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_CATALOG_COPY.listError}
                    </Alert>
                ) : null}

                {!isError ? (
                    <section className={ADMIN_CATALOG_TABLE_CARD}>
                        <NexiaGlassAccentRim />

                        {isLoading ? (
                            <div className={ADMIN_CATALOG_SKELETON_LIST} aria-busy="true">
                                {SKELETON_ROWS.map((row) => (
                                    <div key={row} className={ADMIN_CATALOG_SKELETON_ROW} />
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && items.length === 0 ? (
                            <EmptyState
                                title={ADMIN_CATALOG_COPY.listEmptyTitle}
                                description={ADMIN_CATALOG_COPY.listEmptyBody}
                                action={
                                    hasActiveFilters ? (
                                        <Button
                                            type="button"
                                            variant="ghost-primary"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            {ADMIN_CATALOG_COPY.listClearFilters}
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : null}

                        {!isLoading && items.length > 0 ? (
                            <>
                                <div className={ADMIN_CATALOG_TABLE_SCROLL}>
                                    <table className={ADMIN_CATALOG_TABLE}>
                                        <thead>
                                            <tr>
                                                <th scope="col" className={ADMIN_CATALOG_TH}>
                                                    {ADMIN_CATALOG_COPY.colCode}
                                                </th>
                                                <th scope="col" className={ADMIN_CATALOG_TH}>
                                                    {ADMIN_CATALOG_COPY.colName}
                                                </th>
                                                <th scope="col" className={ADMIN_CATALOG_TH}>
                                                    {ADMIN_CATALOG_COPY.colReview}
                                                </th>
                                                <th scope="col" className={ADMIN_CATALOG_TH}>
                                                    {ADMIN_CATALOG_COPY.colQuality}
                                                </th>
                                                <th scope="col" className={ADMIN_CATALOG_TH}>
                                                    <span className="sr-only">
                                                        {ADMIN_CATALOG_COPY.colOpen}
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr
                                                    key={item.exercise_pk}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={item.nombre}
                                                    data-testid={`admin-catalog-row-${item.exercise_pk}`}
                                                    className={cn(
                                                        ADMIN_CATALOG_TR,
                                                        !item.is_active && ADMIN_CATALOG_TR_INACTIVE
                                                    )}
                                                    onClick={() => openExercise(item.exercise_pk)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter" || event.key === " ") {
                                                            event.preventDefault();
                                                            openExercise(item.exercise_pk);
                                                        }
                                                    }}
                                                >
                                                    <td className={ADMIN_CATALOG_TD_MUTED}>
                                                        {item.exercise_code}
                                                    </td>
                                                    <td className={ADMIN_CATALOG_TD_NAME}>
                                                        {item.nombre}
                                                        {!item.is_active ? (
                                                            <Badge
                                                                variant="subtle-secondary"
                                                                className="ml-2"
                                                            >
                                                                {ADMIN_CATALOG_COPY.inactiveBadge}
                                                            </Badge>
                                                        ) : null}
                                                    </td>
                                                    <td className={ADMIN_CATALOG_TD}>
                                                        {renderReview(item.review_status)}
                                                    </td>
                                                    <td className={ADMIN_CATALOG_TD}>
                                                        <AdminCatalogQualityFlags
                                                            flags={item.quality_flags}
                                                        />
                                                    </td>
                                                    <td className={ADMIN_CATALOG_TD_MUTED}>
                                                        <ChevronRight
                                                            className="h-4 w-4"
                                                            aria-hidden
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className={ADMIN_CATALOG_CARD_LIST}>
                                    {items.map((item) => (
                                        <div
                                            key={item.exercise_pk}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={item.nombre}
                                            data-testid={`admin-catalog-card-${item.exercise_pk}`}
                                            className={cn(
                                                ADMIN_CATALOG_CARD_ITEM,
                                                !item.is_active && ADMIN_CATALOG_TR_INACTIVE
                                            )}
                                            onClick={() => openExercise(item.exercise_pk)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    openExercise(item.exercise_pk);
                                                }
                                            }}
                                        >
                                            <div className={ADMIN_CATALOG_CARD_TITLE_ROW}>
                                                {item.nombre}
                                                {renderReview(item.review_status)}
                                            </div>
                                            <p className={ADMIN_CATALOG_CARD_META}>
                                                {item.exercise_code}
                                                {!item.is_active
                                                    ? ` · ${ADMIN_CATALOG_COPY.inactiveBadge}`
                                                    : ""}
                                            </p>
                                            <AdminCatalogQualityFlags flags={item.quality_flags} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </section>
                ) : null}

                {!isError && totalPages > 1 ? (
                    <PaginationBar
                        className={ADMIN_CATALOG_PAGINATION}
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                ) : null}
            </div>
        </div>
    );
};

/**
 * AdminCatalogLibraryPage.tsx — Biblioteca RepDB del admin.
 *
 * Los candidatos de las tandas se ven y no se editan. Las acciones solo
 * aparecen en un candidato futuro que sigue en `new`.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, EmptyState, LoadingSpinner } from "@/components/ui/feedback";
import { Input, SearchBar, Textarea } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { PageTitle } from "@/components/dashboard/shared";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_FILTER_ROW,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_HEADER_ACTIONS,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_PAGINATION,
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
    adminCatalogFilterClass,
} from "@/components/admin/catalog/adminCatalogPresentation";
import {
    LIBRARY_COPY,
    libraryRowCanWrite,
    libraryStatusLabel,
} from "@/components/admin/catalog/adminCatalogLibraryPresentation";
import { useAdminCatalogLibrary } from "@/components/admin/catalog/useAdminCatalogLibrary";

export const AdminCatalogLibraryPage: React.FC = () => {
    const library = useAdminCatalogLibrary();

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-catalog-library">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={LIBRARY_COPY.title} />
                        <p className="text-sm text-muted-foreground">
                            {LIBRARY_COPY.counts(
                                library.batchCount,
                                library.libraryCount,
                                library.versionedRefs
                            )}
                        </p>
                    </div>
                    <div className={ADMIN_CATALOG_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={library.goToCatalog}
                        >
                            {LIBRARY_COPY.backToCatalog}
                        </Button>
                    </div>
                </div>

                <Alert variant="info" className={ADMIN_CATALOG_ALERT_SPACING}>
                    {LIBRARY_COPY.banner}
                </Alert>

                <div className={ADMIN_CATALOG_TOOLBAR}>
                    <div className={ADMIN_CATALOG_TOOLBAR_SEARCH}>
                        <SearchBar
                            value={library.search}
                            onChange={library.setSearch}
                            placeholder={LIBRARY_COPY.searchPlaceholder}
                        />
                    </div>
                    <div className={ADMIN_CATALOG_FILTER_ROW}>
                        {(
                            [
                                ["all", LIBRARY_COPY.filterAll],
                                ["batch", LIBRARY_COPY.filterBatch],
                                ["library", LIBRARY_COPY.filterLibrary],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                className={adminCatalogFilterClass(library.scope === value)}
                                onClick={() => library.setScope(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {library.panel?.kind === "discard" ? (
                    <div className={ADMIN_CATALOG_TABLE_CARD}>
                        <div className="space-y-3 p-4">
                            <p className="font-medium text-foreground">{LIBRARY_COPY.discardTitle}</p>
                            <p className="text-sm text-muted-foreground">
                                {library.panel.name}. {LIBRARY_COPY.discardHint}
                            </p>
                            <Textarea
                                value={library.discardNote}
                                onChange={(event) => library.setDiscardNote(event.target.value)}
                                placeholder={LIBRARY_COPY.discardPlaceholder}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    disabled={!library.discardReady || library.isSaving}
                                    onClick={() => void library.confirmDiscard()}
                                >
                                    {LIBRARY_COPY.discardConfirm}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost-primary"
                                    size="sm"
                                    onClick={library.closePanel}
                                >
                                    {LIBRARY_COPY.cancel}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {library.panel?.kind === "match" ? (
                    <div className={ADMIN_CATALOG_TABLE_CARD}>
                        <div className="space-y-3 p-4">
                            <p className="font-medium text-foreground">{LIBRARY_COPY.matchTitle}</p>
                            <p className="text-sm text-muted-foreground">
                                {library.panel.name}. {LIBRARY_COPY.matchHint}
                            </p>
                            <Input
                                value={library.matchQuery}
                                onChange={(event) => library.setMatchQuery(event.target.value)}
                                placeholder={LIBRARY_COPY.matchPlaceholder}
                            />
                            <ul className="space-y-1">
                                {library.exerciseChoices.map((exercise) => (
                                    <li key={exercise.exercise_pk}>
                                        <button
                                            type="button"
                                            className="text-sm text-foreground"
                                            onClick={() =>
                                                library.setMatchExercisePk(exercise.exercise_pk)
                                            }
                                        >
                                            {exercise.nombre}
                                            {library.matchExercisePk === exercise.exercise_pk
                                                ? " · elegido"
                                                : ""}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    disabled={library.matchExercisePk == null || library.isSaving}
                                    onClick={() => void library.confirmMatch()}
                                >
                                    {LIBRARY_COPY.matchConfirm}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost-primary"
                                    size="sm"
                                    onClick={library.closePanel}
                                >
                                    {LIBRARY_COPY.cancel}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {library.isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_CATALOG_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => library.refetch()}
                            >
                                {LIBRARY_COPY.retry}
                            </Button>
                        }
                    >
                        {LIBRARY_COPY.loadError}
                    </Alert>
                ) : null}

                {library.isLoading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : library.items.length === 0 ? (
                    <EmptyState title={LIBRARY_COPY.emptyTitle} description={LIBRARY_COPY.emptyBody} />
                ) : (
                    <div className={ADMIN_CATALOG_TABLE_CARD}>
                        <div className={ADMIN_CATALOG_TABLE_SCROLL}>
                            <table className={ADMIN_CATALOG_TABLE}>
                                <thead>
                                    <tr>
                                        <th className={ADMIN_CATALOG_TH}>{LIBRARY_COPY.colName}</th>
                                        <th className={ADMIN_CATALOG_TH}>{LIBRARY_COPY.colStatus}</th>
                                        <th className={ADMIN_CATALOG_TH}>{LIBRARY_COPY.colScope}</th>
                                        <th className={ADMIN_CATALOG_TH}>{LIBRARY_COPY.colActions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {library.items.map((item) => {
                                        const canWrite = libraryRowCanWrite(item);
                                        const label = item.name_es || item.name_en;
                                        return (
                                            <tr key={item.id} className={ADMIN_CATALOG_TR}>
                                                <td className={ADMIN_CATALOG_TD_NAME}>
                                                    <div>{label}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.source_ref}
                                                    </div>
                                                </td>
                                                <td className={ADMIN_CATALOG_TD}>
                                                    {libraryStatusLabel(item.status)}
                                                </td>
                                                <td className={ADMIN_CATALOG_TD_MUTED}>
                                                    <Badge
                                                        variant={
                                                            item.scope === "batch"
                                                                ? "subtle-secondary"
                                                                : "subtle-success"
                                                        }
                                                    >
                                                        {item.scope === "batch"
                                                            ? LIBRARY_COPY.scopeBatch
                                                            : LIBRARY_COPY.scopeLibrary}
                                                    </Badge>
                                                </td>
                                                <td className={ADMIN_CATALOG_TD}>
                                                    {canWrite ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    library.openMatch(item.id, label)
                                                                }
                                                            >
                                                                {LIBRARY_COPY.match}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() =>
                                                                    library.openDiscard(item.id, label)
                                                                }
                                                            >
                                                                {LIBRARY_COPY.discard}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => library.adopt(item.id)}
                                                            >
                                                                {LIBRARY_COPY.adopt}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Solo lectura
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {library.total > library.pageSize ? (
                    <PaginationBar
                        className={ADMIN_CATALOG_PAGINATION}
                        currentPage={library.page}
                        totalPages={library.totalPages}
                        totalItems={library.total}
                        pageSize={library.pageSize}
                        onPageChange={library.setPage}
                    />
                ) : null}
            </div>
        </div>
    );
};

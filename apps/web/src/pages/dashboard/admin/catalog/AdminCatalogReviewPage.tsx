/**
 * AdminCatalogReviewPage.tsx — Revisión masiva de carga axial y nivel (H5).
 *
 * El estado vive en useAdminCatalogReview. Aquí solo se ensambla la página.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { FormCombobox, Input, SearchBar } from "@/components/ui/forms";
import { PaginationBar } from "@/components/ui/pagination";
import { DashboardFixedFooter, PageTitle } from "@/components/dashboard/shared";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals/NexiaPremiumConfirmModal";
import { AdminCatalogReviewRow } from "@/components/admin/catalog/AdminCatalogReviewRow";
import {
    ADMIN_CATALOG_REVIEW_PAGE_SIZE,
    useAdminCatalogReview,
} from "@/components/admin/catalog/useAdminCatalogReview";
import { AXIAL_OPTIONS, NIVEL_OPTIONS } from "@/components/admin/catalog/adminCatalogFieldOptions";
import {
    ADMIN_CATALOG_REVIEW_ALERT,
    ADMIN_CATALOG_REVIEW_COPY,
    ADMIN_CATALOG_REVIEW_FILTERS,
    ADMIN_CATALOG_REVIEW_FILTERS_DEF,
    ADMIN_CATALOG_REVIEW_FOOTER,
    ADMIN_CATALOG_REVIEW_HEADER,
    ADMIN_CATALOG_REVIEW_LIST,
    ADMIN_CATALOG_REVIEW_NARROW,
    ADMIN_CATALOG_REVIEW_PAGE,
    ADMIN_CATALOG_REVIEW_SEGMENTED_SCROLL,
    ADMIN_CATALOG_REVIEW_SEGMENTED_SHELL,
    ADMIN_CATALOG_REVIEW_SEGMENTED_TRACK,
    ADMIN_CATALOG_REVIEW_SKELETON,
    ADMIN_CATALOG_REVIEW_STACK,
    adminCatalogReviewSegmentClass,
} from "@/components/admin/catalog/adminCatalogReviewPresentation";
const SKELETON_ROWS = [0, 1, 2];

export const AdminCatalogReviewPage: React.FC = () => {
    const navigate = useNavigate();
    const reviewState = useAdminCatalogReview();
    const {
        review,
        setReview,
        search,
        setSearch,
        axialLoad,
        setAxialLoad,
        nivel,
        setNivel,
        pattern,
        setPattern,
        page,
        setPage,
        items,
        total,
        totalPages,
        isLoading,
        isError,
        isSaving,
        refetch,
        selected,
        toggleSelected,
        clearSelection,
        valuesOf,
        setAxial,
        setNivelValue,
        askReview,
        confirmIds,
        confirmNames,
        closeConfirm,
        confirmReview,
        conflictNames,
        dismissConflict,
        blockReason,
    } = reviewState;

    const axialOptions = [{ value: "", label: ADMIN_CATALOG_REVIEW_COPY.axialAll }, ...AXIAL_OPTIONS];
    const nivelOptions = [{ value: "", label: ADMIN_CATALOG_REVIEW_COPY.nivelAll }, ...NIVEL_OPTIONS];

    return (
        <div className={ADMIN_CATALOG_REVIEW_PAGE} data-testid="admin-catalog-review">
            <div className={ADMIN_CATALOG_REVIEW_STACK}>
                <div className={ADMIN_CATALOG_REVIEW_HEADER}>
                    <PageTitle title={ADMIN_CATALOG_REVIEW_COPY.title} />
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        onClick={() => navigate("/dashboard/admin/catalog")}
                    >
                        {ADMIN_CATALOG_REVIEW_COPY.back}
                    </Button>
                </div>

                <div className={ADMIN_CATALOG_REVIEW_FILTERS}>
                    <div className={ADMIN_CATALOG_REVIEW_SEGMENTED_SHELL}>
                        <div className={ADMIN_CATALOG_REVIEW_SEGMENTED_SCROLL}>
                            <div className={ADMIN_CATALOG_REVIEW_SEGMENTED_TRACK} role="group">
                                {ADMIN_CATALOG_REVIEW_FILTERS_DEF.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        aria-pressed={review === filter.id}
                                        className={adminCatalogReviewSegmentClass(review === filter.id)}
                                        onClick={() => setReview(filter.id)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder={ADMIN_CATALOG_REVIEW_COPY.searchPlaceholder}
                        ariaLabel={ADMIN_CATALOG_REVIEW_COPY.searchLabel}
                    />
                    <div className={ADMIN_CATALOG_REVIEW_NARROW}>
                        <FormCombobox
                            ariaLabel={ADMIN_CATALOG_REVIEW_COPY.filterAxial}
                            value={axialLoad}
                            options={axialOptions}
                            onChange={setAxialLoad}
                            variant="premium"
                            buttonClassName="w-full"
                        />
                        <FormCombobox
                            ariaLabel={ADMIN_CATALOG_REVIEW_COPY.filterNivel}
                            value={nivel}
                            options={nivelOptions}
                            onChange={setNivel}
                            variant="premium"
                            buttonClassName="w-full"
                        />
                        <Input
                            value={pattern}
                            onChange={(event) => setPattern(event.target.value)}
                            placeholder={ADMIN_CATALOG_REVIEW_COPY.patternPlaceholder}
                            aria-label={ADMIN_CATALOG_REVIEW_COPY.patternLabel}
                            variant="premium"
                        />
                    </div>
                </div>

                {conflictNames ? (
                    <Alert variant="error" className={ADMIN_CATALOG_REVIEW_ALERT} onDismiss={dismissConflict}>
                        {ADMIN_CATALOG_REVIEW_COPY.conflict(conflictNames)}
                    </Alert>
                ) : null}
                {blockReason === "too_many" ? (
                    <Alert variant="error" className={ADMIN_CATALOG_REVIEW_ALERT}>
                        {ADMIN_CATALOG_REVIEW_COPY.tooMany}
                    </Alert>
                ) : null}
                {isError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_CATALOG_REVIEW_ALERT}
                        action={
                            <Button type="button" variant="ghost-primary" size="sm" onClick={() => refetch()}>
                                {ADMIN_CATALOG_REVIEW_COPY.retry}
                            </Button>
                        }
                    >
                        {ADMIN_CATALOG_REVIEW_COPY.error}
                    </Alert>
                ) : null}

                {isLoading ? (
                    <div className={ADMIN_CATALOG_REVIEW_LIST} aria-busy="true">
                        {SKELETON_ROWS.map((row) => (
                            <div key={row} className={ADMIN_CATALOG_REVIEW_SKELETON} />
                        ))}
                    </div>
                ) : null}

                {!isLoading && !isError && items.length === 0 ? (
                    <EmptyState
                        title={ADMIN_CATALOG_REVIEW_COPY.emptyTitle}
                        description={ADMIN_CATALOG_REVIEW_COPY.emptyBody}
                    />
                ) : null}

                {!isLoading && !isError && items.length > 0 ? (
                    <div className={ADMIN_CATALOG_REVIEW_LIST}>
                        {items.map((item) => {
                            const shown = valuesOf(item.exercise_pk);
                            return (
                                <AdminCatalogReviewRow
                                    key={item.exercise_pk}
                                    item={item}
                                    selected={selected.includes(item.exercise_pk)}
                                    axialLoad={shown.axialLoad}
                                    nivel={shown.nivel}
                                    onToggle={() => toggleSelected(item.exercise_pk)}
                                    onAxial={(value) => setAxial(item.exercise_pk, value)}
                                    onNivel={(value) => setNivelValue(item.exercise_pk, value)}
                                    onReview={() => askReview([item.exercise_pk])}
                                    onOpen={() => navigate(`/dashboard/admin/catalog/${item.exercise_pk}`)}
                                />
                            );
                        })}
                    </div>
                ) : null}

                {!isError && totalPages > 1 ? (
                    <PaginationBar
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        pageSize={ADMIN_CATALOG_REVIEW_PAGE_SIZE}
                        onPageChange={setPage}
                    />
                ) : null}
            </div>

            <DashboardFixedFooter>
                <div className={ADMIN_CATALOG_REVIEW_FOOTER}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        onClick={clearSelection}
                        disabled={selected.length === 0}
                    >
                        {ADMIN_CATALOG_REVIEW_COPY.clearSelection}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        disabled={selected.length === 0 || isSaving}
                        onClick={() => askReview(selected)}
                    >
                        {ADMIN_CATALOG_REVIEW_COPY.reviewMany(selected.length)}
                    </Button>
                </div>
            </DashboardFixedFooter>

            <NexiaPremiumConfirmModal
                isOpen={confirmIds.length > 0}
                onClose={closeConfirm}
                onConfirm={() => void confirmReview()}
                title={ADMIN_CATALOG_REVIEW_COPY.confirmTitle}
                description={ADMIN_CATALOG_REVIEW_COPY.confirmBody}
                bodyContent={
                    <ul>
                        {confirmNames.map((nombre, index) => (
                            <li key={`${nombre}-${index}`}>{nombre}</li>
                        ))}
                    </ul>
                }
                confirmLabel={ADMIN_CATALOG_REVIEW_COPY.confirmAction(confirmIds.length)}
                cancelLabel={ADMIN_CATALOG_REVIEW_COPY.cancel}
                confirmVariant="primary"
                isLoading={isSaving}
                loadingConfirmLabel={ADMIN_CATALOG_REVIEW_COPY.loading}
                data-testid="catalog-review-confirm"
            />
        </div>
    );
};

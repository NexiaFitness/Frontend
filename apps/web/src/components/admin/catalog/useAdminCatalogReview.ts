/**
 * useAdminCatalogReview.ts — Selección y cambios de la revisión masiva.
 *
 * Los filtros y el cuerpo del POST salen de catalogBulkReview (shared).
 * La selección es la de la página visible.
 */

import { useEffect, useMemo, useState } from "react";
import {
    buildCatalogBulkReviewBody,
    buildCatalogReviewListParams,
    parseCatalogBulkReviewConflicts,
    shownReviewValues,
    type CatalogReviewEdit,
} from "@nexia/shared/utils/adminCatalog/catalogBulkReview";
import { useListAdminCatalogExercisesQuery, useBulkReviewCatalogMutation } from "@nexia/shared/api/adminCatalogApi";
import type { CatalogValueReviewFilter } from "@nexia/shared/types/adminCatalog";

export const ADMIN_CATALOG_REVIEW_PAGE_SIZE = 50;

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminCatalogReview() {
    const [review, setReview] = useState<CatalogValueReviewFilter>("rubric");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [axialLoad, setAxialLoad] = useState("");
    const [nivel, setNivel] = useState("");
    const [pattern, setPattern] = useState("");
    const [page, setPage] = useState(1);
    const [edits, setEdits] = useState<Record<number, CatalogReviewEdit>>({});
    const [selected, setSelected] = useState<number[]>([]);
    const [confirmIds, setConfirmIds] = useState<number[]>([]);
    const [conflictNames, setConflictNames] = useState<string[] | null>(null);
    const [blockReason, setBlockReason] = useState<"too_many" | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
        setSelected([]);
    }, [review, debouncedSearch, axialLoad, nivel, pattern]);

    useEffect(() => {
        setSelected([]);
    }, [page]);

    const params = useMemo(
        () =>
            buildCatalogReviewListParams({
                review,
                search: debouncedSearch,
                axialLoad,
                nivel,
                pattern,
                skip: (page - 1) * ADMIN_CATALOG_REVIEW_PAGE_SIZE,
                limit: ADMIN_CATALOG_REVIEW_PAGE_SIZE,
            }),
        [axialLoad, debouncedSearch, nivel, page, pattern, review]
    );

    const { data, isLoading, isError, refetch } = useListAdminCatalogExercisesQuery(params);
    const [submitReview, { isLoading: isSaving }] = useBulkReviewCatalogMutation();

    const items = useMemo(() => data?.items ?? [], [data]);
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_CATALOG_REVIEW_PAGE_SIZE));

    const confirmNames = items
        .filter((item) => confirmIds.includes(item.exercise_pk))
        .map((item) => item.nombre);

    function valuesOf(exercisePk: number) {
        const row = items.find((item) => item.exercise_pk === exercisePk);
        return shownReviewValues(row ?? {}, edits[exercisePk]);
    }

    function setAxial(exercisePk: number, value: string) {
        setEdits((current) => ({
            ...current,
            [exercisePk]: { ...current[exercisePk], axialLoad: value },
        }));
    }

    function setNivelValue(exercisePk: number, value: string) {
        setEdits((current) => ({
            ...current,
            [exercisePk]: { ...current[exercisePk], nivel: value },
        }));
    }

    function toggleSelected(exercisePk: number) {
        setSelected((current) =>
            current.includes(exercisePk)
                ? current.filter((id) => id !== exercisePk)
                : [...current, exercisePk]
        );
    }

    function askReview(ids: number[]) {
        setBlockReason(null);
        setConfirmIds(ids);
    }

    async function confirmReview() {
        const drafts = confirmIds.flatMap((id) => {
            const row = items.find((item) => item.exercise_pk === id);
            if (!row?.updated_at) return [];
            const shown = shownReviewValues(row, edits[id]);
            return [
                {
                    exercisePk: id,
                    axialLoad: shown.axialLoad,
                    nivel: shown.nivel,
                    expectedUpdatedAt: row.updated_at,
                },
            ];
        });
        const built = buildCatalogBulkReviewBody(drafts);
        if (!built.ok) {
            setBlockReason(built.reason === "too_many" ? "too_many" : null);
            setConfirmIds([]);
            return;
        }
        try {
            await submitReview(built.body).unwrap();
            setConfirmIds([]);
            setSelected((current) => current.filter((id) => !confirmIds.includes(id)));
            setConflictNames(null);
            setBlockReason(null);
        } catch (error) {
            const names = parseCatalogBulkReviewConflicts(error);
            if (names) {
                setConflictNames(names);
                setConfirmIds([]);
                setSelected([]);
                void refetch();
            }
        }
    }

    return {
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
        clearSelection: () => setSelected([]),
        valuesOf,
        setAxial,
        setNivelValue,
        askReview,
        confirmIds,
        confirmNames,
        closeConfirm: () => setConfirmIds([]),
        confirmReview,
        conflictNames,
        dismissConflict: () => setConflictNames(null),
        blockReason,
    };
}

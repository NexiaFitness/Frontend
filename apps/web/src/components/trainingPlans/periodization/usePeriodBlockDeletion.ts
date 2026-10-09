/**
 * usePeriodBlockDeletion.ts — Orquesta borrar / archivar un bloque (D-BLQ-2).
 *
 * Contexto: previsualización del backend → confirmación premium con recuento →
 * DELETE o archive → toast. El backend vuelve a validar: si entre medias una sesión
 * pasa a tener registro (409), se muestra el error y se refresca la previsualización.
 *
 * Notas de mantenimiento: reglas en @nexia/shared (blockLifecycle), copy en
 * periodBlockDeletionPresentation.ts. Sin estado de UI propio más allá del objetivo.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

import { getMutationErrorMessage, resolveBlockRemovalVariant } from "@nexia/shared";
import {
    useArchivePeriodBlockMutation,
    useDeletePeriodBlockMutation,
    useGetPeriodBlockDeletionPreviewQuery,
} from "@nexia/shared/api/periodBlocksApi";

import { useToast } from "@/components/ui/feedback";

import {
    buildBlockRemovalCopy,
    buildBlockRemovalSuccessMessage,
    type BlockRemovalCopy,
} from "./periodBlockDeletionPresentation";

interface RemovalTarget {
    id: number;
    label: string;
}

export function usePeriodBlockDeletion(planId: number) {
    const { showSuccess, showError } = useToast();
    const [target, setTarget] = useState<RemovalTarget | null>(null);

    const preview = useGetPeriodBlockDeletionPreviewQuery(
        target ? { planId, blockId: target.id } : skipToken,
        { refetchOnMountOrArgChange: true },
    );
    const [deleteBlock, { isLoading: isDeleting }] = useDeletePeriodBlockMutation();
    const [archiveBlock, { isLoading: isArchiving }] = useArchivePeriodBlockMutation();

    useEffect(() => {
        if (target && preview.isError) {
            showError(getMutationErrorMessage(preview.error));
            setTarget(null);
        }
    }, [target, preview.isError, preview.error, showError]);

    const variant =
        target && preview.data && !preview.isFetching
            ? resolveBlockRemovalVariant(preview.data)
            : null;

    const copy: BlockRemovalCopy | null = useMemo(
        () =>
            variant && target && preview.data
                ? buildBlockRemovalCopy(variant, preview.data, target.label)
                : null,
        [variant, target, preview.data],
    );

    const requestRemoval = useCallback((id: number, label: string) => {
        setTarget({ id, label });
    }, []);

    const cancel = useCallback(() => setTarget(null), []);

    const confirm = useCallback(async () => {
        if (!target || !variant) return;
        try {
            const removed =
                variant === "archive"
                    ? (await archiveBlock({ planId, blockId: target.id }).unwrap())
                          .deleted_planned_sessions
                    : (await deleteBlock({ planId, blockId: target.id }).unwrap())
                          .deleted_sessions;
            setTarget(null);
            showSuccess(buildBlockRemovalSuccessMessage(variant, removed));
        } catch (err) {
            showError(getMutationErrorMessage(err));
            void preview.refetch();
        }
    }, [target, variant, planId, archiveBlock, deleteBlock, preview, showSuccess, showError]);

    return {
        isOpen: copy != null,
        copy,
        isLoading: isDeleting || isArchiving,
        requestRemoval,
        cancel,
        confirm,
    };
}

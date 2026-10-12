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
import { useDispatch } from "react-redux";

import { getMutationErrorMessage, resolveBlockRemovalVariant } from "@nexia/shared";
import type { AppDispatch } from "@nexia/shared/store";
import type { BlockDeletionPreview } from "@nexia/shared/types/planningCargas";
import {
    periodBlocksApi,
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
    const dispatch = useDispatch<AppDispatch>();
    const { showSuccess, showError } = useToast();
    const [target, setTarget] = useState<RemovalTarget | null>(null);
    /** Tras 409 en DELETE: previsualización fresca aunque RTK no repinte la suscripción. */
    const [previewOverride, setPreviewOverride] = useState<BlockDeletionPreview | null>(
        null,
    );

    const preview = useGetPeriodBlockDeletionPreviewQuery(
        target ? { planId, blockId: target.id } : skipToken,
        {
            refetchOnFocus: false,
            refetchOnReconnect: false,
        },
    );
    const [deleteBlock, { isLoading: isDeleting }] = useDeletePeriodBlockMutation();
    const [archiveBlock, { isLoading: isArchiving }] = useArchivePeriodBlockMutation();

    useEffect(() => {
        if (target && preview.isError) {
            showError(getMutationErrorMessage(preview.error));
            setTarget(null);
        }
    }, [target, preview.isError, preview.error, showError]);

    // Mantener copy mientras refetch (evita cerrar modal → reabrir → bucle "Maximum update depth").
    const previewData = previewOverride ?? preview.data;
    const isPreviewLoading =
        Boolean(target) && preview.isFetching && previewData == null;
    const variant =
        target && previewData ? resolveBlockRemovalVariant(previewData) : null;

    const copy: BlockRemovalCopy | null = useMemo(
        () =>
            variant && target && previewData
                ? buildBlockRemovalCopy(variant, previewData, target.label)
                : null,
        [variant, target, previewData],
    );

    const requestRemoval = useCallback((id: number, label: string) => {
        setPreviewOverride(null);
        setTarget({ id, label });
    }, []);

    const cancel = useCallback(() => {
        setPreviewOverride(null);
        setTarget(null);
    }, []);

    const confirm = useCallback(async () => {
        if (!target || !variant) return;
        try {
            const removed =
                variant === "archive"
                    ? (await archiveBlock({ planId, blockId: target.id }).unwrap())
                          .deleted_planned_sessions
                    : (await deleteBlock({ planId, blockId: target.id }).unwrap())
                          .deleted_sessions;
            setPreviewOverride(null);
            setTarget(null);
            showSuccess(buildBlockRemovalSuccessMessage(variant, removed));
        } catch (err) {
            showError(getMutationErrorMessage(err));
            try {
                const fresh = await dispatch(
                    periodBlocksApi.endpoints.getPeriodBlockDeletionPreview.initiate(
                        { planId, blockId: target.id },
                        { forceRefetch: true, subscribe: false },
                    ),
                ).unwrap();
                setPreviewOverride(fresh);
            } catch (refetchErr) {
                showError(getMutationErrorMessage(refetchErr));
            }
        }
    }, [
        target,
        variant,
        planId,
        archiveBlock,
        deleteBlock,
        dispatch,
        showSuccess,
        showError,
    ]);

    return {
        isOpen: target != null,
        copy,
        isPreviewLoading,
        isLoading: isDeleting || isArchiving || isPreviewLoading,
        requestRemoval,
        cancel,
        confirm,
    };
}

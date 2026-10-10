/**
 * useArchivedBlockReactivation.ts — Lista de bloques archivados y «Reactivar» (D-BLQ-5).
 *
 * Contexto: el entrenador nunca se queda sin salida tras archivar. Lista del backend
 * → confirmación premium → POST reactivate → toast. 409 (solapa con otro bloque o
 * fuera de la vigencia del plan): toast de error y el modal sigue abierto.
 *
 * Notas de mantenimiento: reglas en backend (block_lifecycle.reactivate_block);
 * copy en archivedBlocksPresentation.ts.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import { useCallback, useMemo, useState } from "react";

import { getMutationErrorMessage } from "@nexia/shared";
import {
    useGetArchivedPeriodBlocksQuery,
    useReactivatePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { useToast } from "@/components/ui/feedback";

import {
    REACTIVATE_BLOCK_SUCCESS,
    buildReactivateBlockCopy,
    type ReactivateBlockCopy,
} from "./archivedBlocksPresentation";

export function useArchivedBlockReactivation(planId: number) {
    const { showSuccess, showError } = useToast();
    const { data: archivedBlocks = [] } = useGetArchivedPeriodBlocksQuery(planId, {
        skip: planId <= 0,
    });
    const [reactivate, { isLoading }] = useReactivatePeriodBlockMutation();
    const [target, setTarget] = useState<PlanPeriodBlock | null>(null);

    const copy: ReactivateBlockCopy | null = useMemo(
        () => (target ? buildReactivateBlockCopy(target) : null),
        [target],
    );

    const requestReactivation = useCallback((block: PlanPeriodBlock) => {
        setTarget(block);
    }, []);

    const cancel = useCallback(() => setTarget(null), []);

    const confirm = useCallback(async () => {
        if (!target) return;
        try {
            await reactivate({ planId, blockId: target.id }).unwrap();
            setTarget(null);
            showSuccess(REACTIVATE_BLOCK_SUCCESS);
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    }, [target, planId, reactivate, showSuccess, showError]);

    return {
        archivedBlocks,
        isOpen: copy != null,
        copy,
        isLoading,
        requestReactivation,
        cancel,
        confirm,
    };
}

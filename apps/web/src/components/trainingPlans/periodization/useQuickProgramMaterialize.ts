/**
 * useQuickProgramMaterialize.ts — O9 materialize + verificación fail-closed (F3 paso 5).
 *
 * No limpia el borrador local: solo llama onSuccess tras confirmar respuesta + refetch.
 */

import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
    applyDerivedPhaseDates,
    draftToMaterializePayload,
    getMutationErrorMessage,
} from "@nexia/shared";
import {
    periodBlocksApi,
    useMaterializeQuickProgramMutation,
} from "@nexia/shared/api/periodBlocksApi";
import type { AppDispatch } from "@nexia/shared/store";
import type { QuickProgramDraft } from "@nexia/shared/types/quickProgramDraft";

import {
    assertMaterializedBlocksVisible,
    assertMaterializeResponseMatchesDraft,
    QuickProgramMaterializeVerificationError,
} from "./quickProgramMaterializeVerify";
import { fetchPeriodBlocksForVerify } from "./fetchPeriodBlocksForVerify";

export interface UseQuickProgramMaterializeOptions {
    planId: number;
    draft: QuickProgramDraft;
    phaseCount: number;
    canMaterialize: boolean;
    onSuccess: () => void;
}

export interface MaterializeProgramResult {
    blockIds: number[];
    replay: boolean;
}

export function useQuickProgramMaterialize({
    planId,
    draft,
    phaseCount,
    canMaterialize,
    onSuccess,
}: UseQuickProgramMaterializeOptions) {
    const dispatch = useDispatch<AppDispatch>();
    const [materialize, mutationState] = useMaterializeQuickProgramMutation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLockRef = useRef(false);

    const materializeProgram = useCallback(async (): Promise<
        MaterializeProgramResult | undefined
    > => {
        if (
            !canMaterialize ||
            isSubmitting ||
            mutationState.isLoading ||
            submitLockRef.current
        ) {
            return undefined;
        }

        submitLockRef.current = true;
        setIsSubmitting(true);
        setError(null);

        const derivedDraft = applyDerivedPhaseDates(draft);
        const payload = draftToMaterializePayload(derivedDraft);

        try {
            const result = await materialize({
                planId,
                data: payload,
            });

            if (result.error) {
                throw result.error;
            }

            if (!result.data) {
                throw new QuickProgramMaterializeVerificationError(
                    "Materialize no devolvió datos.",
                );
            }

            const replay =
                typeof result.meta === "object" &&
                result.meta !== null &&
                "response" in result.meta &&
                (result.meta as { response?: { status?: number } }).response
                    ?.status === 200;

            const blockIds = assertMaterializeResponseMatchesDraft(
                phaseCount,
                payload.client_request_id,
                result.data,
            );

            dispatch(
                periodBlocksApi.util.invalidateTags([
                    { type: "PlanPeriodBlock", id: `LIST-${planId}` },
                    ...blockIds.map((id) => ({
                        type: "PlanPeriodBlock" as const,
                        id,
                    })),
                ]),
            );

            const listed = await fetchPeriodBlocksForVerify(planId);
            assertMaterializedBlocksVisible(blockIds, listed);

            onSuccess();
            return { blockIds, replay };
        } catch (unknownError) {
            const message =
                unknownError instanceof QuickProgramMaterializeVerificationError
                    ? unknownError.message
                    : getMutationErrorMessage(unknownError);

            setError(message);
            return undefined;
        } finally {
            submitLockRef.current = false;
            setIsSubmitting(false);
        }
    }, [
        canMaterialize,
        dispatch,
        draft,
        isSubmitting,
        materialize,
        mutationState.isLoading,
        onSuccess,
        phaseCount,
        planId,
    ]);

    const clearError = useCallback(() => setError(null), []);

    return {
        materializeProgram,
        isMaterializing: isSubmitting || mutationState.isLoading,
        materializeError: error,
        clearMaterializeError: clearError,
    };
}

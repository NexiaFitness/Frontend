/**
 * useBlockAuthoringNavigation.ts — Sync URL ↔ pasos del journey D-PAP.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
    applyBlockAuthorParams,
    clearBlockAuthorParams,
    parseBlockAuthorParams,
} from "@/utils/blockAuthoringUrl";
import {
    blockAuthorStepIndex,
    canNavigateToBlockAuthorStep,
    nextBlockAuthorStep,
    prevBlockAuthorStep,
    type BlockAuthorMode,
    type BlockAuthorStep,
} from "./blockAuthoringModel";

export function useBlockAuthoringNavigation(maxReachedStep: BlockAuthorStep) {
    const [searchParams, setSearchParams] = useSearchParams();

    const params = useMemo(
        () => parseBlockAuthorParams(searchParams),
        [searchParams],
    );

    const setParams = useCallback(
        (next: URLSearchParams) => {
            setSearchParams(next, { replace: true });
        },
        [setSearchParams],
    );

    const goToStep = useCallback(
        (step: BlockAuthorStep) => {
            if (params.mode == null) return;
            const allowed = canNavigateToBlockAuthorStep(
                params.mode,
                step,
                params.step,
                maxReachedStep,
            );
            if (!allowed) return;
            setParams(applyBlockAuthorParams(searchParams, { step }));
        },
        [params.mode, params.step, maxReachedStep, searchParams, setParams],
    );

    const goNext = useCallback(() => {
        const next = nextBlockAuthorStep(params.step);
        if (next == null) return;
        goToStep(next);
    }, [params.step, goToStep]);

    const goBack = useCallback(() => {
        const prev = prevBlockAuthorStep(params.step);
        if (prev == null) return;
        goToStep(prev);
    }, [params.step, goToStep]);

    const exitAuthoring = useCallback(() => {
        setParams(clearBlockAuthorParams(searchParams));
    }, [searchParams, setParams]);

    const canGoBack = prevBlockAuthorStep(params.step) != null;

    const isStepReachable = useCallback(
        (step: BlockAuthorStep) => {
            if (params.mode == null) return false;
            return canNavigateToBlockAuthorStep(
                params.mode,
                step,
                params.step,
                maxReachedStep,
            );
        },
        [params.mode, params.step, maxReachedStep],
    );

    return {
        params,
        mode: params.mode as BlockAuthorMode | null,
        step: params.step,
        blockId: params.blockId,
        blockStart: params.blockStart,
        blockEnd: params.blockEnd,
        isActive: params.mode != null,
        goToStep,
        goNext,
        goBack,
        exitAuthoring,
        canGoBack,
        isStepReachable,
        stepIndex: blockAuthorStepIndex(params.step),
    };
}

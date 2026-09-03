/**
 * useLocalBlockAuthoringNavigation.ts — Navegación de pasos D-PAP sin URL (QP draft).
 */

import { useCallback, useMemo } from "react";

import {
    blockAuthorStepIndex,
    canNavigateToBlockAuthorStep,
    nextBlockAuthorStep,
    prevBlockAuthorStep,
    type BlockAuthorMode,
    type BlockAuthorStep,
} from "./blockAuthoringModel";

export interface UseLocalBlockAuthoringNavigationArgs {
    mode: BlockAuthorMode;
    step: BlockAuthorStep;
    maxReachedStep: BlockAuthorStep;
    onStepChange: (step: BlockAuthorStep) => void;
}

export function useLocalBlockAuthoringNavigation({
    mode,
    step,
    maxReachedStep,
    onStepChange,
}: UseLocalBlockAuthoringNavigationArgs) {
    const goToStep = useCallback(
        (target: BlockAuthorStep) => {
            const allowed = canNavigateToBlockAuthorStep(
                mode,
                target,
                step,
                maxReachedStep,
            );
            if (!allowed) return;
            onStepChange(target);
        },
        [mode, step, maxReachedStep, onStepChange],
    );

    const goNext = useCallback(() => {
        const next = nextBlockAuthorStep(step);
        if (next == null) return;
        goToStep(next);
    }, [step, goToStep]);

    const goBack = useCallback(() => {
        const prev = prevBlockAuthorStep(step);
        if (prev == null) return;
        goToStep(prev);
    }, [step, goToStep]);

    const canGoBack = prevBlockAuthorStep(step) != null;

    const isStepReachable = useCallback(
        (target: BlockAuthorStep) =>
            canNavigateToBlockAuthorStep(mode, target, step, maxReachedStep),
        [mode, step, maxReachedStep],
    );

    const stepIndex = useMemo(() => blockAuthorStepIndex(step), [step]);

    return {
        step,
        goToStep,
        goNext,
        goBack,
        canGoBack,
        isStepReachable,
        stepIndex,
    };
}

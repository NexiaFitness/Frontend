/**
 * useAthleteRunProgressResume.ts — BE-1 progress: retomar guiado sin re-POST (Parte 3 / D9).
 */

import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useGetAthleteRunProgressQuery } from "@nexia/shared/api/athleteApi";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    allRunStepsResolved,
    collectProgressKeysForRunStep,
    collectResolvedStepKeysFromProgress,
    findFirstPendingStepIndex,
    isRunStepResolved,
    isRunStepTouchedForProgress,
    shouldSkipRunStepPersist,
} from "@nexia/shared/utils/athlete/athleteRunProgressSteps";

export interface UseAthleteRunProgressResumeOptions {
    sessionId: number;
    runSteps: readonly AthleteRunStep[];
    isOnline: boolean;
    completedStepKeysRef: MutableRefObject<Set<string>>;
    touchedWeightStepKeysRef: MutableRefObject<Set<string>>;
    setSavedStepKeys: (keys: ReadonlySet<string>) => void;
    setStep: (value: number | ((prev: number) => number)) => void;
}

export function useAthleteRunProgressResume({
    sessionId,
    runSteps,
    isOnline,
    completedStepKeysRef,
    touchedWeightStepKeysRef,
    setSavedStepKeys,
    setStep,
}: UseAthleteRunProgressResumeOptions) {
    const { data: runProgress } = useGetAthleteRunProgressQuery(sessionId, {
        skip: !sessionId,
        refetchOnMountOrArgChange: isOnline,
        refetchOnFocus: isOnline,
        refetchOnReconnect: true,
    });

    const progressInitForSessionRef = useRef<number | null>(null);

    useEffect(() => {
        progressInitForSessionRef.current = null;
    }, [sessionId]);

    useEffect(() => {
        if (!runProgress || runSteps.length === 0) return;
        if (progressInitForSessionRef.current === sessionId) return;
        progressInitForSessionRef.current = sessionId;

        for (const key of collectResolvedStepKeysFromProgress(runProgress)) {
            completedStepKeysRef.current.add(key);
        }
        for (const runStep of runSteps) {
            if (isRunStepResolved(runStep, runProgress)) {
                completedStepKeysRef.current.add(runStep.stepKey);
            }
        }
        setSavedStepKeys(new Set(completedStepKeysRef.current));

        const pendingIndex = findFirstPendingStepIndex(runSteps, runProgress);
        if (pendingIndex >= runSteps.length) {
            setStep(Math.max(0, runSteps.length - 1));
        } else {
            setStep(pendingIndex);
        }
    }, [
        completedStepKeysRef,
        runProgress,
        runSteps,
        sessionId,
        setSavedStepKeys,
        setStep,
    ]);

    const skipPersistForCurrentStep = useCallback(
        (step: AthleteRunStep | undefined) => {
            if (!step) return false;
            return shouldSkipRunStepPersist(
                step,
                runProgress,
                touchedWeightStepKeysRef.current
            );
        },
        [runProgress, touchedWeightStepKeysRef]
    );

    const isStepSavedOnServer = useCallback(
        (step: AthleteRunStep | undefined) => {
            if (!step || !runProgress) return false;
            if (!isRunStepResolved(step, runProgress)) return false;
            return !isRunStepTouchedForProgress(step, touchedWeightStepKeysRef.current);
        },
        [runProgress, touchedWeightStepKeysRef]
    );

    const findNextPendingStepIndex = useCallback(
        (fromIndex: number) => {
            if (!runProgress) return fromIndex + 1;
            let next = fromIndex + 1;
            while (next < runSteps.length) {
                const candidate = runSteps[next];
                if (
                    !isRunStepResolved(candidate, runProgress) ||
                    isRunStepTouchedForProgress(candidate, touchedWeightStepKeysRef.current)
                ) {
                    return next;
                }
                completedStepKeysRef.current.add(candidate.stepKey);
                for (const key of collectProgressKeysForRunStep(candidate)) {
                    completedStepKeysRef.current.add(key);
                }
                next += 1;
            }
            return next;
        },
        [completedStepKeysRef, runProgress, runSteps, touchedWeightStepKeysRef]
    );

    const allResolvedOnServer = useMemo(
        () => allRunStepsResolved(runSteps, runProgress),
        [runProgress, runSteps]
    );

    return {
        runProgress,
        skipPersistForCurrentStep,
        isStepSavedOnServer,
        findNextPendingStepIndex,
        allResolvedOnServer,
    };
}

/**
 * useQuickProgramDraft.ts — Estado Quick Program (O6-MF) delegando en @nexia/shared.
 */

import { useCallback, useMemo, useRef, useState } from "react";

import {
    addPhaseToDraft,
    applyDerivedPhaseDates,
    canMaterializeProgram,
    copyStructureFromPreviousPhase,
    createQuickProgramDraft,
    isPhaseDraftReady,
    phaseDraftHasOverlap,
    removePhaseFromDraft,
    setActivePhaseInDraft,
    updatePhaseInDraft,
    type DateRange,
} from "@nexia/shared";
import type { PhaseDraft, QuickProgramDraft } from "@nexia/shared/types/quickProgramDraft";

import type { BlockAuthorStep } from "./blockAuthoringModel";

export interface UseQuickProgramDraftOptions {
    planId: number;
    programStartDate: string;
    trainingDays?: readonly string[] | null;
    existingBlocks: DateRange[];
    planStartDate?: string | null;
    planEndDate?: string | null;
}

export function useQuickProgramDraft({
    planId,
    programStartDate,
    trainingDays,
    existingBlocks,
    planStartDate,
    planEndDate,
}: UseQuickProgramDraftOptions) {
    const clientRequestIdRef = useRef<string | null>(null);
    const [draft, setDraft] = useState<QuickProgramDraft>(() => {
        const initial = createQuickProgramDraft(planId, {
            programStartDate,
            trainingDays,
        });
        clientRequestIdRef.current = initial.clientRequestId;
        return initial;
    });
    const [phaseSteps, setPhaseSteps] = useState<
        Record<string, BlockAuthorStep>
    >({});

    const sortedPhases = useMemo(
        () => [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder),
        [draft.phases],
    );

    const activePhase = useMemo(
        () =>
            draft.phases.find((p) => p.localId === draft.activePhaseId) ??
            sortedPhases[0],
        [draft.phases, draft.activePhaseId, sortedPhases],
    );

    const activeStep = phaseSteps[draft.activePhaseId] ?? "qualities";

    const setActiveStep = useCallback(
        (step: BlockAuthorStep) => {
            setPhaseSteps((prev) => ({
                ...prev,
                [draft.activePhaseId]: step,
            }));
        },
        [draft.activePhaseId],
    );

    const replacePhase = useCallback((updated: PhaseDraft) => {
        const { localId, sortOrder, ...patch } = updated;
        void sortOrder;
        setDraft((current) => updatePhaseInDraft(current, localId, patch));
    }, []);

    const selectPhase = useCallback((phaseLocalId: string) => {
        setDraft((current) => setActivePhaseInDraft(current, phaseLocalId));
    }, []);

    const addPhase = useCallback(() => {
        setDraft((current) => addPhaseToDraft(current, { trainingDays }));
    }, [trainingDays]);

    const removePhase = useCallback((phaseLocalId: string) => {
        setDraft((current) => removePhaseFromDraft(current, phaseLocalId));
        setPhaseSteps((prev) => {
            const next = { ...prev };
            delete next[phaseLocalId];
            return next;
        });
    }, []);

    const copyStructureFromPrevious = useCallback((phaseLocalId: string) => {
        setDraft((current) =>
            copyStructureFromPreviousPhase(current, phaseLocalId),
        );
    }, []);

    const phaseReadiness = useCallback(
        (phase: PhaseDraft) =>
            isPhaseDraftReady(phase, {
                trainingDays,
                overlapDetected: phaseDraftHasOverlap(
                    phase,
                    draft.phases,
                    existingBlocks,
                ),
                outsidePlanBounds: false,
            }),
        [draft.phases, existingBlocks, trainingDays],
    );

    const canMaterialize = useMemo(
        () =>
            canMaterializeProgram({
                draft: applyDerivedPhaseDates(draft),
                existingBlocks,
                planStartDate,
                planEndDate,
                trainingDays,
            }),
        [draft, existingBlocks, planStartDate, planEndDate, trainingDays],
    );

    return {
        draft,
        sortedPhases,
        activePhase,
        activeStep,
        setActiveStep,
        replacePhase,
        selectPhase,
        addPhase,
        removePhase,
        copyStructureFromPrevious,
        phaseReadiness,
        canMaterialize,
        clientRequestId: clientRequestIdRef.current ?? draft.clientRequestId,
    };
}

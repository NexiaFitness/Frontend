/**
 * useQuickProgramDraft.ts — Estado Quick Program (O6-MF) delegando en @nexia/shared.
 */

import { useCallback, useMemo, useRef, useState } from "react";

import {
    addPhaseToDraft,
    alignDraftMaterializationIntent,
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
    type MaterializationIntentBinding,
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
    const intentBindingRef = useRef<MaterializationIntentBinding | null>(null);
    const [draft, setDraftState] = useState<QuickProgramDraft>(() => {
        const initial = createQuickProgramDraft(planId, {
            programStartDate,
            trainingDays,
        });
        const aligned = alignDraftMaterializationIntent(
            initial,
            intentBindingRef.current,
        );
        intentBindingRef.current = aligned.binding;
        return aligned.draft;
    });
    const [phaseSteps, setPhaseSteps] = useState<
        Record<string, BlockAuthorStep>
    >({});

    const setDraft = useCallback(
        (updater: (current: QuickProgramDraft) => QuickProgramDraft) => {
            setDraftState((current) => {
                const next = updater(current);
                const aligned = alignDraftMaterializationIntent(
                    next,
                    intentBindingRef.current,
                );
                intentBindingRef.current = aligned.binding;
                return aligned.draft;
            });
        },
        [],
    );

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

    const replacePhase = useCallback(
        (updated: PhaseDraft) => {
            const { localId, sortOrder, ...patch } = updated;
            void sortOrder;
            setDraft((current) => updatePhaseInDraft(current, localId, patch));
        },
        [setDraft],
    );

    const selectPhase = useCallback(
        (phaseLocalId: string) => {
            setDraft((current) => setActivePhaseInDraft(current, phaseLocalId));
        },
        [setDraft],
    );

    const addPhase = useCallback(() => {
        setDraft((current) => addPhaseToDraft(current, { trainingDays }));
    }, [setDraft, trainingDays]);

    const removePhase = useCallback(
        (phaseLocalId: string) => {
            setDraft((current) => removePhaseFromDraft(current, phaseLocalId));
            setPhaseSteps((prev) => {
                const next = { ...prev };
                delete next[phaseLocalId];
                return next;
            });
        },
        [setDraft],
    );

    const copyStructureFromPrevious = useCallback(
        (phaseLocalId: string) => {
            setDraft((current) =>
                copyStructureFromPreviousPhase(current, phaseLocalId),
            );
        },
        [setDraft],
    );

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
        clientRequestId: draft.clientRequestId,
    };
}

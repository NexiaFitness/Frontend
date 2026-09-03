/**
 * quickProgramReadiness.ts — Gates ACT-NIVEL programa (F3) y fase draft.
 */

import type { PhaseDraft, QuickProgramDraft } from "../types/quickProgramDraft";
import {
    buildPhaseReadinessChecklist,
    type PhaseReadinessInput,
} from "./phaseReadiness";
import {
    dayAfterLocal,
    recalculatePhaseDates,
    sumPhaseWeekCounts,
} from "./quickProgramDates";
import {
    hasOverlap,
    isWithinPlanBounds,
    type DateRange,
} from "./periodBlockOverlap";

export interface PhaseDraftReadinessOptions {
    trainingDays?: readonly string[] | null;
    overlapDetected?: boolean;
    outsidePlanBounds?: boolean;
}

function phaseToReadinessInput(
    phase: PhaseDraft,
    options?: PhaseDraftReadinessOptions,
): PhaseReadinessInput {
    return {
        startDate: phase.startDate,
        endDate: phase.endDate,
        qualities: phase.qualities,
        volumeLevel: phase.volumeLevel,
        intensityLevel: phase.intensityLevel,
        weeklyStructure: phase.weeklyStructure,
        trainingDays: options?.trainingDays,
        overlapDetected: options?.overlapDetected,
        outsidePlanBounds: options?.outsidePlanBounds,
    };
}

/** Equivalente a canActivatePhase sin blockId ni isDirty (pre-materialize). */
export function isPhaseDraftReady(
    phase: PhaseDraft,
    options?: PhaseDraftReadinessOptions,
): boolean {
    const checklist = buildPhaseReadinessChecklist(
        phaseToReadinessInput(phase, options),
    );
    return (
        checklist.datesValid &&
        checklist.qualitiesComplete &&
        checklist.loadValid &&
        checklist.structureComplete
    );
}

export interface CanMaterializeProgramInput {
    draft: QuickProgramDraft;
    existingBlocks: DateRange[];
    planStartDate?: string | null;
    planEndDate?: string | null;
    trainingDays?: readonly string[] | null;
}

function draftPhasesOverlapEachOther(phases: readonly PhaseDraft[]): boolean {
    for (let i = 0; i < phases.length; i += 1) {
        for (let j = i + 1; j < phases.length; j += 1) {
            if (
                hasOverlap(
                    phases[i].startDate,
                    phases[i].endDate,
                    [
                        {
                            start_date: phases[j].startDate,
                            end_date: phases[j].endDate,
                        },
                    ],
                )
            ) {
                return true;
            }
        }
    }
    return false;
}

function draftPhasesAreContiguous(
    programStartDate: string,
    phases: readonly PhaseDraft[],
): boolean {
    const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
    if (sorted.length === 0) return false;
    if (sorted[0].startDate !== programStartDate) return false;

    const expected = recalculatePhaseDates(programStartDate, sorted);
    return sorted.every(
        (phase, index) =>
            phase.startDate === expected[index].startDate &&
            phase.endDate === expected[index].endDate,
    );
}

/** Gate «Listo para crear programación» (P1–P7 + P8 totalWeeks). */
export function canMaterializeProgram(input: CanMaterializeProgramInput): boolean {
    const { draft, existingBlocks, planStartDate, planEndDate, trainingDays } =
        input;

    if (draft.phases.length < 1) return false;
    if (!draft.programStartDate) return false;

    const sorted = [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder);
    if (sorted[0].startDate !== draft.programStartDate) return false;

    if (!draftPhasesAreContiguous(draft.programStartDate, draft.phases)) {
        return false;
    }

    if (draftPhasesOverlapEachOther(draft.phases)) return false;

    const totalWeeks = sumPhaseWeekCounts(draft.phases);
    if (draft.totalWeeks !== totalWeeks) return false;

    for (const phase of draft.phases) {
        if (
            hasOverlap(phase.startDate, phase.endDate, existingBlocks)
        ) {
            return false;
        }

        if (
            !isWithinPlanBounds(
                phase.startDate,
                phase.endDate,
                planStartDate,
                planEndDate,
            )
        ) {
            return false;
        }

        if (!isPhaseDraftReady(phase, { trainingDays })) {
            return false;
        }
    }

    return true;
}

/** Detecta solapamiento de una fase draft vs otras fases + bloques persistidos. */
export function phaseDraftHasOverlap(
    phase: PhaseDraft,
    draftPhases: readonly PhaseDraft[],
    existingBlocks: DateRange[],
): boolean {
    const otherPhases = draftPhases
        .filter((p) => p.localId !== phase.localId)
        .map((p) => ({ start_date: p.startDate, end_date: p.endDate }));

    return (
        hasOverlap(phase.startDate, phase.endDate, otherPhases) ||
        hasOverlap(phase.startDate, phase.endDate, existingBlocks)
    );
}

/** Fecha contigua esperada para la fase en sortOrder (validación inter-fase). */
export function expectedPhaseStartDate(
    programStartDate: string,
    phases: readonly PhaseDraft[],
    sortOrder: number,
): string | null {
    const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((p) => p.sortOrder === sortOrder);
    if (index < 0) return null;
    if (index === 0) return programStartDate;
    return dayAfterLocal(sorted[index - 1].endDate);
}

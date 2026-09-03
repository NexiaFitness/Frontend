/**
 * phaseDraftFormBridge.ts — Puente PhaseDraft (QP) ↔ PeriodBlockFormState (F2).
 */

import { cloneQualities, cloneWeeklyStructure } from "@nexia/shared";
import type { PhaseDraft } from "@nexia/shared/types/quickProgramDraft";
import type { BlockAuthorStep } from "./blockAuthoringModel";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";

/** Hidrata el formulario F2 desde un PhaseDraft local (sin IDs de servidor). */
export function periodBlockFormStateFromPhaseDraft(
    phase: PhaseDraft,
): PeriodBlockFormState {
    return {
        phase: "rangeComplete",
        startDate: phase.startDate,
        endDate: phase.endDate,
        qualities: cloneQualities(phase.qualities),
        volumeLevel: phase.volumeLevel,
        intensityLevel: phase.intensityLevel,
        weeklyStructure: cloneWeeklyStructure(phase.weeklyStructure),
        constructorStep: "qualities",
        completedSteps: ["range"],
    };
}

/** Fusiona el estado del formulario F2 en el PhaseDraft activo. */
export function mergeFormIntoPhaseDraft(
    phase: PhaseDraft,
    form: Pick<
        PeriodBlockFormState,
        | "startDate"
        | "endDate"
        | "qualities"
        | "volumeLevel"
        | "intensityLevel"
        | "weeklyStructure"
    >,
    maxReachedStep?: BlockAuthorStep,
): PhaseDraft {
    if (form.startDate == null || form.endDate == null) {
        return phase;
    }

    return {
        ...phase,
        startDate: form.startDate,
        endDate: form.endDate,
        qualities: cloneQualities(form.qualities),
        volumeLevel: form.volumeLevel,
        intensityLevel: form.intensityLevel,
        weeklyStructure: cloneWeeklyStructure(form.weeklyStructure),
        maxReachedStep: maxReachedStep ?? phase.maxReachedStep,
    };
}

/**
 * athleteRunSingleSetContext.ts — Contexto visual single_set = mismo shell que group_round.
 */

import type { AthleteFlatExercise } from "@nexia/shared/offline";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import {
    formatRunPrescriptionCompact,
    formatSingleSetHeroLabels,
} from "./athleteRunPresentation";

export function buildAthleteRunSingleSetContext(
    exercise: AthleteFlatExercise
): AthleteRunGroupContextView {
    const { badgeLabel, roundLabel } = formatSingleSetHeroLabels(exercise);
    const slotLabel = /^S\d+$/i.test(exercise.setLabel)
        ? exercise.setLabel.toUpperCase()
        : exercise.setLabel;

    return {
        groupKind: "single_set",
        sectionLabel: "Serie",
        groupBadgeLabel: badgeLabel,
        explanation: exercise.instruction?.trim() ?? "",
        roundLabel,
        slots: [
            {
                slotLabel,
                exerciseName: exercise.name,
                status: "upcoming",
                prescription: formatRunPrescriptionCompact(exercise),
            },
        ],
        nextExerciseName: null,
        transitionHint: null,
    };
}

export function buildSingleSetLoggingSummary(exercise: AthleteFlatExercise): string {
    const { badgeLabel, roundLabel } = formatSingleSetHeroLabels(exercise);
    return `${badgeLabel} · ${roundLabel}`;
}

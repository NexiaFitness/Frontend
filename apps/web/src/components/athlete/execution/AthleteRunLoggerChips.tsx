/**
 * AthleteRunLoggerChips.tsx — Acciones rápidas en logging_rest (SPEC §10).
 */

import React from "react";
import type { AthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunSuggestion } from "@nexia/shared/types/athleteRunSuggestion";
import { hasAthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import { shouldShowRunSuggestion } from "@nexia/shared/types/athleteRunSuggestion";
import {
    ATHLETE_RUN_LOGGER_CHIP,
    ATHLETE_RUN_LOGGER_CHIPS_ROW,
} from "./athleteRunPresentation";

export interface AthleteRunLoggerChipsProps {
    setIndex: number;
    reference: AthleteRunReferencePoint | null | undefined;
    suggestion: AthleteRunSuggestion | null | undefined;
    onApplyReference: () => void;
    onApplyPreviousSet: () => void;
    onApplySuggestion: () => void;
}

export const AthleteRunLoggerChips: React.FC<AthleteRunLoggerChipsProps> = ({
    setIndex,
    reference,
    suggestion,
    onApplyReference,
    onApplyPreviousSet,
    onApplySuggestion,
}) => {
    const hasReference = hasAthleteRunReferencePoint(reference);
    const showSuggestion = shouldShowRunSuggestion(suggestion);
    const showPreviousSet =
        setIndex > 1 &&
        hasReference &&
        reference.source === "same_session_previous_set";

    if (!hasReference && !showSuggestion) {
        return null;
    }

    return (
        <div className={ATHLETE_RUN_LOGGER_CHIPS_ROW}>
            {showPreviousSet ? (
                <button type="button" className={ATHLETE_RUN_LOGGER_CHIP} onClick={onApplyPreviousSet}>
                    Igual que serie anterior
                </button>
            ) : null}
            {hasReference ? (
                <button type="button" className={ATHLETE_RUN_LOGGER_CHIP} onClick={onApplyReference}>
                    Igual que referencia
                </button>
            ) : null}
            {showSuggestion ? (
                <button type="button" className={ATHLETE_RUN_LOGGER_CHIP} onClick={onApplySuggestion}>
                    Aplicar sugerencia
                </button>
            ) : null}
        </div>
    );
};

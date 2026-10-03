/**
 * AthleteSetInputLogger.tsx — Inputs serie (peso/reps/tiempo) compartidos FE-4.
 * Contexto: respeta inputMode del slot (P1-2) y paso ± configurable (P1-6).
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useMemo } from "react";
import type { AthleteRunInputMode } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { resolveWeightIncrementStepKg } from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import { AthleteRunRpePicker } from "@/components/athlete/execution/AthleteRunRpePicker";
import { AthleteLoggingNumericField } from "./AthleteLoggingNumericField";

export interface AthleteSetInputLoggerProps {
    inputMode?: AthleteRunInputMode;
    weight: number;
    reps: number;
    durationSeconds?: number;
    onWeightChange: (value: number) => void;
    onRepsChange: (value: number) => void;
    onDurationSecondsChange?: (value: number) => void;
    plannedWeight?: number | null;
    referenceWeightKg?: number | null;
    showRpe?: boolean;
    rpe?: number | null;
    onRpeChange?: (value: number | null) => void;
}

export const AthleteSetInputLogger: React.FC<AthleteSetInputLoggerProps> = ({
    inputMode = "weight_reps",
    weight,
    reps,
    durationSeconds = reps,
    onWeightChange,
    onRepsChange,
    onDurationSecondsChange,
    plannedWeight,
    referenceWeightKg,
    showRpe = true,
    rpe = null,
    onRpeChange,
}) => {
    const weightStep = useMemo(
        () =>
            resolveWeightIncrementStepKg({
                currentKg: weight,
                plannedKg: plannedWeight,
                referenceKg: referenceWeightKg,
            }),
        [plannedWeight, referenceWeightKg, weight]
    );

    if (inputMode === "duration") {
        return (
            <div className="space-y-5">
                <AthleteLoggingNumericField
                    label="Tiempo"
                    unit="s"
                    value={durationSeconds}
                    onChange={(value) =>
                        onDurationSecondsChange?.(value) ?? onRepsChange(value)
                    }
                    step={5}
                    min={1}
                    inputMode="numeric"
                />
                {showRpe && onRpeChange ? (
                    <AthleteRunRpePicker value={rpe} onChange={onRpeChange} />
                ) : null}
            </div>
        );
    }

    if (inputMode === "reps_only") {
        return (
            <div className="space-y-5">
                <AthleteLoggingNumericField
                    label="Repeticiones"
                    value={reps}
                    onChange={onRepsChange}
                    step={1}
                    min={1}
                    inputMode="numeric"
                />
                {showRpe && onRpeChange ? (
                    <AthleteRunRpePicker value={rpe} onChange={onRpeChange} />
                ) : null}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <AthleteLoggingNumericField
                label="Peso"
                unit="kg"
                value={weight}
                onChange={onWeightChange}
                step={weightStep}
                min={0}
                inputMode="decimal"
                allowDecimal
            />
            <AthleteLoggingNumericField
                label="Repeticiones"
                value={reps}
                onChange={onRepsChange}
                step={1}
                min={1}
                inputMode="numeric"
            />
            {showRpe && onRpeChange ? (
                <AthleteRunRpePicker value={rpe} onChange={onRpeChange} />
            ) : null}
        </div>
    );
};

/** Alias legacy — execution/* re-exporta este componente. */
export const AthleteSetLogger = AthleteSetInputLogger;

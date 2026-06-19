/**
 * AthleteSetLogger.tsx — Steppers peso/reps + RPE escala V07 (DESIGN §7.4).
 */

import React from "react";
import { AthleteRunStepperControl } from "./AthleteRunStepperControl";
import { AthleteRunRpePicker } from "./AthleteRunRpePicker";

export interface AthleteSetLoggerProps {
    weight: number;
    reps: number;
    onWeightChange: (value: number) => void;
    onRepsChange: (value: number) => void;
    /** Single set: RPE por serie. Batch slots: false y usar AthleteRoundEffortSection. */
    showRpe?: boolean;
    rpe?: number | null;
    onRpeChange?: (value: number | null) => void;
}

export const AthleteSetLogger: React.FC<AthleteSetLoggerProps> = ({
    weight,
    reps,
    onWeightChange,
    onRepsChange,
    showRpe = true,
    rpe = null,
    onRpeChange,
}) => {
    return (
        <div className="space-y-5">
            <AthleteRunStepperControl
                label="Peso"
                unit="kg"
                value={weight}
                onDecrease={() => onWeightChange(Math.max(0, weight - 2.5))}
                onIncrease={() => onWeightChange(weight + 2.5)}
                decreaseDisabled={weight <= 0}
            />

            <AthleteRunStepperControl
                label="Repeticiones"
                value={reps}
                onDecrease={() => onRepsChange(Math.max(1, reps - 1))}
                onIncrease={() => onRepsChange(reps + 1)}
                decreaseDisabled={reps <= 1}
            />

            {showRpe && onRpeChange ? (
                <AthleteRunRpePicker value={rpe} onChange={onRpeChange} />
            ) : null}
        </div>
    );
};
